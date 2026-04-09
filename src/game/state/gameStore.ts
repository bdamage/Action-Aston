import {create} from "zustand";
import {HALF_HEIGHT, HALF_WIDTH, PLAYER_BASE} from "../constants";
import {
  useGarageStore,
  weaponShootCooldown,
  shieldMaxForLevel,
  startingBoostTimer,
} from "./garageStore";
import {cloneAlignmentTuning} from "../renderTuning";
import {clamp, intersects} from "../systems/collisionSystem";
import {createPickup, maybeCreatePickup} from "../systems/pickupSystem";
import {
  buildEnemySpatialIndex,
  getNearbyEnemies,
} from "../systems/spatialHashSystem";
import {BOSS_WAVES, updateSpawnTimer} from "../systems/spawnSystem";
import {soundManager} from "../SoundManager";
import type {
  AlignmentField,
  AlignmentSpriteKey,
  Coin,
  Enemy,
  Explosion,
  GamePhase,
  GameState,
  Pickup,
  PickupType,
  Projectile,
  Vector2,
} from "../types";

interface GameStore extends GameState {
  showHitboxes: boolean;
  startGame: () => void;
  startAlignment: () => void;
  restartGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setAlignmentValue: (
    sprite: AlignmentSpriteKey,
    field: AlignmentField,
    value: number,
  ) => void;
  resetAlignment: () => void;
  toggleHitboxes: () => void;
  setMovement: (movement: Vector2) => void;
  setShooting: (shooting: boolean) => void;
  quickForwardToBoss: (slot: number) => void;
  /** Deducts `amount` from totalCoins if sufficient funds. Returns true on success. */
  spendCoins: (amount: number) => boolean;
  step: (dt: number) => void;
}

const TOTAL_COINS_KEY = "actionAston_totalCoins";

function loadTotalCoins(): number {
  try {
    const raw = localStorage.getItem(TOTAL_COINS_KEY);
    if (raw !== null) return Math.max(0, parseInt(raw, 10) || 0);
  } catch {}
  return 0;
}

function saveTotalCoins(total: number): void {
  try {
    localStorage.setItem(TOTAL_COINS_KEY, String(total));
  } catch {}
}

function createBaseState(): GameState {
  const alignment = cloneAlignmentTuning();
  return {
    phase: "menu",
    score: 0,
    coinsCollected: 0,
    totalCoins: loadTotalCoins(),
    elapsed: 0,
    difficulty: 1,
    wave: 0,
    spawnTimer: 0.45,
    pickupDropTimer: 10 + Math.random() * 5,
    nextEnemyId: 1,
    nextProjectileId: 1,
    nextPickupId: 1,
    nextExplosionId: 1,
    nextCoinId: 1,
    screenShake: 0,
    player: {
      ...PLAYER_BASE,
      position: {...PLAYER_BASE.position},
      radius: alignment.player.radius,
    },
    enemies: [],
    projectiles: [],
    pickups: [],
    coins: [],
    explosions: [],
    alignment,
    lastFormation: null,
    input: {
      movement: {x: 0, y: 0},
      shooting: false,
    },
  };
}

function normalizeMovement(x: number, y: number) {
  const mag = Math.hypot(x, y);
  if (mag <= 1) return {x, y};
  return {x: x / mag, y: y / mag};
}

function bossWaveForSlot(slot: number) {
  const index = Math.min(
    BOSS_WAVES.length - 1,
    Math.max(0, Math.floor(slot) - 1),
  );
  return BOSS_WAVES[index];
}

const SIMULATION_SPEED = 0.7;
const HIT_FLASH_DURATION = 0.16;
const BOSS_HOVER_DOWN_SHIFT = HALF_HEIGHT * 0.2;
const FIRST_BOSS_HOVER_Y = HALF_HEIGHT - 1.55 - BOSS_HOVER_DOWN_SHIFT;
// Third boss sits lower so the encounter feels more aggressive and readable.
const THIRD_BOSS_HOVER_Y = HALF_HEIGHT - 3.1 - BOSS_HOVER_DOWN_SHIFT;
const FINAL_BOSS_HOVER_Y = HALF_HEIGHT - 2.05 - BOSS_HOVER_DOWN_SHIFT;

function isBossEnemy(enemy: Enemy) {
  return (
    enemy.type === "firstBoss" ||
    enemy.type === "thirdBoss" ||
    enemy.type === "finalBoss"
  );
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createBaseState(),
  showHitboxes: false,
  setMovement: (movement) =>
    set((state) => ({
      input: {
        ...state.input,
        movement: normalizeMovement(movement.x, movement.y),
      },
    })),
  setShooting: (shooting) =>
    set((state) => ({
      input: {...state.input, shooting},
    })),
  quickForwardToBoss: (slot) =>
    set((state) => {
      if (state.phase !== "playing" && state.phase !== "paused") {
        return state;
      }

      const targetBossWave = bossWaveForSlot(slot);
      if (!targetBossWave || state.wave >= targetBossWave) {
        return state;
      }

      return {
        wave: targetBossWave - 1,
        spawnTimer: 0,
        enemies: [],
        projectiles: [],
        pickups: [],
        coins: [],
        explosions: [],
        lastFormation: null,
        input: {
          ...state.input,
          movement: {x: 0, y: 0},
          shooting: false,
        },
      };
    }),
  setPhase: (phase) => set({phase}),
  setAlignmentValue: (sprite, field, value) =>
    set((state) => {
      const nextAlignment = {
        ...state.alignment,
        [sprite]: {
          ...state.alignment[sprite],
          [field]: value,
        },
      };

      return {
        alignment: nextAlignment,
        player:
          sprite === "player" && field === "radius"
            ? {...state.player, radius: value}
            : state.player,
      };
    }),
  resetAlignment: () =>
    set((state) => {
      const alignment = cloneAlignmentTuning();
      return {
        alignment,
        player: {...state.player, radius: alignment.player.radius},
      };
    }),
  toggleHitboxes: () => set((state) => ({showHitboxes: !state.showHitboxes})),
  spendCoins: (amount) => {
    const {totalCoins} = get();
    if (totalCoins < amount) return false;
    const next = totalCoins - amount;
    saveTotalCoins(next);
    set({totalCoins: next});
    return true;
  },
  startGame: () =>
    set((state) => {
      if (state.phase === "playing") {
        return state;
      }
      const base = createBaseState();
      const storedCoins = loadTotalCoins();
      const garage = useGarageStore.getState();
      const maxShield = shieldMaxForLevel(garage.shieldLevel);
      return {
        ...base,
        totalCoins: storedCoins,
        alignment: state.alignment,
        player: {
          ...base.player,
          radius: state.alignment.player.radius,
          baseShootCooldown: weaponShootCooldown(garage.weaponLevel),
          maxShield,
          shield: maxShield,
          boostTimer: startingBoostTimer(garage.boostLevel),
        },
        phase: "playing",
      };
    }),
  startAlignment: () =>
    set((state) => ({
      ...createBaseState(),
      phase: "alignment",
      alignment: state.alignment,
      player: {
        ...PLAYER_BASE,
        position: {x: 0, y: 0},
        radius: state.alignment.player.radius,
      },
    })),
  restartGame: () =>
    set((state) => {
      const base = createBaseState();
      const storedCoins = loadTotalCoins();
      const garage = useGarageStore.getState();
      const maxShield = shieldMaxForLevel(garage.shieldLevel);
      return {
        ...base,
        totalCoins: storedCoins,
        phase: "playing",
        alignment: state.alignment,
        player: {
          ...base.player,
          radius: state.alignment.player.radius,
          baseShootCooldown: weaponShootCooldown(garage.weaponLevel),
          maxShield,
          shield: maxShield,
          boostTimer: startingBoostTimer(garage.boostLevel),
        },
      };
    }),
  step: (dt) => {
    const frameDt = dt * SIMULATION_SPEED;
    const state = get();
    if (state.phase !== "playing") {
      return;
    }

    const nextElapsed = state.elapsed + frameDt;
    const nextDifficulty = 1 + nextElapsed * 0.05;

    let screenShake = Math.max(0, state.screenShake - frameDt);

    const player = {
      ...state.player,
      position: {...state.player.position},
      radius: state.alignment.player.radius,
      shootCooldown: Math.max(0, state.player.shootCooldown - frameDt),
      boostTimer: Math.max(0, state.player.boostTimer - frameDt),
      hitFlash: Math.max(0, state.player.hitFlash - frameDt),
    };

    player.position.x = clamp(
      player.position.x + state.input.movement.x * player.speed * frameDt,
      -HALF_WIDTH + player.radius,
      HALF_WIDTH - player.radius,
    );
    player.position.y = clamp(
      player.position.y + state.input.movement.y * player.speed * frameDt,
      -HALF_HEIGHT + player.radius,
      HALF_HEIGHT - player.radius,
    );

    const projectiles: Projectile[] = state.projectiles.map((projectile) => ({
      ...projectile,
      position: {
        x: projectile.position.x + projectile.velocity.x * frameDt,
        y: projectile.position.y + projectile.velocity.y * frameDt,
      },
    }));

    let nextProjectileId = state.nextProjectileId;
    let nextPickupId = state.nextPickupId;
    let nextExplosionId = state.nextExplosionId;
    let nextCoinId = state.nextCoinId;

    if (state.input.shooting && player.shootCooldown <= 0 && player.ammo > 0) {
      const spread = player.boostTimer > 0 ? [-0.14, 0, 0.14] : [0];
      for (const offset of spread) {
        projectiles.push({
          id: nextProjectileId++,
          from: "player",
          position: {
            x: player.position.x + offset,
            y: player.position.y + 0.52,
          },
          velocity: {x: 0, y: 14},
          radius: state.alignment.projectile.radius,
          damage: player.boostTimer > 0 ? 20 : 12,
        });
      }

      player.shootCooldown =
        player.boostTimer > 0
          ? player.baseShootCooldown / 2
          : player.baseShootCooldown;
      player.ammo = Math.max(0, player.ammo - 1);
      soundManager.playShoot();
    }

    const spawnState: GameState = {
      ...state,
      elapsed: nextElapsed,
      difficulty: nextDifficulty,
      spawnTimer: state.spawnTimer,
      nextEnemyId: state.nextEnemyId,
      wave: state.wave,
    };
    const spawnedEnemies = updateSpawnTimer(spawnState, frameDt);

    const enemies: Enemy[] = [...state.enemies, ...spawnedEnemies].map(
      (enemy) => {
        const isHolding =
          !isBossEnemy(enemy) && (enemy.formationHoldTimer ?? 0) > 0;
        const targetX = isHolding
          ? (enemy.formationOffsetX ?? player.position.x)
          : player.position.x;
        const trackDx = targetX - enemy.position.x;
        const effectiveTrack = isHolding
          ? enemy.trackStrength * 0.5
          : enemy.trackStrength;
        const maxTrackDelta = isBossEnemy(enemy)
          ? 0.7 * frameDt
          : 1.2 * frameDt;
        const adjustX = clamp(
          trackDx * effectiveTrack * frameDt,
          -maxTrackDelta,
          maxTrackDelta,
        );
        const fireCooldown = enemy.fireCooldown - frameDt;
        const nextY = isBossEnemy(enemy)
          ? Math.max(
              enemy.type === "finalBoss"
                ? FINAL_BOSS_HOVER_Y
                : enemy.type === "thirdBoss"
                  ? THIRD_BOSS_HOVER_Y
                  : FIRST_BOSS_HOVER_Y,
              enemy.position.y - enemy.speed * frameDt,
            )
          : enemy.position.y - enemy.speed * frameDt;

        return {
          ...enemy,
          position: {
            x: enemy.position.x + adjustX,
            y: nextY,
          },
          fireCooldown,
          hitFlash: Math.max(0, enemy.hitFlash - frameDt),
          formationHoldTimer: isHolding
            ? Math.max(0, (enemy.formationHoldTimer ?? 0) - frameDt)
            : enemy.formationHoldTimer,
        };
      },
    );

    for (const enemy of enemies) {
      if (enemy.fireCooldown <= 0) {
        const dx = player.position.x - enemy.position.x;
        const dy = player.position.y - enemy.position.y;
        const inv = 1 / Math.max(0.001, Math.hypot(dx, dy));
        projectiles.push({
          id: nextProjectileId++,
          from: "enemy",
          position: {x: enemy.position.x, y: enemy.position.y - 0.3},
          velocity: {x: dx * inv * 6.5, y: dy * inv * 6.5},
          radius: state.alignment.projectile.radius,
          damage: 9 + nextDifficulty,
        });
        enemy.fireCooldown =
          Math.max(0.6, 1.6 - nextDifficulty * 0.08) + Math.random() * 0.6;
      }
    }

    const explosions: Explosion[] = state.explosions
      .map((explosion) => ({...explosion, ttl: explosion.ttl - frameDt}))
      .filter((explosion) => explosion.ttl > 0);

    const pickups: Pickup[] = state.pickups
      .map((pickup) => ({
        ...pickup,
        position: {x: pickup.position.x, y: pickup.position.y - frameDt * 1.2},
      }))
      .filter((pickup) => pickup.position.y > -HALF_HEIGHT - 1);

    const coins: Coin[] = state.coins
      .map((coin) => ({
        ...coin,
        position: {
          x: coin.position.x + coin.vx * frameDt,
          y: coin.position.y - frameDt * 1.2,
        },
      }))
      .filter((coin) => coin.value > 0 && coin.position.y > -HALF_HEIGHT - 1);

    let score = state.score;
    let coinsCollected = state.coinsCollected;
    const enemyIndex = buildEnemySpatialIndex(enemies, 1.25);

    for (const projectile of projectiles) {
      if (projectile.from !== "player") continue;
      const nearbyEnemies = getNearbyEnemies(
        enemyIndex,
        projectile.position.x,
        projectile.position.y,
        projectile.radius + 0.9,
      );

      for (const enemy of nearbyEnemies) {
        if (enemy.hp <= 0) continue;
        if (
          !intersects(
            projectile.position,
            projectile.radius,
            enemy.position,
            enemy.radius,
          )
        )
          continue;

        enemy.hp -= projectile.damage;
        enemy.hitFlash = HIT_FLASH_DURATION;
        projectile.damage = 0;

        if (enemy.hp <= 0) {
          score += 100;
          explosions.push({
            id: nextExplosionId++,
            position: {...enemy.position},
            ttl: 0.4,
            maxTtl: 0.4,
            scale: 1.2,
          });

          const isLastEnemy = enemies.filter((e) => e.hp > 0).length === 0;
          if (isLastEnemy) {
            const maybePickup = maybeCreatePickup(
              nextPickupId++,
              enemy.position.x,
              enemy.position.y,
              0.27,
              state.alignment.pickup.radius,
            );
            if (maybePickup) {
              pickups.push(maybePickup);
            }
          }

          if (isBossEnemy(enemy)) {
            const BOSS_COIN_COUNT = 15;
            for (let i = 0; i < BOSS_COIN_COUNT; i++) {
              const angle = (i / BOSS_COIN_COUNT) * Math.PI * 2;
              const spreadR = 0.5 + Math.random() * 0.5;
              coins.push({
                id: nextCoinId++,
                position: {
                  x: enemy.position.x + Math.cos(angle) * spreadR,
                  y: enemy.position.y + Math.sin(angle) * spreadR * 0.5,
                },
                radius: 0.28,
                vx: Math.cos(angle) * (0.8 + Math.random() * 0.6),
                value: 100,
              });
            }
          } else {
            coins.push({
              id: nextCoinId++,
              position: {x: enemy.position.x, y: enemy.position.y},
              radius: 0.28,
              vx: (Math.random() - 0.5) * 1.2,
              value: 100,
            });
          }

          soundManager.playExplosion();
        }

        if (projectile.damage <= 0) {
          break;
        }
      }
    }

    const aliveEnemies = enemies.filter(
      (enemy) => enemy.hp > 0 && enemy.position.y > -HALF_HEIGHT - 2,
    );
    const activeProjectiles = projectiles.filter(
      (projectile) =>
        projectile.damage > 0 &&
        projectile.position.y > -HALF_HEIGHT - 2 &&
        projectile.position.y < HALF_HEIGHT + 2,
    );

    for (const enemy of aliveEnemies) {
      if (
        !intersects(
          enemy.position,
          enemy.radius,
          player.position,
          player.radius,
        )
      )
        continue;
      enemy.hp = 0;
      player.hitFlash = HIT_FLASH_DURATION;
      screenShake = HIT_FLASH_DURATION;
      if (player.shield > 0) {
        player.shield = Math.max(0, player.shield - 22);
      } else {
        player.health = Math.max(0, player.health - 18);
      }
      explosions.push({
        id: nextExplosionId++,
        position: {...enemy.position},
        ttl: 0.35,
        maxTtl: 0.35,
        scale: 1.3,
      });
    }

    for (const projectile of activeProjectiles) {
      if (projectile.from !== "enemy") continue;
      if (
        !intersects(
          projectile.position,
          projectile.radius,
          player.position,
          player.radius,
        )
      )
        continue;
      const hitDamage = projectile.damage;
      projectile.damage = 0;
      player.hitFlash = HIT_FLASH_DURATION;
      screenShake = HIT_FLASH_DURATION;
      if (player.shield > 0) {
        player.shield = Math.max(0, player.shield - hitDamage);
      } else {
        player.health = Math.max(0, player.health - hitDamage);
      }
    }

    for (const pickup of pickups) {
      if (
        !intersects(
          pickup.position,
          pickup.radius,
          player.position,
          player.radius,
        )
      )
        continue;
      const value = pickup.value;
      pickup.value = 0;
      if (pickup.type === "health") {
        player.health = Math.min(player.maxHealth, player.health + value + 18);
      }
      if (pickup.type === "shield") {
        player.shield = Math.min(player.maxShield, player.shield + value + 18);
      }
      if (pickup.type === "ammo") {
        player.ammo = Math.min(player.maxAmmo, player.ammo + value + 16);
      }
      if (pickup.type === "boost") {
        player.boostTimer = Math.min(12, player.boostTimer + 5.5);
      }
      soundManager.playPickup();
    }

    for (const coin of coins) {
      if (coin.value <= 0) continue;
      if (
        !intersects(coin.position, coin.radius, player.position, player.radius)
      )
        continue;
      coinsCollected += coin.value;
      coin.value = 0;
      soundManager.playPickup();
    }

    // ── Timed random ammo drops ───────────────────────────────────────────────
    let pickupDropTimer = state.pickupDropTimer - frameDt;
    if (pickupDropTimer <= 0) {
      const x = (Math.random() - 0.5) * (HALF_WIDTH * 1.6);
      const timedType: PickupType = Math.random() < 0.35 ? "ammo" : "health";
      pickups.push(
        createPickup(
          nextPickupId++,
          x,
          HALF_HEIGHT * 0.5,
          timedType,
          state.alignment.pickup.radius,
        ),
      );
      pickupDropTimer = 14 + Math.random() * 8;
    }

    // ── Guaranteed drops when wave is cleared ─────────────────────────────────
    const waveJustCleared =
      state.enemies.length > 0 && aliveEnemies.length === 0;
    if (waveJustCleared) {
      const clearType: PickupType = Math.random() < 0.4 ? "ammo" : "health";
      pickups.push(
        createPickup(
          nextPickupId++,
          (Math.random() - 0.5) * 1.0,
          HALF_HEIGHT * 0.2,
          clearType,
          state.alignment.pickup.radius,
        ),
      );
    }

    const phase: GamePhase = player.health <= 0 ? "gameover" : "playing";

    let totalCoins = state.totalCoins;
    if (phase === "gameover") {
      totalCoins = state.totalCoins + coinsCollected;
      saveTotalCoins(totalCoins);
    }

    set({
      phase,
      score,
      coinsCollected,
      totalCoins,
      elapsed: nextElapsed,
      difficulty: nextDifficulty,
      wave: spawnState.wave,
      spawnTimer: spawnState.spawnTimer,
      pickupDropTimer,
      nextEnemyId: spawnState.nextEnemyId,
      lastFormation: spawnState.lastFormation,
      nextProjectileId,
      nextPickupId,
      nextExplosionId,
      nextCoinId,
      screenShake,
      player,
      enemies: aliveEnemies.filter((enemy) => enemy.hp > 0),
      projectiles: activeProjectiles.filter(
        (projectile) => projectile.damage > 0,
      ),
      pickups: pickups.filter((pickup) => pickup.value > 0),
      coins: coins.filter((coin) => coin.value > 0),
      explosions: explosions.slice(-70),
    });
  },
}));
