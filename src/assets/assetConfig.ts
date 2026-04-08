import atlasUrl from '../../sprites.png';

export type SpriteKey =
  | 'player'
  | 'enemy01'
  | 'enemy02'
  | 'enemy03'
  | 'laserBlue'
  | 'laserRed'
  | 'pickupHealth'
  | 'pickupShield'
  | 'pickupAmmo'
  | 'pickupBoost'
  | 'explosion01'
  | 'explosion02'
  | 'explosion03';

export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const cellW = 256;
const cellH = 256;

function frame(col: number, row: number): FrameRect {
  return {
    x: col * cellW,
    y: row * cellH,
    w: cellW,
    h: cellH
  };
}

export const atlas = {
  url: atlasUrl,
  width: 1024,
  height: 1536,
  placeholders: {
    playerShip: '/assets/player-ship.png',
    enemy01: '/assets/enemy-01.png',
    enemy02: '/assets/enemy-02.png',
    enemy03: '/assets/enemy-03.png',
    laserBlue: '/assets/laser-blue.png',
    laserRed: '/assets/laser-red.png',
    pickupHealth: '/assets/pickup-health.png',
    pickupShield: '/assets/pickup-shield.png',
    pickupAmmo: '/assets/pickup-ammo.png',
    explosion01: '/assets/explosion-01.png',
    explosion02: '/assets/explosion-02.png',
    explosion03: '/assets/explosion-03.png'
  },
  frames: {
    player: frame(0, 0),
    enemy01: frame(1, 0),
    enemy02: frame(2, 0),
    enemy03: frame(3, 0),
    laserBlue: frame(0, 1),
    laserRed: frame(1, 1),
    pickupHealth: frame(2, 1),
    pickupShield: frame(3, 1),
    pickupAmmo: frame(0, 2),
    pickupBoost: frame(1, 2),
    explosion01: frame(2, 2),
    explosion02: frame(3, 2),
    explosion03: frame(0, 3)
  } satisfies Record<SpriteKey, FrameRect>
};
