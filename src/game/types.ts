import type {SpriteAlignmentTuning} from "./renderTuning";

export type GamePhase =
  | "menu"
  | "alignment"
  | "playing"
  | "paused"
  | "gameover";

export type AlignmentSpriteKey = "player" | "enemy" | "projectile" | "pickup";
export type AlignmentField = "w" | "h" | "radius";

export type EnemyType = "enemy01" | "enemy02" | "enemy03";
export type PickupType = "health" | "shield" | "ammo" | "boost";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  position: Vector2;
  radius: number;
  speed: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  maxAmmo: number;
  shootCooldown: number;
  boostTimer: number;
  hitFlash: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  position: Vector2;
  radius: number;
  hp: number;
  speed: number;
  trackStrength: number;
  fireCooldown: number;
  hitFlash: number;
}

export interface Projectile {
  id: number;
  from: "player" | "enemy";
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
}

export interface Pickup {
  id: number;
  type: PickupType;
  position: Vector2;
  radius: number;
  value: number;
}

export interface Explosion {
  id: number;
  position: Vector2;
  ttl: number;
  maxTtl: number;
  scale: number;
}

export interface InputState {
  movement: Vector2;
  shooting: boolean;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  elapsed: number;
  difficulty: number;
  wave: number;
  spawnTimer: number;
  nextEnemyId: number;
  nextProjectileId: number;
  nextPickupId: number;
  nextExplosionId: number;
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  pickups: Pickup[];
  explosions: Explosion[];
  input: InputState;
  alignment: SpriteAlignmentTuning;
}
