interface GameOverOverlayProps {
  score: number;
  playerName: string;
  submitState: 'idle' | 'saving' | 'saved' | 'error';
  submitMessage: string | null;
  hasSubmitted: boolean;
  onNameChange: (value: string) => void;
  onSubmitScore: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function GameOverOverlay({
  score,
  playerName,
  submitState,
  submitMessage,
  hasSubmitted,
  onNameChange,
  onSubmitScore,
  onRestart,
  onExit,
}: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-rose-300/35 bg-ink/90 p-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-wider text-rose-200">Game Over</h2>
        <p className="mt-3 text-sm text-slate-300">Final score</p>
        <p className="text-4xl font-black text-rose-100">{score}</p>
        <div className="mt-5 text-left">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300" htmlFor="leaderboard-name">
            Pilot Callsign
          </label>
          <input
            id="leaderboard-name"
            value={playerName}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={18}
            placeholder="Your name"
            className="w-full rounded-lg border border-slate-500 bg-slate-950/70 px-3 py-2 text-base text-slate-100 outline-none ring-cyan-300/55 transition focus:ring"
          />
          <button
            type="button"
            onClick={onSubmitScore}
            disabled={submitState === 'saving' || hasSubmitted}
            className="mt-3 w-full rounded-xl bg-cyan-200 px-4 py-3 text-base font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState === 'saving' ? 'Uploading score...' : hasSubmitted ? 'Score Submitted' : 'Submit to Leaderboard'}
          </button>
          {submitMessage && <p className="mt-2 text-xs text-slate-300">{submitMessage}</p>}
        </div>
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
