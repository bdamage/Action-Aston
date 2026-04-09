import {create} from "zustand";
import {HALF_HEIGHT, HALF_WIDTH, PLAYER_BASE} from "../constants";
import {cloneAlignmentTuning} from "../renderTuning";
import {clamp, intersects} from "../systems/collisionSystem";
import {maybeCreatePickup} from "../systems/pickupSystem";
import {
  buildEnemySpatialIndex,
  getNearbyEnemies,
} from "../systems/spatialHashSystem";
import {updateSpawnTimer} from "../systems/spawnSystem";
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
  step: (dt: number) => void;
}

function createBaseState(): GameState {
  const alignment = cloneAlignmentTuning();
  return {
    phase: "menu",
    score: 0,
    coinsCollected: 0,
    elapsed: 0,
    difficulty: 1,
    wave: 0,
    spawnTimer: 0.45,
    nextEnemyId: 1,
    nextProjectileId: 1,
    nextPickupId: 1,
    nextExplosionId: 1,
    nextCoinId: 1,
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

const SIMULATION_SPEED = 0.7;
const HIT_FLASH_DURATION = 0.16;
const BOSS_HOVER_DOWN_SHIFT = HALF_HEIGHT * 0.2;
const FIRST_BOSS_HOVER_Y = HALF_HEIGHT - 1.55 - BOSS_HOVER_DOWN_SHIFT;
const THIRD_BOSS_HOVER_Y = HALF_HEIGHT - 1.8 - BOSS_HOVER_DOWN_SHIFT;
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
  startGame: () =>
    set((state) => {
      if (state.phase === "playing") {
        return state;
      }
      const base = createBaseState();
      return {
        ...base,
        alignment: state.alignment,
        player: {
          ...base.player,
          radius: state.alignment.player.radius,
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
      return {
        ...base,
        phase: "playing",
        alignment: state.alignment,
        player: {
          ...base.player,
          radius: state.alignment.player.radius,
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

      player.shootCooldown = player.boostTimer > 0 ? 0.09 : 0.18;
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

    let score = state.score;
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

    const phase: GamePhase = player.health <= 0 ? "gameover" : "playing";

    set({
      phase,
      score,
      elapsed: nextElapsed,
      difficulty: nextDifficulty,
      wave: spawnState.wave,
      spawnTimer: spawnState.spawnTimer,
      nextEnemyId: spawnState.nextEnemyId,
      lastFormation: spawnState.lastFormation,
      nextProjectileId,
      nextPickupId,
      nextExplosionId,
      player,
      enemies: aliveEnemies.filter((enemy) => enemy.hp > 0),
      projectiles: activeProjectiles.filter(
        (projectile) => projectile.damage > 0,
      ),
      pickups: pickups.filter((pickup) => pickup.value > 0),
      explosions: explosions.slice(-70),
    });
  },
}));
