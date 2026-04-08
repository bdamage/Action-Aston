export const CAMERA_ZOOM = 1;
export const SPRITE_SCALE = 0.35;

export interface SpriteAlignmentEntry {
  w: number;
  h: number;
  radius: number;
}

export interface SpriteAlignmentTuning {
  player: SpriteAlignmentEntry;
  enemy: SpriteAlignmentEntry;
  projectile: SpriteAlignmentEntry;
  pickup: SpriteAlignmentEntry;
}

export const DEFAULT_ALIGNMENT_TUNING: SpriteAlignmentTuning = {
  player: {w: 2.5875, h: 2.5875, radius: 0.45},
  enemy: {w: 2.5875, h: 2.5875, radius: 0.42},
  projectile: {w: 0.45, h: 0.28, radius: 0.15},
  pickup: {w: 0.72, h: 0.72, radius: 0.4},
};

export const DRAW_SIZES = {
  player: {
    w: DEFAULT_ALIGNMENT_TUNING.player.w,
    h: DEFAULT_ALIGNMENT_TUNING.player.h,
  },
  enemy: {
    w: DEFAULT_ALIGNMENT_TUNING.enemy.w,
    h: DEFAULT_ALIGNMENT_TUNING.enemy.h,
  },
  projectile: {
    w: DEFAULT_ALIGNMENT_TUNING.projectile.w,
    h: DEFAULT_ALIGNMENT_TUNING.projectile.h,
  },
  pickup: {
    w: DEFAULT_ALIGNMENT_TUNING.pickup.w,
    h: DEFAULT_ALIGNMENT_TUNING.pickup.h,
  },
} as const;

export function cloneAlignmentTuning(): SpriteAlignmentTuning {
  return {
    player: {...DEFAULT_ALIGNMENT_TUNING.player},
    enemy: {...DEFAULT_ALIGNMENT_TUNING.enemy},
    projectile: {...DEFAULT_ALIGNMENT_TUNING.projectile},
    pickup: {...DEFAULT_ALIGNMENT_TUNING.pickup},
  };
}

export function getDpiSpriteScaleMultiplier(dpr: number): number {
  // Standard-density displays keep baseline scale; higher-density displays get a moderate bump.
  const clamped = Math.max(1, Math.min(3, dpr));
  return 1 + (clamped - 1) * 0.22;
}
