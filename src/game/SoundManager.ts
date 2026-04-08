import { Howl } from 'howler';

class SoundManager {
  private enabled = true;

  private shoot = new Howl({ src: [], volume: 0.22 });
  private explosion = new Howl({ src: [], volume: 0.3 });
  private pickup = new Howl({ src: [], volume: 0.24 });

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playShoot() {
    if (this.enabled) this.shoot.play();
  }

  playExplosion() {
    if (this.enabled) this.explosion.play();
  }

  playPickup() {
    if (this.enabled) this.pickup.play();
  }
}

export const soundManager = new SoundManager();
