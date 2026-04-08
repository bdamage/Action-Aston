interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onExit: () => void;
}

export function GameOverOverlay({ score, onRestart, onExit }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-rose-300/35 bg-ink/90 p-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-wider text-rose-200">Game Over</h2>
        <p className="mt-3 text-sm text-slate-300">Final score</p>
        <p className="text-4xl font-black text-rose-100">{score}</p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-ember px-4 py-4 text-lg font-bold text-slate-900"
          >
            Restart
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
