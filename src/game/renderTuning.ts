export const CAMERA_ZOOM = 1;
export const SPRITE_SCALE = 0.35;

export const DRAW_SIZES = {
  player: {w: 1.725, h: 1.725},
  enemy: {w: 1.425, h: 1.425},
  projectile: {w: 0.28, h: 0.58},
  pickup: {w: 0.72, h: 0.72},
} as const;

export function getDpiSpriteScaleMultiplier(dpr: number): number {
  // Standard-density displays keep baseline scale; higher-density displays get a moderate bump.
  const clamped = Math.max(1, Math.min(3, dpr));
  return 1 + (clamped - 1) * 0.22;
}
