import {Howl, Howler} from "howler";
import bossMusicUrl from "../assets/music_boss.mp3";
import gameplayMusicUrl from "../assets/music_gameplay.mp3";
import leaderboardMusicUrl from "../assets/music_leaderboard.mp3";
import titleMusicUrl from "../assets/music_title01.mp3";

type SoundKey = "shoot" | "explosion" | "pickup";
export type MusicTrack = "title" | "gameplay" | "boss" | "leaderboard";
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
  boss: bossMusicUrl,
  leaderboard: leaderboardMusicUrl,
};

const DEFAULT_MUSIC_FADE_MS = 900;

// Keep a larger HTML5 pool for browser fallbacks while preferring Web Audio.
Howler.html5PoolSize = Math.max(Howler.html5PoolSize, 24);

function createSound(src: string[], volume: number): Howl | null {
  if (src.length === 0) {
    return null;
  }

  return new Howl({src, volume});
}

class SoundManager {
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicVolume = 0.7;
  private sfxVolume = 1;
  private audioUnlocked = false;
  private activeMusicTrack: MusicTrack | null = null;
  private musicStopTimers: Partial<
    Record<MusicTrack, ReturnType<typeof setTimeout>>
  > = {};

  private shoot = createSound(SOUND_SOURCES.shoot, 0.22);
  private explosion = createSound(SOUND_SOURCES.explosion, 0.3);
  private pickup = createSound(SOUND_SOURCES.pickup, 0.24);
  private sfxContext: AudioContext | null = null;
  private sfxMasterGain: GainNode | null = null;

  private music: Record<MusicTrack, Howl> = {
    title: new Howl({
      src: [MUSIC_SOURCES.title],
      volume: 0.34 * this.musicVolume,
      loop: true,
    }),
    gameplay: new Howl({
      src: [MUSIC_SOURCES.gameplay],
      volume: 0.4 * this.musicVolume,
      loop: true,
    }),
    boss: new Howl({
      src: [MUSIC_SOURCES.boss],
      volume: 0.48 * this.musicVolume,
      loop: true,
    }),
    leaderboard: new Howl({
      src: [MUSIC_SOURCES.leaderboard],
      volume: 0.36 * this.musicVolume,
      loop: true,
    }),
  };

  private readonly baseMusicVolume: Record<MusicTrack, number> = {
    title: 0.34,
    gameplay: 0.4,
    boss: 0.48,
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

  private clearPendingStop(track: MusicTrack) {
    const timer = this.musicStopTimers[track];
    if (timer) {
      clearTimeout(timer);
      delete this.musicStopTimers[track];
    }
  }

  private targetMusicVolume(track: MusicTrack) {
    return this.baseMusicVolume[track] * this.musicVolume;
  }

  private fadeOutAndStop(track: MusicTrack, fadeMs: number) {
    const sound = this.music[track];
    if (!sound.playing()) {
      return;
    }

    this.clearPendingStop(track);
    sound.fade(sound.volume(), 0, fadeMs);
    this.musicStopTimers[track] = setTimeout(() => {
      sound.stop();
      sound.volume(this.targetMusicVolume(track));
      delete this.musicStopTimers[track];
    }, fadeMs + 40);
  }

  private fadeIn(track: MusicTrack, fadeMs: number) {
    const sound = this.music[track];
    this.clearPendingStop(track);

    const targetVolume = this.targetMusicVolume(track);
    if (!sound.playing()) {
      sound.volume(0);
      sound.play();
    }

    sound.fade(sound.volume(), targetVolume, fadeMs);
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

    if (this.sfxMasterGain) {
      this.sfxMasterGain.gain.setValueAtTime(
        this.sfxEnabled ? this.sfxVolume : 0,
        this.sfxContext?.currentTime ?? 0,
      );
    }
  }

  private ensureSfxContext() {
    if (this.sfxContext) {
      return this.sfxContext;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const audioContextCtor =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!audioContextCtor) {
      return null;
    }

    const context = new audioContextCtor();
    const master = context.createGain();
    master.gain.value = this.sfxEnabled ? this.sfxVolume : 0;
    master.connect(context.destination);

    this.sfxContext = context;
    this.sfxMasterGain = master;

    return context;
  }

  private playOscillator(
    wave: OscillatorType,
    startHz: number,
    endHz: number,
    duration: number,
    peakGain: number,
  ) {
    const context = this.ensureSfxContext();
    if (!context || !this.sfxMasterGain) {
      return;
    }

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = wave;
    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(16, endHz),
      now + duration,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peakGain),
      now + 0.012,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoiseBurst(duration: number, peakGain: number) {
    const context = this.ensureSfxContext();
    if (!context || !this.sfxMasterGain) {
      return;
    }

    const now = context.currentTime;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const t = index / frameCount;
      data[index] = (Math.random() * 2 - 1) * (1 - t) * (1 - t * 0.6);
    }

    const source = context.createBufferSource();
    const lowpass = context.createBiquadFilter();
    const highpass = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1300, now);
    lowpass.frequency.linearRampToValueAtTime(420, now + duration);

    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(45, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peakGain),
      now + 0.018,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.sfxMasterGain);

    source.start(now);
  }

  private playShootSynth() {
    // Main laser body: high-frequency zap sweeping down over a longer tail
    this.playOscillator("sawtooth", 2600, 160, 0.26, 0.14);
    // Mid harmonic crunch layer
    this.playOscillator("square", 1100, 140, 0.22, 0.08);
    // Sub punch to give it weight
    this.playOscillator("sine", 380, 48, 0.2, 0.055);
  }

  private playExplosionSynth() {
    this.playNoiseBurst(0.35, 0.16);
    this.playOscillator("triangle", 160, 42, 0.33, 0.09);
  }

  private playPickupSynth() {
    this.playOscillator("sine", 620, 1300, 0.12, 0.06);
    this.playOscillator("triangle", 460, 920, 0.1, 0.028);
  }

  getSettings(): AudioSettings {
    return {
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
    };
  }

  async unlockAudio() {
    if (this.audioUnlocked) {
      return;
    }

    const sfxContext = this.ensureSfxContext();
    if (sfxContext && sfxContext.state !== "running") {
      try {
        await sfxContext.resume();
      } catch {
        // Ignore resume failures and keep non-audio gameplay responsive.
      }
    }

    try {
      if (Howler.ctx && Howler.ctx.state !== "running") {
        await Howler.ctx.resume();
      }
      this.audioUnlocked = true;
    } catch {
      return;
    }

    if (this.musicEnabled && this.activeMusicTrack) {
      this.playMusic(this.activeMusicTrack, 0);
    }
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

  playMusic(track: MusicTrack, fadeMs = DEFAULT_MUSIC_FADE_MS) {
    const sameTrackRequest = this.activeMusicTrack === track;
    this.activeMusicTrack = track;

    if (!this.musicEnabled) {
      return;
    }

    if (!this.audioUnlocked) {
      return;
    }

    if (sameTrackRequest) {
      const active = this.music[track];
      this.clearPendingStop(track);
      active.volume(this.targetMusicVolume(track));
      if (!active.playing()) {
        active.play();
      }
      return;
    }

    const safeFade = Math.max(0, fadeMs);

    for (const [key, sound] of Object.entries(this.music) as [
      MusicTrack,
      Howl,
    ][]) {
      if (key !== track && sound.playing()) {
        if (safeFade > 0) {
          this.fadeOutAndStop(key, safeFade);
        } else {
          this.clearPendingStop(key);
          sound.stop();
        }
      }
    }

    if (safeFade > 0) {
      this.fadeIn(track, safeFade);
      return;
    }

    const selectedTrack = this.music[track];
    this.clearPendingStop(track);
    selectedTrack.volume(this.targetMusicVolume(track));
    if (!selectedTrack.playing()) {
      selectedTrack.play();
    }
  }

  stopMusic() {
    for (const [track, sound] of Object.entries(this.music) as [
      MusicTrack,
      Howl,
    ][]) {
      this.clearPendingStop(track);
      if (sound.playing()) {
        sound.stop();
      }
    }
  }

  playShoot() {
    if (!this.sfxEnabled) {
      return;
    }

    if (this.shoot) {
      this.shoot.play();
      return;
    }

    this.playShootSynth();
  }

  playExplosion() {
    if (!this.sfxEnabled) {
      return;
    }

    if (this.explosion) {
      this.explosion.play();
      return;
    }

    this.playExplosionSynth();
  }

  playPickup() {
    if (!this.sfxEnabled) {
      return;
    }

    if (this.pickup) {
      this.pickup.play();
      return;
    }

    this.playPickupSynth();
  }
}

export const soundManager = new SoundManager();
