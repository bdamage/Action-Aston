import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AtlasPlane } from '../../components/AtlasPlane';
import { Starfield } from '../../components/Starfield';
import { atlas, type SpriteKey } from '../../assets/assetConfig';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../state/gameStore';

function explosionFrame(index: number) {
  if (index % 3 === 0) return 'explosion01' as const;
  if (index % 3 === 1) return 'explosion02' as const;
  return 'explosion03' as const;
}

const SPRITE_SCALE = 0.35;

function scaledSize(width: number, height: number): [number, number] {
  return [width * SPRITE_SCALE, height * SPRITE_SCALE];
}

export function RenderScene() {
  useGameLoop();

  const baseTexture = useLoader(THREE.TextureLoader, atlas.url);
  const textures = useMemo(() => {
    const output = {} as Record<SpriteKey, THREE.Texture>;

    for (const [key, frame] of Object.entries(atlas.frames) as [SpriteKey, (typeof atlas.frames)[SpriteKey]][]) {
      const tex = baseTexture.clone();
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.repeat.set(frame.w / atlas.width, frame.h / atlas.height);
      tex.offset.set(frame.x / atlas.width, 1 - (frame.y + frame.h) / atlas.height);
      tex.needsUpdate = true;
      output[key] = tex;
    }

    return output;
  }, [baseTexture]);

  const isTouch = useMemo(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0, []);
  const maxExplosions = isTouch ? 28 : 60;
  const starDensity = isTouch ? 70 : 120;

  const player = useGameStore((state) => state.player);
  const enemies = useGameStore((state) => state.enemies);
  const projectiles = useGameStore((state) => state.projectiles);
  const pickups = useGameStore((state) => state.pickups);
  const explosions = useGameStore((state) => state.explosions);

  return (
    <>
      <color attach="background" args={['#030711']} />
      <ambientLight intensity={1.1} />
      <Starfield density={starDensity} />

      <AtlasPlane
        texture={textures.player}
        position={[player.position.x, player.position.y, 0]}
        size={scaledSize(1.15, 1.15)}
      />

      {enemies.map((enemy) => (
        <AtlasPlane
          key={enemy.id}
          texture={textures[enemy.type]}
          position={[enemy.position.x, enemy.position.y, 0]}
          size={scaledSize(0.95, 0.95)}
        />
      ))}

      {projectiles.map((projectile) => (
        <AtlasPlane
          key={projectile.id}
          texture={projectile.from === 'player' ? textures.laserBlue : textures.laserRed}
          position={[projectile.position.x, projectile.position.y, 0]}
          size={scaledSize(0.28, 0.58)}
          tint={projectile.from === 'player' ? '#8ff8ff' : '#ff8d8d'}
        />
      ))}

      {pickups.map((pickup) => (
        <AtlasPlane
          key={pickup.id}
          texture={
            pickup.type === 'health'
              ? textures.pickupHealth
              : pickup.type === 'shield'
                ? textures.pickupShield
                : pickup.type === 'ammo'
                  ? textures.pickupAmmo
                  : textures.pickupBoost
          }
          position={[pickup.position.x, pickup.position.y, 0]}
          size={scaledSize(0.72, 0.72)}
        />
      ))}

      {explosions.slice(-maxExplosions).map((explosion, index) => (
        <AtlasPlane
          key={explosion.id}
          texture={textures[explosionFrame(index)]}
          position={[explosion.position.x, explosion.position.y, 0]}
          size={scaledSize(explosion.scale, explosion.scale)}
          opacity={explosion.ttl / explosion.maxTtl}
        />
      ))}
    </>
  );
}
