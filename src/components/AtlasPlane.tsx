import { useMemo } from 'react';
import * as THREE from 'three';
import { atlas, type SpriteKey } from '../assets/assetConfig';

interface AtlasPlaneProps {
  atlasTexture: THREE.Texture;
  sprite: SpriteKey;
  position: [number, number, number];
  size?: [number, number];
  opacity?: number;
  tint?: string;
}

export function AtlasPlane({ atlasTexture, sprite, position, size = [0.9, 0.9], opacity = 1, tint = '#ffffff' }: AtlasPlaneProps) {
  const frame = atlas.frames[sprite];

  const texture = useMemo(() => {
    const tex = atlasTexture.clone();
    tex.needsUpdate = true;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.repeat.set(frame.w / atlas.width, frame.h / atlas.height);
    tex.offset.set(frame.x / atlas.width, 1 - (frame.y + frame.h) / atlas.height);
    return tex;
  }, [atlasTexture, frame]);

  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} color={tint} />
    </mesh>
  );
}
