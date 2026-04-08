interface MainMenuProps {
  onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-300/30 bg-ink/85 p-6 text-center shadow-glow backdrop-blur">
        <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-cyan-100">Action Aston</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-200">
          Fast top-down arcade shooter. Dodge enemy waves, grab pickups, and survive as long as possible.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-neon px-4 py-4 text-lg font-bold text-slate-900 active:scale-[0.98]"
        >
          Start Mission
        </button>
      </div>
    </div>
  );
}
