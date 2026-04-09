import { useGameStore } from '../game/state/gameStore';
import type { AlignmentSpriteKey } from '../game/types';

const ENTITY_CONFIG: { key: AlignmentSpriteKey; label: string; color: string }[] = [
  { key: 'player', label: 'Player', color: '#38bdf8' },
  { key: 'enemy', label: 'Enemy', color: '#f97316' },
  { key: 'projectile', label: 'Projectile', color: '#22d3ee' },
  { key: 'pickup', label: 'Pickup', color: '#4ade80' },
];

interface ClippingDebugOverlayProps {
  onClose: () => void;
}

export function ClippingDebugOverlay({ onClose }: ClippingDebugOverlayProps) {
  const alignment = useGameStore((state) => state.alignment);
  const setAlignmentValue = useGameStore((state) => state.setAlignmentValue);
  const resetAlignment = useGameStore((state) => state.resetAlignment);

  return (
    <div className="pointer-events-auto absolute right-3 top-[max(3.5rem,calc(env(safe-area-inset-top)+3rem))] z-40 w-64 rounded-2xl bg-black/75 p-3 backdrop-blur-md sm:w-72 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
          Hitbox Debug
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-slate-700/80 px-2 py-1 text-xs font-bold text-slate-200 hover:bg-slate-600"
        >
          Hide
        </button>
      </div>

      <p className="mt-1 text-[10px] leading-tight text-slate-400">
        Cyan = sprite bounds &nbsp;|&nbsp; Red = collision radius
      </p>

      <div className="mt-3 grid gap-3">
        {ENTITY_CONFIG.map(({ key, label, color }) => {
          const entry = alignment[key];
          return (
            <div key={key} className="rounded-lg bg-slate-900/60 px-2 py-2">
              <div className="mb-1.5 text-xs font-semibold" style={{ color }}>
                {label}
              </div>
              <div className="grid gap-1.5">
                <SliderRow
                  label="Radius"
                  value={entry.radius}
                  min={0.05}
                  max={2.0}
                  step={0.01}
                  color="#ff8a7d"
                  onChange={(v) => setAlignmentValue(key, 'radius', v)}
                />
                <SliderRow
                  label="Width"
                  value={entry.w}
                  min={0.1}
                  max={5.0}
                  step={0.01}
                  color={color}
                  onChange={(v) => setAlignmentValue(key, 'w', v)}
                />
                <SliderRow
                  label="Height"
                  value={entry.h}
                  min={0.1}
                  max={5.0}
                  step={0.01}
                  color={color}
                  onChange={(v) => setAlignmentValue(key, 'h', v)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={resetAlignment}
        className="mt-3 w-full rounded-lg bg-slate-700/70 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-200 hover:bg-slate-600"
      >
        Reset Defaults
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-[10px] text-slate-400">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-cyan-400"
        style={{ accentColor: color }}
      />
      <span className="w-9 text-right text-[10px] tabular-nums text-slate-300">
        {value.toFixed(2)}
      </span>
    </div>
  );
}
