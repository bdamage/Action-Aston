import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HALF_HEIGHT, HALF_WIDTH } from '../game/constants';

interface StarfieldProps {
  density?: number;
}

interface StarParticle {
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  alpha: number;
  speed: number;
  twinkle: number;
  phase: number;
}

interface DustParticle {
  x: number;
  y: number;
  z: number;
  scale: number;
  alpha: number;
  speed: number;
  sway: number;
  phase: number;
  textureIndex: number;
}

function createDustTexture(innerColor: string, outerColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.45, outerColor);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function Starfield({ density = 120 }: StarfieldProps) {
  const starsRef = useRef<Array<THREE.Mesh | null>>([]);
  const dustRef = useRef<Array<THREE.Sprite | null>>([]);

  const stars = useMemo<StarParticle[]>(
    () =>
      Array.from({ length: density }, () => ({
        x: (Math.random() * 2 - 1) * HALF_WIDTH,
        y: (Math.random() * 2 - 1) * HALF_HEIGHT,
        z: -0.2 - Math.random() * 0.65,
        width: 0.008 + Math.random() * 0.02,
        length: 0.05 + Math.random() * 0.22,
        alpha: 0.25 + Math.random() * 0.5,
        speed: 0.12 + Math.random() * 0.45,
        twinkle: 0.8 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      })),
    [density]
  );

  const dust = useMemo<DustParticle[]>(() => {
    const count = Math.max(10, Math.round(density * 0.16));
    return Array.from({ length: count }, () => ({
      x: (Math.random() * 2 - 1) * HALF_WIDTH * 1.15,
      y: (Math.random() * 2 - 1) * HALF_HEIGHT * 1.2,
      z: -1.4 - Math.random() * 0.9,
      scale: 1.4 + Math.random() * 3.8,
      alpha: 0.06 + Math.random() * 0.09,
      speed: 0.04 + Math.random() * 0.12,
      sway: 0.14 + Math.random() * 0.36,
      phase: Math.random() * Math.PI * 2,
      textureIndex: Math.floor(Math.random() * 3)
    }));
  }, [density]);

  const dustTextures = useMemo(
    () => [
      createDustTexture('rgba(187, 236, 255, 0.7)', 'rgba(122, 186, 255, 0.25)'),
      createDustTexture('rgba(173, 255, 243, 0.7)', 'rgba(69, 225, 204, 0.22)'),
      createDustTexture('rgba(255, 223, 184, 0.65)', 'rgba(255, 159, 127, 0.2)')
    ],
    []
  );

  useEffect(() => {
    return () => {
      dustTextures.forEach((texture) => texture?.dispose());
    };
  }, [dustTextures]);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    const wrapTop = HALF_HEIGHT + 0.5;
    const wrapBottom = -HALF_HEIGHT - 0.5;

    for (let i = 0; i < stars.length; i += 1) {
      const star = stars[i];
      const mesh = starsRef.current[i];
      if (!mesh) continue;

      star.y -= star.speed * delta;
      if (star.y < wrapBottom) {
        star.y = wrapTop;
        star.x = (Math.random() * 2 - 1) * HALF_WIDTH;
      }

      mesh.position.x = star.x + Math.sin(time * 0.2 + star.phase) * 0.04;
      mesh.position.y = star.y;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = star.alpha * (0.72 + 0.28 * Math.sin(time * star.twinkle + star.phase));
    }

    for (let i = 0; i < dust.length; i += 1) {
      const particle = dust[i];
      const sprite = dustRef.current[i];
      if (!sprite) continue;

      particle.y -= particle.speed * delta;
      if (particle.y < wrapBottom - 1) {
        particle.y = wrapTop + 1;
        particle.x = (Math.random() * 2 - 1) * HALF_WIDTH * 1.15;
      }

      sprite.position.x = particle.x + Math.sin(time * particle.sway + particle.phase) * 0.42;
      sprite.position.y = particle.y + Math.cos(time * 0.22 + particle.phase) * 0.12;

      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = particle.alpha * (0.82 + 0.18 * Math.sin(time * 0.6 + particle.phase));
    }
  });

  return (
    <group>
      {dust.map((particle, index) => (
        <sprite
          key={`dust-${index}`}
          ref={(node) => {
            dustRef.current[index] = node;
          }}
          position={[particle.x, particle.y, particle.z]}
          scale={[particle.scale, particle.scale, 1]}
        >
          <spriteMaterial
            map={dustTextures[particle.textureIndex] ?? undefined}
            color="#9ce8ff"
            transparent
            opacity={particle.alpha}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}

      {stars.map((star, index) => (
        <mesh
          key={`star-${index}`}
          ref={(node) => {
            starsRef.current[index] = node;
          }}
          position={[star.x, star.y, star.z]}
        >
          <planeGeometry args={[star.width, star.length]} />
          <meshBasicMaterial color="#9fd3ff" transparent opacity={star.alpha} />
        </mesh>
      ))}
    </group>
  );
}
