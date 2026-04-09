import {HALF_HEIGHT, HALF_WIDTH} from "../constants";
import type {Enemy, EnemyType, GameState} from "../types";

const ENEMY_TYPES: EnemyType[] = ["enemy01", "enemy02", "enemy03"];
const LANE_COUNT = 9;

interface WavePattern {
  lanes: number[];
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

function laneToX(laneIndex: number) {
  const normalized = laneIndex / (LANE_COUNT - 1);
  return -HALF_WIDTH + 1 + normalized * (HALF_WIDTH * 2 - 2);
}

function spawnBoss(state: GameState, type: EnemyType): Enemy {
  const isFinal = type === "finalBoss";
  const baseHp = isFinal ? 820 : 520;

  return {
    id: state.nextEnemyId++,
    type,
    position: {x: 0, y: HALF_HEIGHT + 2.2},
    radius: state.alignment.enemy.radius * (isFinal ? 2.5 : 2.1),
    hp: Math.floor(baseHp + state.difficulty * (isFinal ? 70 : 48)),
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

  if (nextWave === 6) {
    state.wave = nextWave;
    state.spawnTimer = Math.max(1.2, 2 - state.difficulty * 0.03);
    return [spawnBoss(state, "firstBoss")];
  }

  if (nextWave === 7) {
    state.wave = nextWave;
    state.spawnTimer = Math.max(1.35, 2.2 - state.difficulty * 0.03);
    return [spawnBoss(state, "finalBoss")];
  }

  const pattern = WAVE_PATTERNS[(nextWave - 1) % WAVE_PATTERNS.length];
  const enemyCount = Math.min(
    6,
    2 + Math.floor(nextWave / 3) + Math.floor(state.difficulty / 3.2),
  );
  const spawned: Enemy[] = [];

  for (let i = 0; i < enemyCount; i += 1) {
    const lane = pattern.lanes[i % pattern.lanes.length];
    const row = Math.floor(i / pattern.lanes.length);
    const type = ENEMY_TYPES[(nextWave + i) % ENEMY_TYPES.length];

    spawned.push({
      id: state.nextEnemyId++,
      type,
      position: {
        x: laneToX(lane) + rand(-0.12, 0.12),
        y: HALF_HEIGHT + 0.7 + row * 1.15 + rand(0.08, 0.35),
      },
      radius: state.alignment.enemy.radius,
      hp: Math.floor((22 + state.difficulty * 6.5) * pattern.hpScale),
      speed:
        rand(pattern.speedMin, pattern.speedMax) +
        state.difficulty * 0.16 +
        nextWave * 0.02,
      trackStrength:
        rand(pattern.trackMin, pattern.trackMax) + Math.min(0.35, nextWave * 0.02),
      fireCooldown: rand(pattern.fireMin, pattern.fireMax),
      hitFlash: 0,
    });
  }

  state.wave = nextWave;
  state.spawnTimer = Math.max(0.65, 1.55 - state.difficulty * 0.05);
  return spawned;
}
