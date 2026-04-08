import type { AlignmentField, AlignmentSpriteKey } from '../game/types';
import type { SpriteAlignmentTuning } from '../game/renderTuning';

interface SpriteAlignmentOverlayProps {
  alignment: SpriteAlignmentTuning;
  onSetValue: (sprite: AlignmentSpriteKey, field: AlignmentField, value: number) => void;
  onReset: () => void;
  onBack: () => void;
}

const SPRITES: { key: AlignmentSpriteKey; label: string }[] = [
  { key: 'player', label: 'Player' },
  { key: 'enemy', label: 'Enemy' },
  { key: 'projectile', label: 'Projectile' },
  { key: 'pickup', label: 'Pickup' }
];

function FieldSlider({
  sprite,
  field,
  value,
  min,
  max,
  step,
  onSetValue
}: {
  sprite: AlignmentSpriteKey;
  field: AlignmentField;
  value: number;
  min: number;
  max: number;
  step: number;
  onSetValue: (sprite: AlignmentSpriteKey, field: AlignmentField, value: number) => void;
}) {
  return (
    <label className="block text-[11px] uppercase tracking-wide text-slate-300">
      {field}: <span className="font-semibold text-cyan-100">{value.toFixed(3)}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onSetValue(sprite, field, Number(event.target.value))}
        className="mt-1 w-full accent-cyan-300"
      />
    </label>
  );
}

export function SpriteAlignmentOverlay({
  alignment,
  onSetValue,
  onReset,
  onBack
}: SpriteAlignmentOverlayProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] sm:px-5">
      <div className="mx-auto w-full max-w-5xl rounded-2xl bg-black/65 p-3 backdrop-blur-md sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-cyan-100 sm:text-base">
            Sprite Alignment Mode
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg bg-slate-200/90 px-3 py-2 text-xs font-semibold uppercase text-slate-900"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-neon px-3 py-2 text-xs font-bold uppercase text-slate-900"
            >
              Back To Menu
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-300">
          Tune draw width/height and hit radius live. Preview sprites and hit circles are shown in the scene.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SPRITES.map((sprite) => (
            <div key={sprite.key} className="rounded-lg bg-slate-900/45 p-2">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">{sprite.label}</div>
              <div className="space-y-1.5">
                <FieldSlider
                  sprite={sprite.key}
                  field="w"
                  value={alignment[sprite.key].w}
                  min={0.1}
                  max={4}
                  step={0.01}
                  onSetValue={onSetValue}
                />
                <FieldSlider
                  sprite={sprite.key}
                  field="h"
                  value={alignment[sprite.key].h}
                  min={0.1}
                  max={4}
                  step={0.01}
                  onSetValue={onSetValue}
                />
                <FieldSlider
                  sprite={sprite.key}
                  field="radius"
                  value={alignment[sprite.key].radius}
                  min={0.05}
                  max={2}
                  step={0.01}
                  onSetValue={onSetValue}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
