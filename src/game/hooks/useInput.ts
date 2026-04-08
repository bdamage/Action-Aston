import { useEffect } from 'react';
import { useGameStore } from '../state/gameStore';

export function useInputBindings() {
  const setMovement = useGameStore((state) => state.setMovement);
  const setShooting = useGameStore((state) => state.setShooting);

  useEffect(() => {
    const keys = new Set<string>();

    const updateMovement = () => {
      const x = (keys.has('arrowright') || keys.has('d') ? 1 : 0) -
        (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
      const y = (keys.has('arrowup') || keys.has('w') ? 1 : 0) -
        (keys.has('arrowdown') || keys.has('s') ? 1 : 0);
      setMovement({ x, y });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        event.preventDefault();
      }
      keys.add(key);
      if (key === ' ') {
        setShooting(true);
      }
      updateMovement();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.delete(key);
      if (key === ' ') {
        setShooting(false);
      }
      updateMovement();
    };

    const onMouseDown = () => setShooting(true);
    const onMouseUp = () => setShooting(false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      setMovement({ x: 0, y: 0 });
      setShooting(false);
    };
  }, [setMovement, setShooting]);
}
