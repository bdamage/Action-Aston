import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import { MainMenu } from '../ui/MainMenu';
import { GameOverOverlay } from '../ui/GameOverOverlay';
import { HUD } from '../ui/HUD';
import { PauseOverlay } from '../ui/PauseOverlay';
import { TouchControls } from '../ui/TouchControls';
import { useInputBindings } from '../game/hooks/useInput';
import { RenderScene } from '../game/entities/RenderScene';
import { HALF_HEIGHT, HALF_WIDTH } from '../game/constants';
import { useGameStore } from '../game/state/gameStore';

export function GameScreen() {
  useInputBindings();

  const {
    phase,
    score,
    wave,
    player,
    startGame,
    restartGame,
    setPhase,
    setMovement,
    setShooting
  } = useGameStore((state) => ({
    phase: state.phase,
    score: state.score,
    wave: state.wave,
    player: state.player,
    startGame: state.startGame,
    restartGame: state.restartGame,
    setPhase: state.setPhase,
    setMovement: state.setMovement,
    setShooting: state.setShooting
  }));

  const showTouchControls = useMemo(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0, []);

  return (
    <main className="relative h-full w-full">
      <Canvas
        orthographic
        camera={{
          zoom: 56,
          position: [0, 0, 12],
          near: 0.1,
          far: 100,
          left: -HALF_WIDTH,
          right: HALF_WIDTH,
          top: HALF_HEIGHT,
          bottom: -HALF_HEIGHT
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <RenderScene />
      </Canvas>

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
