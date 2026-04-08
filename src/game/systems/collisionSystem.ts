import type { Vector2 } from '../types';

export function intersects(a: Vector2, ar: number, b: Vector2, br: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= (ar + br) * (ar + br);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
