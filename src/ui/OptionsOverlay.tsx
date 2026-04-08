interface OptionsOverlayProps {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  onMusicEnabledChange: (enabled: boolean) => void;
  onSfxEnabledChange: (enabled: boolean) => void;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  onClose: () => void;
}

function percent(volume: number) {
  return Math.round(volume * 100);
}

export function OptionsOverlay({
  musicEnabled,
  sfxEnabled,
  musicVolume,
  sfxVolume,
  onMusicEnabledChange,
  onSfxEnabledChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onClose,
}: OptionsOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-300/30 bg-ink/95 p-5 sm:p-6">
        <h2 className="text-center text-2xl font-black uppercase tracking-wider text-cyan-100">Options</h2>

        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between rounded-xl border border-cyan-200/20 bg-black/35 px-3 py-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-100">Music Enabled</span>
            <input
              type="checkbox"
              checked={musicEnabled}
              onChange={(event) => onMusicEnabledChange(event.target.checked)}
              className="h-5 w-5 accent-cyan-300"
            />
          </label>

          <div className="rounded-xl border border-cyan-200/20 bg-black/35 px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-100">Music Volume</span>
              <span className="text-xs font-bold text-cyan-100">{percent(musicVolume)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={musicVolume}
              disabled={!musicEnabled}
              onChange={(event) => onMusicVolumeChange(Number(event.target.value))}
              className="w-full accent-cyan-300 disabled:opacity-40"
            />
          </div>

          <label className="flex items-center justify-between rounded-xl border border-cyan-200/20 bg-black/35 px-3 py-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-100">SFX Enabled</span>
            <input
              type="checkbox"
              checked={sfxEnabled}
              onChange={(event) => onSfxEnabledChange(event.target.checked)}
              className="h-5 w-5 accent-cyan-300"
            />
          </label>

          <div className="rounded-xl border border-cyan-200/20 bg-black/35 px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-100">SFX Volume</span>
              <span className="text-xs font-bold text-cyan-100">{percent(sfxVolume)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={sfxVolume}
              disabled={!sfxEnabled}
              onChange={(event) => onSfxVolumeChange(Number(event.target.value))}
              className="w-full accent-cyan-300 disabled:opacity-40"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-neon px-4 py-3 text-base font-bold text-slate-900"
        >
          Back
        </button>
      </div>
    </div>
  );
}
