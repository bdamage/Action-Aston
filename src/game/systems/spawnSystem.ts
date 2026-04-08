import {HALF_HEIGHT, HALF_WIDTH} from "../constants";
import type {Enemy, EnemyType, GameState} from "../types";

const ENEMY_TYPES: EnemyType[] = ["enemy01", "enemy02", "enemy03"];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function updateSpawnTimer(state: GameState, dt: number): Enemy[] {
  state.spawnTimer -= dt;
  if (state.spawnTimer > 0) {
    return [];
  }

  const enemyCount = Math.min(
    5,
    1 + Math.floor(state.elapsed / 14) + Math.floor(state.difficulty / 2.5),
  );
  const spawned: Enemy[] = [];

  for (let i = 0; i < enemyCount; i += 1) {
    const type = ENEMY_TYPES[(state.nextEnemyId + i) % ENEMY_TYPES.length];
    spawned.push({
      id: state.nextEnemyId++,
      type,
      position: {
        x: rand(-HALF_WIDTH + 1, HALF_WIDTH - 1),
        y: HALF_HEIGHT + rand(0.4, 2.4),
      },
      radius: state.alignment.enemy.radius,
      hp: 20 + Math.floor(state.difficulty * 6),
      speed: 1.6 + rand(0.15, 0.8) + state.difficulty * 0.18,
      trackStrength: 0.5 + Math.random() * 0.75,
      fireCooldown: rand(0.9, 1.8),
      hitFlash: 0,
    });
  }

  state.wave += 1;
  state.spawnTimer = Math.max(0.44, 1.6 - state.difficulty * 0.06);
  return spawned;
}
