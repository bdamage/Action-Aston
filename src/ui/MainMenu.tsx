import menuBackgroundUrl from '../assets/menu_background.png';
import mobileLogoUrl from '../assets/mobile_logo.png';

interface MainMenuProps {
  onStart: () => void;
  onOpenAlignment: () => void;
}

export function MainMenu({ onStart, onOpenAlignment }: MainMenuProps) {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <img
        src={menuBackgroundUrl}
        alt="Main menu background"
        className="menu-bg-image absolute inset-0 h-full w-full"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

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


          <button
            type="button"
            onClick={onStart}
            className="mt-5 w-full rounded-xl bg-neon px-4 py-4 text-lg font-bold text-slate-900 active:scale-[0.98]"
          >
            Start Mission
          </button>

          <button
            type="button"
            onClick={onOpenAlignment}
            className="mt-3 w-full rounded-xl bg-slate-200/95 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-900 active:scale-[0.98]"
          >
            Sprite Alignment
          </button>
        </div>
      </div>
    </div>
  );
}
