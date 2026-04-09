import menuBackgroundUrl from '../assets/menu_background.png';
import mobileLogoUrl from '../assets/mobile_logo.png';
import heroesUrl from '../assets/heros.png';
import type { LeaderboardEntry } from '../app/leaderboard';

interface MainMenuProps {
  onStart: () => void;
  onOpenAlignment?: () => void;
  onOpenClippingDebug?: () => void;
  onOpenOptions: () => void;
  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  leaderboardError: string | null;
}

export function MainMenu({
  onStart,
  onOpenAlignment,
  onOpenClippingDebug,
  onOpenOptions,
  leaderboard,
  loadingLeaderboard,
  leaderboardError,
}: MainMenuProps) {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <img
        src={menuBackgroundUrl}
        alt="Main menu background"
        className="menu-bg-image absolute inset-0 h-full w-full"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

      <div className="menu-hero-side menu-hero-side-left" aria-hidden="true">
        <div className="menu-hero-upper-crop">
          <img
            src={heroesUrl}
            alt=""
            className="menu-hero-image menu-hero-image-left"
            draggable={false}
          />
        </div>
      </div>

      <div className="menu-hero-side menu-hero-side-right" aria-hidden="true">
        <div className="menu-hero-upper-crop">
          <img
            src={heroesUrl}
            alt=""
            className="menu-hero-image menu-hero-image-right"
            draggable={false}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 top-[max(1.25rem,env(safe-area-inset-top))] flex justify-center px-4 sm:top-[max(1.5rem,env(safe-area-inset-top))]">
        <img
          src={mobileLogoUrl}
          alt="Action Aston"
          className="menu-logo-float w-[min(84vw,26rem)] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
          draggable={false}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:px-5">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-cyan-200/25 bg-black/55 p-4 shadow-glow backdrop-blur-md sm:p-6">

          <div className="rounded-xl border border-cyan-200/25 bg-black/35 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/85">Top Pilots</p>
            {loadingLeaderboard && <p className="mt-2 text-xs text-slate-300">Loading leaderboard...</p>}
            {!loadingLeaderboard && leaderboardError && (
              <p className="mt-2 text-xs text-rose-200">{leaderboardError}</p>
            )}
            {!loadingLeaderboard && !leaderboardError && leaderboard.length === 0 && (
              <p className="mt-2 text-xs text-slate-300">No scores yet. Be the first.</p>
            )}
            {!loadingLeaderboard && !leaderboardError && leaderboard.length > 0 && (
              <ol className="mt-2 grid gap-1 text-sm text-slate-100">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-md bg-black/35 px-2 py-1">
                    <span>
                      {index + 1}. {entry.name}
                    </span>
                    <span className="font-black text-cyan-100">{entry.score}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>


          <button
            type="button"
            onClick={onStart}
            className="mt-5 w-full rounded-xl bg-neon px-4 py-4 text-lg font-bold text-slate-900 active:scale-[0.98]"
          >
            Start Mission
          </button>

          {onOpenAlignment && (
            <button
              type="button"
              onClick={onOpenAlignment}
              className="mt-3 w-full rounded-xl bg-slate-200/95 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 active:scale-[0.98]"
            >
              Sprite Alignment
            </button>
          )}

          {onOpenClippingDebug && (
            <button
              type="button"
              onClick={onOpenClippingDebug}
              className="mt-3 w-full rounded-xl bg-slate-200/95 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 active:scale-[0.98]"
            >
              Clipping Debug
            </button>
          )}

          <button
            type="button"
            onClick={onOpenOptions}
            className="mt-3 w-full rounded-xl border border-cyan-200/60 bg-black/50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-100 active:scale-[0.98]"
          >
            Options
          </button>
        </div>
      </div>
    </div>
  );
}
