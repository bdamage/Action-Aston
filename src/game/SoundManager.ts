import {Howl} from "howler";

type SoundKey = "shoot" | "explosion" | "pickup";

const SOUND_SOURCES: Record<SoundKey, string[]> = {
  // Add real files later, e.g. '/audio/shoot.mp3'. Empty arrays disable that sound safely.
  shoot: [],
  explosion: [],
  pickup: [],
};

function createSound(src: string[], volume: number): Howl | null {
  if (src.length === 0) {
    return null;
  }

  return new Howl({src, volume});
}

class SoundManager {
  private enabled = true;

  private shoot = createSound(SOUND_SOURCES.shoot, 0.22);
  private explosion = createSound(SOUND_SOURCES.explosion, 0.3);
  private pickup = createSound(SOUND_SOURCES.pickup, 0.24);

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playShoot() {
    if (this.enabled && this.shoot) this.shoot.play();
  }

  playExplosion() {
    if (this.enabled && this.explosion) this.explosion.play();
  }

  playPickup() {
    if (this.enabled && this.pickup) this.pickup.play();
  }
}

export const soundManager = new SoundManager();
