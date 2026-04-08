import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useGameStore } from '../state/gameStore';

const FIXED_DT = 1 / 60;
const MAX_ACCUM = 0.2;

export function useGameLoop() {
  const step = useGameStore((state) => state.step);
  const accumulator = useRef(0);

  useFrame((_, delta) => {
    accumulator.current = Math.min(MAX_ACCUM, accumulator.current + delta);
    while (accumulator.current >= FIXED_DT) {
      step(FIXED_DT);
      accumulator.current -= FIXED_DT;
    }
  });
}
