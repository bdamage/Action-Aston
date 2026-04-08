import type * as THREE from 'three';

interface AtlasPlaneProps {
  texture: THREE.Texture;
  position: [number, number, number];
  size?: [number, number];
  opacity?: number;
  tint?: string;
}

export function AtlasPlane({ texture, position, size = [0.9, 0.9], opacity = 1, tint = '#ffffff' }: AtlasPlaneProps) {
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} color={tint} />
    </mesh>
  );
}
