interface PauseOverlayProps {
  onResume: () => void;
  onExit: () => void;
}

export function PauseOverlay({ onResume, onExit }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-cyan-300/30 bg-ink/90 p-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-wider text-cyan-100">Paused</h2>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onResume}
            className="rounded-xl bg-neon px-4 py-4 text-lg font-bold text-slate-900"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl border border-slate-500 px-4 py-4 text-base font-semibold text-slate-200"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
