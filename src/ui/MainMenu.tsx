import { atlas, type SpriteKey } from '../assets/assetConfig';

interface MainMenuProps {
  onStart: () => void;
}

const CLIP_ORDER: SpriteKey[] = [
  'player',
  'enemy01',
  'enemy02',
  'enemy03',
  'laserBlue',
  'laserRed',
  'pickupHealth',
  'pickupShield',
  'pickupAmmo',
  'pickupBoost',
  'explosion01',
  'explosion02',
  'explosion03'
];

const CLIP_COLOR: Record<SpriteKey, string> = {
  player: '#6ee7ff',
  enemy01: '#ff8d8d',
  enemy02: '#ffe38e',
  enemy03: '#c5ff8f',
  laserBlue: '#8ff8ff',
  laserRed: '#ff9f8f',
  pickupHealth: '#57f8a0',
  pickupShield: '#4f8dff',
  pickupAmmo: '#ffd05b',
  pickupBoost: '#ff61d8',
  explosion01: '#ff9d63',
  explosion02: '#ffb27b',
  explosion03: '#ffc197'
};

function SpriteClipPreview({ sprite }: { sprite: SpriteKey }) {
  const frame = atlas.frames[sprite];
  const thumbScale = 0.33;

  return (
    <div className="rounded-lg border border-cyan-200/20 bg-black/35 p-2">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-300">
        <span>{sprite}</span>
        <span>{`${frame.x},${frame.y},${frame.w}x${frame.h}`}</span>
      </div>
      <div className="flex min-h-[3.4rem] items-center justify-center rounded bg-black/55 p-2">
        <div
          style={{
            width: Math.max(26, frame.w * thumbScale),
            height: Math.max(24, frame.h * thumbScale),
            backgroundImage: `url(${atlas.url})`,
            backgroundPosition: `${-frame.x * thumbScale}px ${-frame.y * thumbScale}px`,
            backgroundSize: `${atlas.width * thumbScale}px ${atlas.height * thumbScale}px`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
    </div>
  );
}

export function MainMenu({ onStart }: MainMenuProps) {
  const atlasScale = 0.19;

  return (
    <div className="absolute inset-0 z-30 bg-black/60 p-3 sm:p-5">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto,1fr,auto] gap-3 overflow-hidden rounded-2xl border border-cyan-300/30 bg-ink/90 p-4 shadow-glow backdrop-blur sm:p-5">
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-[0.18em] text-cyan-100 sm:text-4xl">Action Aston</h1>
          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            Sprite Clip Inspector: atlasen till vanster visar exakta klipprektanglar, och panelen till hoger visar utskurna sprites.
          </p>
        </div>

        <div className="grid min-h-0 gap-3 lg:grid-cols-[1.2fr,1fr]">
          <div className="min-h-0 overflow-auto rounded-xl border border-cyan-300/20 bg-black/35 p-3">
            <div className="relative mx-auto" style={{ width: atlas.width * atlasScale, height: atlas.height * atlasScale }}>
              <img
                src={atlas.url}
                alt="Sprite atlas"
                className="absolute inset-0 h-full w-full rounded object-cover"
                draggable={false}
              />
              {CLIP_ORDER.map((sprite) => {
                const frame = atlas.frames[sprite];
                return (
                  <div
                    key={sprite}
                    className="absolute rounded-[4px] border"
                    style={{
                      left: frame.x * atlasScale,
                      top: frame.y * atlasScale,
                      width: frame.w * atlasScale,
                      height: frame.h * atlasScale,
                      borderColor: CLIP_COLOR[sprite],
                      boxShadow: `0 0 0.45rem ${CLIP_COLOR[sprite]}70`
                    }}
                    title={sprite}
                  />
                );
              })}
            </div>
          </div>

          <div className="min-h-0 overflow-auto rounded-xl border border-cyan-300/20 bg-black/35 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CLIP_ORDER.map((sprite) => (
                <SpriteClipPreview key={sprite} sprite={sprite} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded-xl bg-neon px-4 py-3 text-base font-bold text-slate-900 active:scale-[0.98]"
          >
            Start Mission
          </button>
          <div className="flex items-center justify-center rounded-xl border border-cyan-200/20 bg-black/30 px-3 py-2 text-center text-xs text-cyan-100/90">
            Om en ruta ser fel ut i inspectorpanelen, justera koordinater i src/assets/assetConfig.ts.
          </div>
        </div>
      </div>
    </div>
  );
}
