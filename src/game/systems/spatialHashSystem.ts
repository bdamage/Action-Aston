import type {Enemy} from "../types";

interface EnemySpatialIndex {
  cellSize: number;
  buckets: Map<string, Enemy[]>;
}

function hash(cx: number, cy: number) {
  return `${cx},${cy}`;
}

function toCell(value: number, cellSize: number) {
  return Math.floor(value / cellSize);
}

export function buildEnemySpatialIndex(
  enemies: Enemy[],
  cellSize = 1.25,
): EnemySpatialIndex {
  const buckets = new Map<string, Enemy[]>();

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const cx = toCell(enemy.position.x, cellSize);
    const cy = toCell(enemy.position.y, cellSize);
    const key = hash(cx, cy);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(enemy);
    } else {
      buckets.set(key, [enemy]);
    }
  }

  return {cellSize, buckets};
}

export function getNearbyEnemies(
  index: EnemySpatialIndex,
  x: number,
  y: number,
  radius: number,
): Enemy[] {
  const minX = toCell(x - radius, index.cellSize);
  const maxX = toCell(x + radius, index.cellSize);
  const minY = toCell(y - radius, index.cellSize);
  const maxY = toCell(y + radius, index.cellSize);

  const nearby: Enemy[] = [];
  for (let cy = minY; cy <= maxY; cy += 1) {
    for (let cx = minX; cx <= maxX; cx += 1) {
      const bucket = index.buckets.get(hash(cx, cy));
      if (!bucket) continue;
      for (const enemy of bucket) {
        nearby.push(enemy);
      }
    }
  }

  return nearby;
}
