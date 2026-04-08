interface HUDProps {
  score: number;
  wave: number;
  health: number;
  shield: number;
  ammo: number;
  boost: number;
  onPause: () => void;
}

function Meter({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const ratio = Math.max(0, Math.min(1, value / max));
  return (
    <div className="min-w-0 rounded-lg bg-white/5 p-2">
      <div className="flex items-center justify-between text-xs text-slate-200">
        <span>{label}</span>
        <span>{Math.ceil(value)}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded bg-black/40">
        <div className="h-full rounded" style={{ width: `${ratio * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function HUD({ score, wave, health, shield, ammo, boost, onPause }: HUDProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto mx-auto flex w-full max-w-2xl items-start justify-between gap-3 rounded-xl border border-cyan-300/25 bg-black/45 p-3 backdrop-blur">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
          <Meter label="Health" value={health} max={100} color="#59f6a6" />
          <Meter label="Shield" value={shield} max={60} color="#4c8fff" />
          <Meter label="Ammo" value={ammo} max={220} color="#fdd065" />
          <Meter label="Boost" value={boost} max={12} color="#ef69ff" />
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Score</div>
            <div className="text-xl font-bold text-hud">{score}</div>
          </div>
          <div className="text-xs text-cyan-200">Wave {wave}</div>
          <button
            type="button"
            onClick={onPause}
            className="rounded-lg border border-cyan-200/35 bg-cyan-400/20 px-3 py-2 text-xs font-bold text-cyan-100"
          >
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}
