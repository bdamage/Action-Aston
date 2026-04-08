const MENU_BACKGROUND_URL = '/dist/assets/image.png';

interface MainMenuProps {
  onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
  return (
    <div className="absolute inset-0 z-30 overflow-hidden">
      <img
        src={MENU_BACKGROUND_URL}
        alt="Main menu background"
        className="menu-bg-image absolute inset-0 h-full w-full"
        draggable={false}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

      <div className="absolute inset-x-0 bottom-0 px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:px-5">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-cyan-200/25 bg-black/55 p-4 shadow-glow backdrop-blur-md sm:p-6">
          <h1 className="text-center text-2xl font-black uppercase tracking-[0.18em] text-cyan-100 sm:text-4xl">Action Aston</h1>
          <p className="mt-3 text-center text-sm text-slate-200">
            New background active. Main menu is now anchored to the lower part of the screen.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mt-5 w-full rounded-xl bg-neon px-4 py-4 text-lg font-bold text-slate-900 active:scale-[0.98]"
          >
            Start Mission
          </button>
        </div>
      </div>
    </div>
  );
}
