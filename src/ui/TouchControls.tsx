import { useMemo, useRef } from 'react';

interface TouchControlsProps {
  onMove: (x: number, y: number) => void;
  onShoot: (shooting: boolean) => void;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function TouchControls({ onMove, onShoot }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<number | null>(null);

  const joystickBounds = useMemo(() => ({ max: 36 }), []);

  const updateJoystick = (clientX: number, clientY: number) => {
    const root = joystickRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.min(joystickBounds.max, Math.hypot(dx, dy));
    const nx = clamp((Math.cos(angle) * dist) / joystickBounds.max, -1, 1);
    const ny = clamp((Math.sin(angle) * dist) / joystickBounds.max, -1, 1);
    onMove(nx, -ny);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        ref={joystickRef}
        className="pointer-events-auto relative h-24 w-24 rounded-full border border-cyan-200/45 bg-cyan-200/10"
        onPointerDown={(event) => {
          activeId.current = event.pointerId;
          (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
          updateJoystick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (activeId.current !== event.pointerId) return;
          updateJoystick(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (activeId.current !== event.pointerId) return;
          activeId.current = null;
          onMove(0, 0);
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/50" />
      </div>

      <button
        type="button"
        className="pointer-events-auto h-24 w-24 rounded-full border border-rose-200/45 bg-rose-500/35 text-lg font-black uppercase tracking-wider text-rose-100"
        onPointerDown={() => onShoot(true)}
        onPointerUp={() => onShoot(false)}
        onPointerCancel={() => onShoot(false)}
      >
        Fire
      </button>
    </div>
  );
}
