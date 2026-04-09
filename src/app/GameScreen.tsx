import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { MainMenu } from '../ui/MainMenu';
import { SpriteAlignmentOverlay } from '../ui/SpriteAlignmentOverlay';
import { GameOverOverlay } from '../ui/GameOverOverlay';
import { HUD } from '../ui/HUD';
import { PauseOverlay } from '../ui/PauseOverlay';
import { TouchControls } from '../ui/TouchControls';
import { OptionsOverlay } from '../ui/OptionsOverlay';
import { GameErrorBoundary } from '../ui/GameErrorBoundary';
import { useInputBindings } from '../game/hooks/useInput';
import { RenderScene } from '../game/entities/RenderScene';
import { HALF_HEIGHT } from '../game/constants';
import { CAMERA_ZOOM } from '../game/renderTuning';
import { useGameStore } from '../game/state/gameStore';
import { soundManager } from '../game/SoundManager';
import { fetchLeaderboard, submitScore, type LeaderboardEntry } from './leaderboard';

function SceneLoadingFallback() {
  return (
    <>
      <color attach="background" args={['#030711']} />
      <ambientLight intensity={1} />
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial color="#29f7c0" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

function ResponsiveOrthoCamera() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const ortho = camera as THREE.OrthographicCamera;
    const aspect = size.height > 0 ? size.width / size.height : 1;
    const halfWidth = HALF_HEIGHT * aspect;

    ortho.top = HALF_HEIGHT;
    ortho.bottom = -HALF_HEIGHT;
    ortho.left = -halfWidth;
    ortho.right = halfWidth;
    ortho.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

export function GameScreen() {
  useInputBindings();
  const isDev = import.meta.env.DEV;

  const initialAudioSettings = useMemo(() => soundManager.getSettings(), []);

  const phase = useGameStore((state) => state.phase);
  const bossFightActive = useGameStore((state) =>
    state.enemies.some((enemy) => enemy.type === 'firstBoss' || enemy.type === 'finalBoss')
  );
  const activeBoss = useGameStore((state) =>
    state.enemies.find(
      (enemy) => (enemy.type === 'firstBoss' || enemy.type === 'finalBoss') && enemy.hp > 0
    )
  );
  const score = useGameStore((state) => state.score);
  const wave = useGameStore((state) => state.wave);
  const player = useGameStore((state) => state.player);
  const startGame = useGameStore((state) => state.startGame);
  const startAlignment = useGameStore((state) => state.startAlignment);
  const restartGame = useGameStore((state) => state.restartGame);
  const setPhase = useGameStore((state) => state.setPhase);
  const setMovement = useGameStore((state) => state.setMovement);
  const setShooting = useGameStore((state) => state.setShooting);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('Pilot');
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(initialAudioSettings.musicEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(initialAudioSettings.sfxEnabled);
  const [musicVolume, setMusicVolume] = useState(initialAudioSettings.musicVolume);
  const [sfxVolume, setSfxVolume] = useState(initialAudioSettings.sfxVolume);
  const previousPhaseRef = useRef(phase);

  const showTouchControls = useMemo(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    []
  );
  const canvasDpr = showTouchControls ? ([1, 1.2] as [number, number]) : ([1, 1.5] as [number, number]);

  useEffect(() => {
    if (!isDev && phase === 'alignment') {
      setPhase('menu');
    }
  }, [isDev, phase, setPhase]);

  useEffect(() => {
    const unlockAudio = () => {
      void soundManager.unlockAudio();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        const entries = await fetchLeaderboard();
        if (!cancelled) {
          setLeaderboard(entries);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Could not load leaderboard.';
          setLeaderboardError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    }

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    if (phase === 'gameover' && previousPhase !== 'gameover') {
      setSubmitState('idle');
      setSubmitMessage(null);
      setHasSubmitted(false);
    }
    previousPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' || phase === 'paused') {
      soundManager.playMusic(bossFightActive ? 'boss' : 'gameplay');
      return;
    }

    if (phase === 'gameover') {
      soundManager.playMusic('leaderboard');
      return;
    }

    soundManager.playMusic('title');
  }, [bossFightActive, phase]);

  useEffect(() => {
    soundManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    soundManager.setSfxEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    soundManager.setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    soundManager.setSfxVolume(sfxVolume);
  }, [sfxVolume]);

  useEffect(() => {
    if (phase !== 'menu' && optionsOpen) {
      setOptionsOpen(false);
    }
  }, [optionsOpen, phase]);

  async function handleSubmitScore() {
    if (submitState === 'saving' || hasSubmitted) {
      return;
    }

    setSubmitState('saving');
    setSubmitMessage(null);

    try {
      const entries = await submitScore(playerName, score);
      setLeaderboard(entries);
      setSubmitState('saved');
      setHasSubmitted(true);
      setSubmitMessage('Score saved to global leaderboard.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Score upload failed.';
      setSubmitState('error');
      setSubmitMessage(message);
    }
  }

  const handleStart = useCallback(() => {
    void soundManager.unlockAudio();
    startGame();
  }, [startGame]);

  const handleStartAlignment = useCallback(() => {
    void soundManager.unlockAudio();
    startAlignment();
  }, [startAlignment]);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black">
      <GameErrorBoundary>
        <Canvas
          orthographic
          camera={{
            zoom: CAMERA_ZOOM,
            position: [0, 0, 12],
            near: 0.1,
            far: 100,
            top: HALF_HEIGHT,
            bottom: -HALF_HEIGHT
          }}
          gl={{ antialias: !showTouchControls, powerPreference: 'high-performance' }}
          dpr={canvasDpr}
        >
          <ResponsiveOrthoCamera />
          <Suspense fallback={<SceneLoadingFallback />}>
            <RenderScene />
          </Suspense>
        </Canvas>
      </GameErrorBoundary>

      {!showTouchControls && phase === 'menu' && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-cyan-300/30 bg-black/40 px-3 py-2 text-xs text-cyan-100/90 backdrop-blur">
          Keyboard: WASD/Arrows move, Space shoot, Enter start/restart, Esc/P pause
        </div>
      )}

      {phase === 'menu' && (
        <MainMenu
          onStart={handleStart}
          onOpenAlignment={isDev ? handleStartAlignment : undefined}
          onOpenOptions={() => setOptionsOpen(true)}
          leaderboard={leaderboard}
          loadingLeaderboard={loadingLeaderboard}
          leaderboardError={leaderboardError}
        />
      )}

      {phase === 'menu' && optionsOpen && (
        <OptionsOverlay
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          musicVolume={musicVolume}
          sfxVolume={sfxVolume}
          onMusicEnabledChange={setMusicEnabled}
          onSfxEnabledChange={setSfxEnabled}
          onMusicVolumeChange={setMusicVolume}
          onSfxVolumeChange={setSfxVolume}
          onClose={() => setOptionsOpen(false)}
        />
      )}

      {isDev && phase === 'alignment' && (
        <SpriteAlignmentOverlay onBack={() => setPhase('menu')} />
      )}

      {phase !== 'menu' && phase !== 'alignment' && (
        <HUD
          score={score}
          wave={wave}
          health={player.health}
          shield={player.shield}
          ammo={player.ammo}
          boost={player.boostTimer}
          bossName={
            activeBoss?.type === 'finalBoss'
              ? 'Final Boss'
              : activeBoss?.type === 'firstBoss'
                ? 'Boss'
                : undefined
          }
          bossHealth={activeBoss?.hp}
          bossMaxHealth={activeBoss?.maxHp}
          onPause={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
        />
      )}

      {phase === 'paused' && (
        <PauseOverlay onResume={() => setPhase('playing')} onExit={() => setPhase('menu')} />
      )}

      {phase === 'gameover' && (
        <GameOverOverlay
          score={score}
          playerName={playerName}
          submitState={submitState}
          submitMessage={submitMessage}
          hasSubmitted={hasSubmitted}
          onNameChange={setPlayerName}
          onSubmitScore={handleSubmitScore}
          onRestart={restartGame}
          onExit={() => setPhase('menu')}
        />
      )}

      {showTouchControls && phase === 'playing' && (
        <TouchControls
          onMove={(x, y) => setMovement({ x, y })}
          onShoot={(shooting) => setShooting(shooting)}
        />
      )}
    </main>
  );
}
