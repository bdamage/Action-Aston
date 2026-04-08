import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { AtlasPlane } from '../../components/AtlasPlane';
import { Starfield } from '../../components/Starfield';
import { atlas } from '../../assets/assetConfig';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameStore } from '../state/gameStore';

function explosionFrame(index: number) {
  if (index % 3 === 0) return 'explosion01' as const;
  if (index % 3 === 1) return 'explosion02' as const;
  return 'explosion03' as const;
}

export function RenderScene() {
  useGameLoop();

  const texture = useLoader(THREE.TextureLoader, atlas.url);
  const player = useGameStore((state) => state.player);
  const enemies = useGameStore((state) => state.enemies);
  const projectiles = useGameStore((state) => state.projectiles);
  const pickups = useGameStore((state) => state.pickups);
  const explosions = useGameStore((state) => state.explosions);

  return (
    <>
      <color attach="background" args={['#030711']} />
      <ambientLight intensity={1.1} />
      <Starfield />

      <AtlasPlane atlasTexture={texture} sprite="player" position={[player.position.x, player.position.y, 0]} size={[1.15, 1.15]} />

      {enemies.map((enemy) => (
        <AtlasPlane
          key={enemy.id}
          atlasTexture={texture}
          sprite={enemy.type}
          position={[enemy.position.x, enemy.position.y, 0]}
          size={[0.95, 0.95]}
        />
      ))}

      {projectiles.map((projectile) => (
        <AtlasPlane
          key={projectile.id}
          atlasTexture={texture}
          sprite={projectile.from === 'player' ? 'laserBlue' : 'laserRed'}
          position={[projectile.position.x, projectile.position.y, 0]}
          size={[0.28, 0.58]}
          tint={projectile.from === 'player' ? '#8ff8ff' : '#ff8d8d'}
        />
      ))}

      {pickups.map((pickup) => (
        <AtlasPlane
          key={pickup.id}
          atlasTexture={texture}
          sprite={
            pickup.type === 'health'
              ? 'pickupHealth'
              : pickup.type === 'shield'
                ? 'pickupShield'
                : pickup.type === 'ammo'
                  ? 'pickupAmmo'
                  : 'pickupBoost'
          }
          position={[pickup.position.x, pickup.position.y, 0]}
          size={[0.72, 0.72]}
        />
      ))}

      {explosions.map((explosion, index) => (
        <AtlasPlane
          key={explosion.id}
          atlasTexture={texture}
          sprite={explosionFrame(index)}
          position={[explosion.position.x, explosion.position.y, 0]}
          size={[explosion.scale, explosion.scale]}
          opacity={explosion.ttl / explosion.maxTtl}
        />
      ))}
    </>
  );
}
