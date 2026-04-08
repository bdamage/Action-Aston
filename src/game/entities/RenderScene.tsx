import { useLoader, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AtlasPlane } from '../../components/AtlasPlane';
import { Starfield } from '../../components/Starfield';
import { atlas, type SpriteKey } from '../../assets/assetConfig';
import { DRAW_SIZES, getDpiSpriteScaleMultiplier, SPRITE_SCALE } from '../renderTuning';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../state/gameStore';

function explosionFrame(index: number) {
  if (index % 3 === 0) return 'explosion01' as const;
  if (index % 3 === 1) return 'explosion02' as const;
  return 'explosion03' as const;
}

function scaledSize(width: number, height: number, spriteScaleMultiplier: number): [number, number] {
  return [width * SPRITE_SCALE * spriteScaleMultiplier, height * SPRITE_SCALE * spriteScaleMultiplier];
}

export function RenderScene() {
  useGameLoop();
  const effectiveDpr = useThree((state) => state.viewport.dpr);
  const spriteScaleMultiplier = useMemo(
    () => getDpiSpriteScaleMultiplier(effectiveDpr),
    [effectiveDpr]
  );

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
        size={scaledSize(DRAW_SIZES.player.w, DRAW_SIZES.player.h, spriteScaleMultiplier)}
        rotationZ={Math.PI}
      />

      {enemies.map((enemy) => (
        <AtlasPlane
          key={enemy.id}
          texture={textures[enemy.type]}
          position={[enemy.position.x, enemy.position.y, 0]}
          size={scaledSize(DRAW_SIZES.enemy.w, DRAW_SIZES.enemy.h, spriteScaleMultiplier)}
          rotationZ={Math.PI}
        />
      ))}

      {projectiles.map((projectile) => (
        <AtlasPlane
          key={projectile.id}
          texture={projectile.from === 'player' ? textures.laserBlue : textures.laserRed}
          position={[projectile.position.x, projectile.position.y, 0]}
          size={scaledSize(DRAW_SIZES.projectile.w, DRAW_SIZES.projectile.h, spriteScaleMultiplier)}
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
          size={scaledSize(DRAW_SIZES.pickup.w, DRAW_SIZES.pickup.h, spriteScaleMultiplier)}
        />
      ))}

      {explosions.slice(-maxExplosions).map((explosion, index) => (
        <AtlasPlane
          key={explosion.id}
          texture={textures[explosionFrame(index)]}
          position={[explosion.position.x, explosion.position.y, 0]}
          size={scaledSize(explosion.scale, explosion.scale, spriteScaleMultiplier)}
          opacity={explosion.ttl / explosion.maxTtl}
        />
      ))}
    </>
  );
}
