import type {Player} from "./types";

export const WORLD_WIDTH = 10;
export const WORLD_HEIGHT = 18;
export const HALF_WIDTH = WORLD_WIDTH / 2;
export const HALF_HEIGHT = WORLD_HEIGHT / 2;

export const PLAYER_BASE: Player = {
  position: {x: 0, y: -HALF_HEIGHT + 2.6},
  radius: 0.45,
  speed: 8.2,
  health: 100,
  maxHealth: 100,
  shield: 60,
  maxShield: 60,
  ammo: 180,
  maxAmmo: 220,
  shootCooldown: 0,
  boostTimer: 0,
  hitFlash: 0,
};

export const PICKUP_COLORS: Record<string, string> = {
  health: "#57f8a0",
  shield: "#4f8dff",
  ammo: "#ffd05b",
  boost: "#ff61d8",
};
