import { useMemo } from 'react';
import { HALF_HEIGHT, HALF_WIDTH } from '../game/constants';

interface StarfieldProps {
  density?: number;
}

export function Starfield({ density = 120 }: StarfieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: density }, () => ({
        x: (Math.random() * 2 - 1) * HALF_WIDTH,
        y: (Math.random() * 2 - 1) * HALF_HEIGHT,
        z: -0.2 - Math.random() * 0.5,
        size: 0.02 + Math.random() * 0.08,
        alpha: 0.25 + Math.random() * 0.45
      })),
    [density]
  );

  return (
    <group>
      {stars.map((star, index) => (
        <mesh key={index} position={[star.x, star.y, star.z]}>
          <planeGeometry args={[star.size, star.size]} />
          <meshBasicMaterial color="#9fd3ff" transparent opacity={star.alpha} />
        </mesh>
      ))}
    </group>
  );
}
