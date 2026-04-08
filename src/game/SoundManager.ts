import {Howl} from "howler";
import gameplayMusicUrl from "../assets/music_gameplay.mp3";
import leaderboardMusicUrl from "../assets/music_leaderboard.mp3";
import titleMusicUrl from "../assets/music_title01.mp3";

type SoundKey = "shoot" | "explosion" | "pickup";
export type MusicTrack = "title" | "gameplay" | "leaderboard";
export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

const SOUND_SOURCES: Record<SoundKey, string[]> = {
  // Add real files later, e.g. '/audio/shoot.mp3'. Empty arrays disable that sound safely.
  shoot: [],
  explosion: [],
  pickup: [],
};

const MUSIC_SOURCES: Record<MusicTrack, string> = {
  title: titleMusicUrl,
  gameplay: gameplayMusicUrl,
  leaderboard: leaderboardMusicUrl,
};

function createSound(src: string[], volume: number): Howl | null {
  if (src.length === 0) {
    return null;
  }

  return new Howl({src, volume});
}

class SoundManager {
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicVolume = 1;
  private sfxVolume = 1;
  private activeMusicTrack: MusicTrack | null = null;

  private shoot = createSound(SOUND_SOURCES.shoot, 0.22);
  private explosion = createSound(SOUND_SOURCES.explosion, 0.3);
  private pickup = createSound(SOUND_SOURCES.pickup, 0.24);

  private music: Record<MusicTrack, Howl> = {
    title: new Howl({
      src: [MUSIC_SOURCES.title],
      volume: 0.34 * this.musicVolume,
      loop: true,
      html5: true,
    }),
    gameplay: new Howl({
      src: [MUSIC_SOURCES.gameplay],
      volume: 0.4 * this.musicVolume,
      loop: true,
      html5: true,
    }),
    leaderboard: new Howl({
      src: [MUSIC_SOURCES.leaderboard],
      volume: 0.36 * this.musicVolume,
      loop: true,
      html5: true,
    }),
  };

  private readonly baseMusicVolume: Record<MusicTrack, number> = {
    title: 0.34,
    gameplay: 0.4,
    leaderboard: 0.36,
  };

  private readonly baseSfxVolume: Record<SoundKey, number> = {
    shoot: 0.22,
    explosion: 0.3,
    pickup: 0.24,
  };

  private clampVolume(volume: number) {
    return Math.max(0, Math.min(1, volume));
  }

  private applyMusicVolume() {
    for (const [track, howl] of Object.entries(this.music) as [
      MusicTrack,
      Howl,
    ][]) {
      howl.volume(this.baseMusicVolume[track] * this.musicVolume);
    }
  }

  private applySfxVolume() {
    if (this.shoot)
      this.shoot.volume(this.baseSfxVolume.shoot * this.sfxVolume);
    if (this.explosion)
      this.explosion.volume(this.baseSfxVolume.explosion * this.sfxVolume);
    if (this.pickup)
      this.pickup.volume(this.baseSfxVolume.pickup * this.sfxVolume);
  }

  getSettings(): AudioSettings {
    return {
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  setEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.sfxEnabled = enabled;

    if (!this.musicEnabled) {
      this.stopMusic();
      return;
    }

    if (this.activeMusicTrack) {
      this.playMusic(this.activeMusicTrack);
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
      return;
    }

    if (this.activeMusicTrack) {
      this.playMusic(this.activeMusicTrack);
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  setMusicVolume(volume: number) {
    this.musicVolume = this.clampVolume(volume);
    this.applyMusicVolume();
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = this.clampVolume(volume);
    this.applySfxVolume();
  }

  playMusic(track: MusicTrack) {
    this.activeMusicTrack = track;

    if (!this.musicEnabled) {
      return;
    }

    for (const [key, sound] of Object.entries(this.music) as [
      MusicTrack,
      Howl,
    ][]) {
      if (key !== track && sound.playing()) {
        sound.stop();
      }
    }

    const selectedTrack = this.music[track];
    if (!selectedTrack.playing()) {
      selectedTrack.play();
    }
  }

  stopMusic() {
    for (const sound of Object.values(this.music)) {
      if (sound.playing()) {
        sound.stop();
      }
    }
  }

  playShoot() {
    if (this.sfxEnabled && this.shoot) this.shoot.play();
  }

  playExplosion() {
    if (this.sfxEnabled && this.explosion) this.explosion.play();
  }

  playPickup() {
    if (this.sfxEnabled && this.pickup) this.pickup.play();
  }
}

export const soundManager = new SoundManager();
