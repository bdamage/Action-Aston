import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { MainMenu } from '../ui/MainMenu';
import { GameOverOverlay } from '../ui/GameOverOverlay';
import { HUD } from '../ui/HUD';
import { PauseOverlay } from '../ui/PauseOverlay';
import { TouchControls } from '../ui/TouchControls';
import { GameErrorBoundary } from '../ui/GameErrorBoundary';
import { useInputBindings } from '../game/hooks/useInput';
import { RenderScene } from '../game/entities/RenderScene';
import { HALF_HEIGHT, HALF_WIDTH } from '../game/constants';
import { useGameStore } from '../game/state/gameStore';

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

export function GameScreen() {
  useInputBindings();

  const phase = useGameStore((state) => state.phase);
  const score = useGameStore((state) => state.score);
  const wave = useGameStore((state) => state.wave);
  const player = useGameStore((state) => state.player);
  const startGame = useGameStore((state) => state.startGame);
  const restartGame = useGameStore((state) => state.restartGame);
  const setPhase = useGameStore((state) => state.setPhase);
  const setMovement = useGameStore((state) => state.setMovement);
  const setShooting = useGameStore((state) => state.setShooting);

  const showTouchControls = useMemo(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    []
  );
  const canvasDpr = showTouchControls ? ([1, 1.2] as [number, number]) : ([1, 1.5] as [number, number]);

  return (
    <main className="relative h-full w-full">
      <GameErrorBoundary>
        <Canvas
          orthographic
          camera={{
            zoom: 1,
            position: [0, 0, 12],
            near: 0.1,
            far: 100,
            left: -HALF_WIDTH,
            right: HALF_WIDTH,
            top: HALF_HEIGHT,
            bottom: -HALF_HEIGHT
          }}
          gl={{ antialias: !showTouchControls, powerPreference: 'high-performance' }}
          dpr={canvasDpr}
        >
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

      {phase === 'menu' && <MainMenu onStart={startGame} />}

      {phase !== 'menu' && (
        <HUD
          score={score}
          wave={wave}
          health={player.health}
          shield={player.shield}
          ammo={player.ammo}
          boost={player.boostTimer}
          onPause={() => setPhase(phase === 'paused' ? 'playing' : 'paused')}
        />
      )}

      {phase === 'paused' && (
        <PauseOverlay onResume={() => setPhase('playing')} onExit={() => setPhase('menu')} />
      )}

      {phase === 'gameover' && (
        <GameOverOverlay score={score} onRestart={restartGame} onExit={() => setPhase('menu')} />
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
