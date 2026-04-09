import { useLoader, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AtlasPlane } from '../../components/AtlasPlane';
import { Starfield } from '../../components/Starfield';
import { atlas, type SpriteKey } from '../../assets/assetConfig';
import firstBossUrl from '../../assets/first_boss.png';
import finalBossUrl from '../../assets/final_boss.png';
import thirdBossUrl from '../../assets/boss03.png';
import coinUrl from '../../assets/coin.png';
import { getDpiSpriteScaleMultiplier, SPRITE_SCALE } from '../renderTuning';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../state/gameStore';
import type { EnemyType } from '../types';

function explosionFrame(remainingTtl: number, maxTtl: number) {
  const progress = 1 - remainingTtl / Math.max(0.001, maxTtl);
  if (progress < 0.34) return 'explosion01' as const;
  if (progress < 0.67) return 'explosion02' as const;
  return 'explosion03' as const;
}

function scaledSize(width: number, height: number, spriteScaleMultiplier: number): [number, number] {
  return [width * SPRITE_SCALE * spriteScaleMultiplier, height * SPRITE_SCALE * spriteScaleMultiplier];
}

function scaledSizeFromTexture(
  texture: THREE.Texture,
  targetHeight: number,
  spriteScaleMultiplier: number
): [number, number] {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const width = image?.width ?? 1;
  const height = image?.height ?? 1;
  return scaledSize(targetHeight * (width / Math.max(1, height)), targetHeight, spriteScaleMultiplier);
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
  const [firstBossTexture, finalBossTexture, thirdBossTexture, coinTexture] = useLoader(THREE.TextureLoader, [firstBossUrl, finalBossUrl, thirdBossUrl, coinUrl]);

  const bossTextures = useMemo(() => {
    const output = {
      firstBoss: firstBossTexture,
      thirdBoss: thirdBossTexture,
      finalBoss: finalBossTexture
    };

    for (const texture of Object.values(output)) {      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }

    return output;
  }, [firstBossTexture, finalBossTexture]);

  const preparedCoinTexture = useMemo(() => {
    coinTexture.wrapS = THREE.ClampToEdgeWrapping;
    coinTexture.wrapT = THREE.ClampToEdgeWrapping;
    coinTexture.magFilter = THREE.LinearFilter;
    coinTexture.minFilter = THREE.LinearFilter;
    coinTexture.generateMipmaps = false;
    coinTexture.needsUpdate = true;
    return coinTexture;
  }, [coinTexture]);

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

  const getEnemySize = (enemyType: EnemyType): [number, number] => {
    if (enemyType === 'firstBoss') {
      return scaledSizeFromTexture(bossTextures.firstBoss, alignment.enemy.h * 2.7, spriteScaleMultiplier);
    }
    if (enemyType === 'thirdBoss') {
      return scaledSizeFromTexture(bossTextures.thirdBoss, alignment.enemy.h * 2.9, spriteScaleMultiplier);
    }
    if (enemyType === 'finalBoss') {
      return scaledSizeFromTexture(bossTextures.finalBoss, alignment.enemy.h * 3.1, spriteScaleMultiplier);
    }

    return scaledSizeFromFrame(enemyType, alignment.enemy.h, spriteScaleMultiplier);
  };

  const getEnemyTexture = (enemyType: EnemyType): THREE.Texture => {
    if (enemyType === 'firstBoss') return bossTextures.firstBoss;
    if (enemyType === 'thirdBoss') return bossTextures.thirdBoss;
    if (enemyType === 'finalBoss') return bossTextures.finalBoss;
    return textures[enemyType];
  };

  const isTouch = useMemo(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0, []);
  const maxExplosions = isTouch ? 28 : 60;
  const starDensity = isTouch ? 70 : 120;

  const player = useGameStore((state) => state.player);
  const phase = useGameStore((state) => state.phase);
  const alignment = useGameStore((state) => state.alignment);
  const showHitboxes = useGameStore((state) => state.showHitboxes);
  const enemies = useGameStore((state) => state.enemies);
  const projectiles = useGameStore((state) => state.projectiles);
  const pickups = useGameStore((state) => state.pickups);
  const coins = useGameStore((state) => state.coins);
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

      {!inAlignmentMode && showHitboxes && (
        <BoundsOverlay
          position={[player.position.x, player.position.y, 0]}
          width={playerSize[0]}
          height={playerSize[1]}
          radius={player.radius}
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
          texture={getEnemyTexture(enemy.type)}
          position={[enemy.position.x, enemy.position.y, 0]}
          size={getEnemySize(enemy.type)}
          flashOpacity={hitFlashOpacity(enemy.hitFlash)}
          rotationZ={Math.PI}
        />
      ))}

      {!inAlignmentMode && showHitboxes && enemies.map((enemy) => {
        const size = getEnemySize(enemy.type);
        return (
          <BoundsOverlay
            key={`hb-enemy-${enemy.id}`}
            position={[enemy.position.x, enemy.position.y, 0]}
            width={size[0]}
            height={size[1]}
            radius={enemy.radius}
          />
        );
      })}

      {!inAlignmentMode && projectiles.map((projectile) => (
        <group key={projectile.id}>
          <AtlasPlane
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
          <mesh
            position={[
              projectile.position.x - projectile.velocity.x * 0.035,
              projectile.position.y - projectile.velocity.y * 0.035,
              -0.01,
            ]}
            rotation={[0, 0, Math.atan2(projectile.velocity.y, projectile.velocity.x) - Math.PI / 2]}
          >
            <planeGeometry args={[
              alignment.projectile.h * 0.24 * SPRITE_SCALE * spriteScaleMultiplier,
              alignment.projectile.h * 1.85 * SPRITE_SCALE * spriteScaleMultiplier,
            ]} />
            <meshBasicMaterial
              color={projectile.from === 'player' ? '#7befff' : '#ff9e9e'}
              transparent
              opacity={0.46}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[projectile.position.x, projectile.position.y, -0.008]}>
            <circleGeometry args={[
              alignment.projectile.h * 0.17 * SPRITE_SCALE * spriteScaleMultiplier,
              20,
            ]} />
            <meshBasicMaterial
              color={projectile.from === 'player' ? '#b8fdff' : '#ffc0c0'}
              transparent
              opacity={0.58}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
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

      {!inAlignmentMode && showHitboxes && pickups.map((pickup) => {
        const pickupSize = scaledSizeFromFrame(
          pickup.type === 'health' ? 'pickupHealth'
            : pickup.type === 'shield' ? 'pickupShield'
            : pickup.type === 'ammo' ? 'pickupAmmo'
            : 'pickupBoost',
          alignment.pickup.h,
          spriteScaleMultiplier
        );
        return (
          <BoundsOverlay
            key={`hb-pickup-${pickup.id}`}
            position={[pickup.position.x, pickup.position.y, 0]}
            width={pickupSize[0]}
            height={pickupSize[1]}
            radius={pickup.radius}
          />
        );
      })}

      {!inAlignmentMode && coins.map((coin) => {
        const coinSize = scaledSizeFromTexture(preparedCoinTexture, alignment.pickup.h, spriteScaleMultiplier);
        return (
          <group key={coin.id}>
            <AtlasPlane
              texture={preparedCoinTexture}
              position={[coin.position.x, coin.position.y, 0.01]}
              size={coinSize}
            />
            <mesh position={[coin.position.x, coin.position.y, 0]}>
              <circleGeometry args={[coinSize[0] * 0.55, 16]} />
              <meshBasicMaterial
                color="#ffd700"
                transparent
                opacity={0.28}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {!inAlignmentMode && showHitboxes && projectiles.map((projectile) => {
        const projSize = scaledSizeFromFrame(
          projectile.from === 'player' ? 'laserBlue' : 'laserRed',
          alignment.projectile.h,
          spriteScaleMultiplier
        );
        return (
          <BoundsOverlay
            key={`hb-proj-${projectile.id}`}
            position={[projectile.position.x, projectile.position.y, 0]}
            width={projSize[0]}
            height={projSize[1]}
            radius={projectile.radius}
          />
        );
      })}

      {!inAlignmentMode && explosions.slice(-maxExplosions).map((explosion) => (
        <group key={explosion.id}>
          <AtlasPlane
            texture={textures[explosionFrame(explosion.ttl, explosion.maxTtl)]}
            position={[explosion.position.x, explosion.position.y, 0]}
            size={scaledSizeFromFrame(
              explosionFrame(explosion.ttl, explosion.maxTtl),
              explosion.scale * (1 + (1 - explosion.ttl / explosion.maxTtl) * 0.42),
              spriteScaleMultiplier
            )}
            opacity={Math.pow(explosion.ttl / explosion.maxTtl, 0.85)}
          />
          <mesh position={[explosion.position.x, explosion.position.y, -0.012]}>
            <circleGeometry
              args={[
                explosion.scale * (0.5 + (1 - explosion.ttl / explosion.maxTtl) * 1.35) * SPRITE_SCALE * spriteScaleMultiplier,
                24,
              ]}
            />
            <meshBasicMaterial
              color="#ffd891"
              transparent
              opacity={Math.pow(explosion.ttl / explosion.maxTtl, 1.2) * 0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
