import { atlas, type SpriteKey } from '../assets/assetConfig';

interface SpriteAlignmentOverlayProps {
  onBack: () => void;
}

const FRAME_KEYS = Object.keys(atlas.frames) as SpriteKey[];
const FRAME_COLORS: Record<SpriteKey, string> = {
  player: '#38bdf8',
  enemy01: '#f97316',
  enemy02: '#fb7185',
  enemy03: '#a78bfa',
  laserBlue: '#22d3ee',
  laserRed: '#fb7185',
  pickupHealth: '#4ade80',
  pickupShield: '#60a5fa',
  pickupAmmo: '#facc15',
  pickupBoost: '#e879f9',
  explosion01: '#fb923c',
  explosion02: '#f43f5e',
  explosion03: '#f59e0b'
};

export function SpriteAlignmentOverlay({ onBack }: SpriteAlignmentOverlayProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] sm:px-5">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-black/65 p-3 backdrop-blur-md sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-cyan-100 sm:text-base">
            Sprite Alignment Mode
          </h2>
          <div className="flex items-center gap-2">
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
          Preview sprite boxes and atlas frame coordinates.
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="rounded-lg bg-slate-900/45 p-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
              Atlas Boxes ({atlas.width} x {atlas.height})
            </div>
            <div className="relative mx-auto w-full max-w-[30rem] overflow-hidden rounded border border-cyan-200/20">
              <img src={atlas.url} alt="Sprite atlas" className="block h-auto w-full" draggable={false} />
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${atlas.width} ${atlas.height}`}
                preserveAspectRatio="none"
              >
                {FRAME_KEYS.map((key) => {
                  const frame = atlas.frames[key];
                  const color = FRAME_COLORS[key];
                  return (
                    <g key={key}>
                      <rect
                        x={frame.x}
                        y={frame.y}
                        width={frame.w}
                        height={frame.h}
                        fill="none"
                        stroke={color}
                        strokeWidth={4}
                      />
                      <text
                        x={frame.x + 4}
                        y={Math.max(14, frame.y + 14)}
                        fill={color}
                        fontSize={14}
                        fontWeight={700}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="rounded-lg bg-slate-900/45 p-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
              Frame Coordinates
            </div>
            <div className="max-h-64 overflow-y-auto rounded border border-cyan-200/20 p-2 text-[11px] text-slate-100">
              {FRAME_KEYS.map((key) => {
                const frame = atlas.frames[key];
                return (
                  <div key={key} className="mb-1 rounded bg-black/25 px-2 py-1.5">
                    <div className="font-semibold" style={{ color: FRAME_COLORS[key] }}>
                      {key}
                    </div>
                    <div className="text-slate-300">x: {frame.x}, y: {frame.y}, w: {frame.w}, h: {frame.h}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
