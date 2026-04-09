import {HALF_HEIGHT, HALF_WIDTH} from "../constants";
import type {Enemy, EnemyType, FormationType, GameState} from "../types";

const ENEMY_TYPES: EnemyType[] = ["enemy01", "enemy02", "enemy03"];
const LANE_COUNT = 9;
const FIRST_BOSS_WAVE = 10;
const FINAL_BOSS_WAVE = 20;

interface WavePattern {
  lanes: number[];
  formations: FormationType[];
  hpScale: number;
  speedMin: number;
  speedMax: number;
  trackMin: number;
  trackMax: number;
  fireMin: number;
  fireMax: number;
}

const WAVE_PATTERNS: WavePattern[] = [
  {
    lanes: [4, 1, 7, 2, 6, 0, 8, 3, 5],
    formations: ["random"],
    hpScale: 1,
    speedMin: 1.8,
    speedMax: 2.5,
    trackMin: 0.75,
    trackMax: 1.35,
    fireMin: 0.95,
    fireMax: 1.55,
  },
  {
    lanes: [0, 4, 8, 2, 6, 1, 7, 3, 5],
    formations: ["random", "V"],
    hpScale: 1.08,
    speedMin: 1.55,
    speedMax: 2.15,
    trackMin: 0.55,
    trackMax: 0.95,
    fireMin: 0.8,
    fireMax: 1.35,
  },
  {
    lanes: [2, 6, 1, 7, 0, 8, 3, 5, 4],
    formations: ["V", "diagonal-left", "diagonal-right"],
    hpScale: 0.92,
    speedMin: 2,
    speedMax: 2.85,
    trackMin: 0.35,
    trackMax: 0.7,
    fireMin: 1.15,
    fireMax: 1.95,
  },
  {
    lanes: [3, 5, 1, 7, 0, 8, 2, 6, 4],
    formations: ["diagonal-left", "diagonal-right", "arc", "pincer"],
    hpScale: 1.2,
    speedMin: 1.45,
    speedMax: 2.05,
    trackMin: 1,
    trackMax: 1.6,
    fireMin: 0.85,
    fireMax: 1.45,
  },
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = copy[i];
    copy[i] = copy[j];
    copy[j] = a;
  }
  return copy;
}

// ── Formation layout functions ────────────────────────────────────────────────
// Each returns world-space {x, y} positions for `count` enemies.
// Y increases upward (off-screen top = HALF_HEIGHT + offset).

function layoutRandom(
  count: number,
  pattern: WavePattern,
): Array<{x: number; y: number}> {
  const randomizedLanes = shuffled(pattern.lanes);
  return Array.from({length: count}, (_, i) => {
    const lane = randomizedLanes[i % randomizedLanes.length];
    const row = Math.floor(i / pattern.lanes.length);
    return {
      x: laneToX(lane) + rand(-0.2, 0.2),
      y: HALF_HEIGHT + 0.7 + row * 1.15 + rand(0.08, 0.35),
    };
  });
}

function layoutV(count: number): Array<{x: number; y: number}> {
  const positions: Array<{x: number; y: number}> = [];
  // slot 0 = apex (lowest Y = first to reach player)
  positions.push({x: rand(-0.12, 0.12), y: HALF_HEIGHT + 0.7});
  let rank = 1;
  let slot = 1;
  while (slot < count) {
    const xSpread = rank * 1.15;
    const yBack = rank * 0.9;
    if (slot < count) {
      positions.push({
        x: -Math.min(xSpread, HALF_WIDTH - 0.8) + rand(-0.1, 0.1),
        y: HALF_HEIGHT + 0.7 + yBack,
      });
      slot += 1;
    }
    if (slot < count) {
      positions.push({
        x: Math.min(xSpread, HALF_WIDTH - 0.8) + rand(-0.1, 0.1),
        y: HALF_HEIGHT + 0.7 + yBack,
      });
      slot += 1;
    }
    rank += 1;
  }
  return positions;
}

function layoutDiagonal(
  count: number,
  direction: "left" | "right",
): Array<{x: number; y: number}> {
  const xDir = direction === "right" ? 1 : -1;
  const spread = Math.min((count - 1) * 1.0, (HALF_WIDTH - 0.8) * 2);
  return Array.from({length: count}, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const x = xDir * (t * spread - spread / 2);
    return {
      x:
        Math.max(-HALF_WIDTH + 0.8, Math.min(HALF_WIDTH - 0.8, x)) +
        rand(-0.1, 0.1),
      y: HALF_HEIGHT + 0.7 + i * 0.72,
    };
  });
}

function layoutArc(count: number): Array<{x: number; y: number}> {
  const radius = Math.min(HALF_WIDTH - 0.8, count * 0.6);
  return Array.from({length: count}, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const theta = Math.PI * t; // 0 → π (right to left)
    return {
      x: Math.cos(theta) * radius + rand(-0.1, 0.1),
      y: HALF_HEIGHT + 0.7 + Math.sin(theta) * 1.1,
    };
  });
}

function layoutPincer(count: number): Array<{x: number; y: number}> {
  const leftCount = Math.ceil(count / 2);
  const rightCount = count - leftCount;
  const positions: Array<{x: number; y: number}> = [];
  for (let i = 0; i < leftCount; i += 1) {
    positions.push({
      x: -HALF_WIDTH + 1.0 + rand(-0.15, 0.15),
      y: HALF_HEIGHT + 0.7 + i * 0.7,
    });
  }
  for (let i = 0; i < rightCount; i += 1) {
    positions.push({
      x: HALF_WIDTH - 1.0 + rand(-0.15, 0.15),
      y: HALF_HEIGHT + 0.7 + i * 0.7,
    });
  }
  return positions;
}

function getAvailableFormations(
  wave: number,
  patternFormations: FormationType[],
): FormationType[] {
  let allowed: FormationType[];
  if (wave < 3) {
    allowed = ["random"];
  } else if (wave < 5) {
    allowed = ["random", "V"];
  } else if (wave < 8) {
    allowed = ["random", "V", "diagonal-left", "diagonal-right", "arc"];
  } else {
    allowed = [
      "random",
      "V",
      "diagonal-left",
      "diagonal-right",
      "arc",
      "pincer",
    ];
  }
  const filtered = patternFormations.filter((f) => allowed.includes(f));
  return filtered.length > 0 ? filtered : ["random"];
}

function getFormationLayout(
  formation: FormationType,
  count: number,
  pattern: WavePattern,
): Array<{x: number; y: number}> {
  switch (formation) {
    case "V":
      return layoutV(count);
    case "diagonal-left":
      return layoutDiagonal(count, "left");
    case "diagonal-right":
      return layoutDiagonal(count, "right");
    case "arc":
      return layoutArc(count);
    case "pincer":
      return layoutPincer(count);
    default:
      return layoutRandom(count, pattern);
  }
}

function laneToX(laneIndex: number) {
  const normalized = laneIndex / (LANE_COUNT - 1);
  return -HALF_WIDTH + 1 + normalized * (HALF_WIDTH * 2 - 2);
}

function spawnBoss(state: GameState, type: EnemyType): Enemy {
  const isFinal = type === "finalBoss";
  const baseHp = isFinal ? 820 : 520;
  const hp = Math.floor(baseHp + state.difficulty * (isFinal ? 70 : 48));

  return {
    id: state.nextEnemyId++,
    type,
    position: {x: 0, y: HALF_HEIGHT + 2.2},
    radius: state.alignment.enemy.radius * (isFinal ? 2.5 : 2.1),
    hp,
    maxHp: hp,
    speed: isFinal ? 0.9 : 1.1,
    trackStrength: isFinal ? 0.65 : 0.55,
    fireCooldown: isFinal ? 0.7 : 0.95,
    hitFlash: 0,
  };
}

export function updateSpawnTimer(state: GameState, dt: number): Enemy[] {
  if (state.enemies.length > 0) {
    state.spawnTimer = Math.max(state.spawnTimer, 0.85);
    return [];
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) {
    return [];
  }

  const nextWave = state.wave + 1;

  if (nextWave === FIRST_BOSS_WAVE) {
    state.wave = nextWave;
    state.spawnTimer = Math.max(1.2, 2 - state.difficulty * 0.03);
    return [spawnBoss(state, "firstBoss")];
  }

  if (nextWave === FINAL_BOSS_WAVE) {
    state.wave = nextWave;
    state.spawnTimer = Math.max(1.35, 2.2 - state.difficulty * 0.03);
    return [spawnBoss(state, "finalBoss")];
  }

  const pattern = WAVE_PATTERNS[(nextWave - 1) % WAVE_PATTERNS.length];
  const enemyCount = Math.min(
    nextWave >= 12 ? 8 : 6,
    2 + Math.floor(nextWave / 3) + Math.floor(state.difficulty / 3.2),
  );

  const availableFormations = getAvailableFormations(
    nextWave,
    pattern.formations,
  );
  const formation =
    availableFormations[randInt(0, availableFormations.length - 1)];
  const positions = getFormationLayout(formation, enemyCount, pattern);
  const holdTimer =
    formation === "random"
      ? 0
      : Math.max(0.4, Math.min(1.8, 1.8 - nextWave * 0.08));

  const spawned: Enemy[] = [];

  for (let i = 0; i < enemyCount; i += 1) {
    const pos = positions[i];
    const type = ENEMY_TYPES[randInt(0, ENEMY_TYPES.length - 1)];
    const hp = Math.floor((22 + state.difficulty * 6.5) * pattern.hpScale);

    spawned.push({
      id: state.nextEnemyId++,
      type,
      position: {x: pos.x, y: pos.y},
      radius: state.alignment.enemy.radius,
      hp,
      maxHp: hp,
      speed:
        rand(pattern.speedMin, pattern.speedMax) +
        state.difficulty * 0.16 +
        nextWave * 0.02,
      trackStrength:
        rand(pattern.trackMin, pattern.trackMax) +
        Math.min(0.35, nextWave * 0.02),
      fireCooldown: rand(pattern.fireMin, pattern.fireMax),
      hitFlash: 0,
      ...(holdTimer > 0 && {
        formationOffsetX: pos.x,
        formationHoldTimer: holdTimer,
      }),
    });
  }

  state.wave = nextWave;
  state.spawnTimer = Math.max(0.65, 1.55 - state.difficulty * 0.05);
  state.lastFormation = formation;
  return spawned;
}
