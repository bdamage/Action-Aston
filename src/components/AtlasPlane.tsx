import type * as THREE from 'three';
import { AdditiveBlending } from 'three';

interface AtlasPlaneProps {
  texture: THREE.Texture;
  position: [number, number, number];
  size?: [number, number];
  opacity?: number;
  tint?: string;
  rotationZ?: number;
  flashOpacity?: number;
}

export function AtlasPlane({
  texture,
  position,
  size = [0.9, 0.9],
  opacity = 1,
  tint = '#ffffff',
  rotationZ = 0,
  flashOpacity = 0
}: AtlasPlaneProps) {
  return (
    <group position={position} rotation={[0, 0, rotationZ]}>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} transparent opacity={opacity} color={tint} />
      </mesh>
      {flashOpacity > 0 && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={size} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={flashOpacity}
            color="#ffffff"
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
