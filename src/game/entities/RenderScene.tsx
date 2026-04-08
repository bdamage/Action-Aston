import { useLoader, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AtlasPlane } from '../../components/AtlasPlane';
import { Starfield } from '../../components/Starfield';
import { atlas, type SpriteKey } from '../../assets/assetConfig';
import { getDpiSpriteScaleMultiplier, SPRITE_SCALE } from '../renderTuning';
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

function scaledSizeFromFrame(
  frameKey: SpriteKey,
  targetHeight: number,
  spriteScaleMultiplier: number
): [number, number] {
  const frame = atlas.frames[frameKey];
  const aspect = frame.w / frame.h;
  return scaledSize(targetHeight * aspect, targetHeight, spriteScaleMultiplier);
}

function hitFlashOpacity(hitFlash: number): number {
  if (hitFlash <= 0) return 0;
  return Math.floor(hitFlash * 20) % 2 === 0 ? 0.95 : 0;
}

function BoundsOverlay({
  position,
  width,
  height,
  radius
}: {
  position: [number, number, number];
  width: number;
  height: number;
  radius: number;
}) {
  return (
    <>
      <mesh position={[position[0], position[1], position[2] + 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#6ce8ff" wireframe transparent opacity={0.75} />
      </mesh>
      <mesh position={[position[0], position[1], position[2] + 0.03]}>
        <circleGeometry args={[radius, 36]} />
        <meshBasicMaterial color="#ff8a7d" wireframe transparent opacity={0.85} />
      </mesh>
    </>
  );
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
  const phase = useGameStore((state) => state.phase);
  const alignment = useGameStore((state) => state.alignment);
  const enemies = useGameStore((state) => state.enemies);
  const projectiles = useGameStore((state) => state.projectiles);
  const pickups = useGameStore((state) => state.pickups);
  const explosions = useGameStore((state) => state.explosions);

  const playerSize = scaledSizeFromFrame('player', alignment.player.h, spriteScaleMultiplier);
  const enemyPreviewSize = scaledSizeFromFrame('enemy01', alignment.enemy.h, spriteScaleMultiplier);
  const projectilePreviewSize = scaledSizeFromFrame('laserBlue', alignment.projectile.h, spriteScaleMultiplier);
  const pickupPreviewSize = scaledSizeFromFrame('pickupBoost', alignment.pickup.h, spriteScaleMultiplier);

  const inAlignmentMode = phase === 'alignment';

  return (
    <>
      <color attach="background" args={['#030711']} />
      <ambientLight intensity={1.1} />
      <Starfield density={starDensity} />

      <AtlasPlane
        texture={textures.player}
        position={inAlignmentMode ? [0, 0, 0] : [player.position.x, player.position.y, 0]}
        size={playerSize}
        flashOpacity={!inAlignmentMode ? hitFlashOpacity(player.hitFlash) : 0}
        rotationZ={Math.PI}
      />

      {inAlignmentMode && (
        <BoundsOverlay
          position={[0, 0, 0]}
          width={playerSize[0]}
          height={playerSize[1]}
          radius={alignment.player.radius}
        />
      )}

      {inAlignmentMode && (
        <>
          <AtlasPlane
            texture={textures.enemy01}
            position={[-2.6, 1.8, 0]}
            size={enemyPreviewSize}
            rotationZ={Math.PI}
          />
          <BoundsOverlay
            position={[-2.6, 1.8, 0]}
            width={enemyPreviewSize[0]}
            height={enemyPreviewSize[1]}
            radius={alignment.enemy.radius}
          />

          <AtlasPlane
            texture={textures.laserBlue}
            position={[0, 2.1, 0]}
            size={projectilePreviewSize}
            rotationZ={Math.PI / 2}
          />
          <BoundsOverlay
            position={[0, 2.1, 0]}
            width={projectilePreviewSize[0]}
            height={projectilePreviewSize[1]}
            radius={alignment.projectile.radius}
          />

          <AtlasPlane
            texture={textures.pickupBoost}
            position={[2.6, 1.8, 0]}
            size={pickupPreviewSize}
          />
          <BoundsOverlay
            position={[2.6, 1.8, 0]}
            width={pickupPreviewSize[0]}
            height={pickupPreviewSize[1]}
            radius={alignment.pickup.radius}
          />
        </>
      )}

      {!inAlignmentMode && enemies.map((enemy) => (
        <AtlasPlane
          key={enemy.id}
          texture={textures[enemy.type]}
          position={[enemy.position.x, enemy.position.y, 0]}
          size={scaledSizeFromFrame(enemy.type, alignment.enemy.h, spriteScaleMultiplier)}
          flashOpacity={hitFlashOpacity(enemy.hitFlash)}
          rotationZ={Math.PI}
        />
      ))}

      {!inAlignmentMode && projectiles.map((projectile) => (
        <AtlasPlane
          key={projectile.id}
          texture={projectile.from === 'player' ? textures.laserBlue : textures.laserRed}
          position={[projectile.position.x, projectile.position.y, 0]}
          size={scaledSizeFromFrame(
            projectile.from === 'player' ? 'laserBlue' : 'laserRed',
            alignment.projectile.h,
            spriteScaleMultiplier
          )}
          tint={projectile.from === 'player' ? '#8ff8ff' : '#ff8d8d'}
          rotationZ={Math.PI / 2}
        />
      ))}

      {!inAlignmentMode && pickups.map((pickup) => (
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
          size={scaledSizeFromFrame(
            pickup.type === 'health'
              ? 'pickupHealth'
              : pickup.type === 'shield'
                ? 'pickupShield'
                : pickup.type === 'ammo'
                  ? 'pickupAmmo'
                  : 'pickupBoost',
            alignment.pickup.h,
            spriteScaleMultiplier
          )}
        />
      ))}

      {!inAlignmentMode && explosions.slice(-maxExplosions).map((explosion, index) => (
        <AtlasPlane
          key={explosion.id}
          texture={textures[explosionFrame(index)]}
          position={[explosion.position.x, explosion.position.y, 0]}
          size={scaledSizeFromFrame(explosionFrame(index), explosion.scale, spriteScaleMultiplier)}
          opacity={explosion.ttl / explosion.maxTtl}
        />
      ))}
    </>
  );
}
