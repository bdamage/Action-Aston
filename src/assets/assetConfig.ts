import atlasUrl from "../../sprites.png";

export type SpriteKey =
  | "player"
  | "enemy01"
  | "enemy02"
  | "enemy03"
  | "laserBlue"
  | "laserRed"
  | "pickupHealth"
  | "pickupShield"
  | "pickupAmmo"
  | "pickupBoost"
  | "explosion01"
  | "explosion02"
  | "explosion03";

export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function frame(x: number, y: number, w: number, h: number): FrameRect {
  return {x, y, w, h};
}

export const atlas = {
  url: atlasUrl,
  width: 1024,
  height: 1536,
  placeholders: {
    playerShip: "/assets/player-ship.png",
    enemy01: "/assets/enemy-01.png",
    enemy02: "/assets/enemy-02.png",
    enemy03: "/assets/enemy-03.png",
    laserBlue: "/assets/laser-blue.png",
    laserRed: "/assets/laser-red.png",
    pickupHealth: "/assets/pickup-health.png",
    pickupShield: "/assets/pickup-shield.png",
    pickupAmmo: "/assets/pickup-ammo.png",
    explosion01: "/assets/explosion-01.png",
    explosion02: "/assets/explosion-02.png",
    explosion03: "/assets/explosion-03.png",
  },
  frames: {
    player: frame(72, 211, 184, 166),
    enemy01: frame(302, 210, 186, 168),
    enemy02: frame(536, 206, 183, 172),
    enemy03: frame(765, 205, 184, 174),
    laserBlue: frame(65, 470, 180, 100),
    laserRed: frame(305, 470, 185, 100),
    pickupHealth: frame(520, 455, 90, 94),
    pickupShield: frame(761, 455, 100, 100),
    pickupAmmo: frame(615, 455, 105, 95),
    pickupBoost: frame(870, 455, 70, 100),
    explosion01: frame(66, 870, 185, 120),
    explosion02: frame(66, 1088, 185, 120),
    explosion03: frame(66, 1308, 185, 120),
  } satisfies Record<SpriteKey, FrameRect>,
};
