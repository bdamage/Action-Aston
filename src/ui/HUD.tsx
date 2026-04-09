import { useEffect, useRef, useState } from 'react';
import type { FormationType } from '../game/types';

const FORMATION_LABELS: Partial<Record<FormationType, string>> = {
  V: 'V-FORMATION',
  'diagonal-left': 'DIAGONAL ATTACK',
  'diagonal-right': 'DIAGONAL ATTACK',
  arc: 'ARC SWEEP',
  pincer: 'PINCER INCOMING',
};

interface HUDProps {
  score: number;
  wave: number;
  health: number;
  shield: number;
  ammo: number;
  boost: number;
  bossName?: string;
  bossHealth?: number;
  bossMaxHealth?: number;
  lastFormation?: FormationType | null;
  onPause: () => void;
}

function Meter({
  label,
  value,
  max,
  color,
  compact = false
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  compact?: boolean;
}) {
  const ratio = Math.max(0, Math.min(1, value / max));
  return (
    <div className={compact ? 'min-w-0 rounded-md bg-white/5 p-1' : 'min-w-0 rounded-lg bg-white/5 p-2'}>
      <div className={compact ? 'flex items-center justify-between text-[9px] text-slate-200' : 'flex items-center justify-between text-xs text-slate-200'}>
        <span>{label}</span>
        <span>{Math.ceil(value)}</span>
      </div>
      <div className={compact ? 'mt-0.5 h-1.5 w-full overflow-hidden rounded bg-black/40' : 'mt-1 h-2 w-full overflow-hidden rounded bg-black/40'}>
        <div className="h-full rounded" style={{ width: `${ratio * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function HUD({ score, wave, health, shield, ammo, boost, bossName, bossHealth, bossMaxHealth, lastFormation, onPause }: HUDProps) {
  const showBossBar =
    typeof bossHealth === 'number' && typeof bossMaxHealth === 'number' && bossMaxHealth > 0;
  const bossRatio =
    showBossBar
      ? Math.max(0, Math.min(1, bossHealth / bossMaxHealth))
      : 0;

  const [announcementText, setAnnouncementText] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastFormation) return;
    const label = FORMATION_LABELS[lastFormation];
    if (!label) return;

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setAnnouncementText(label);
    setVisible(true);
    fadeTimerRef.current = setTimeout(() => setVisible(false), 1600);
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [lastFormation]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {announcementText && (
        <div
          className="pointer-events-none absolute left-1/2 top-[max(5rem,calc(env(safe-area-inset-top)+4rem))] z-30 -translate-x-1/2 select-none text-center text-sm font-bold uppercase tracking-[0.2em] text-cyan-200"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.45s ease-out',
            textShadow: '0 0 14px rgba(100,220,255,0.85)',
          }}
        >
          {announcementText}
        </div>
      )}
      <div className="pointer-events-auto absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-xl bg-black/45 p-3 text-right backdrop-blur">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Score</div>
          <div className="text-3xl font-bold leading-none text-hud">{score}</div>
        </div>
        <div className="mt-1 text-sm text-cyan-200">Wave {wave}</div>
        <button
          type="button"
          onClick={onPause}
          className="mt-2 rounded-lg bg-cyan-400/20 px-3 py-2 text-xs font-bold text-cyan-100"
        >
          Pause
        </button>
      </div>

      <div className="pointer-events-auto absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] w-[min(6.4rem,42vw)] space-y-1 rounded-lg bg-black/45 p-1 backdrop-blur">
        <Meter label="Health" value={health} max={100} color="#59f6a6" compact />
        <Meter label="Shield" value={shield} max={60} color="#4c8fff" compact />
        <Meter label="Ammo" value={ammo} max={220} color="#fdd065" compact />
      </div>

      {showBossBar && (
        <div className="pointer-events-none absolute left-1/2 top-[max(4.25rem,calc(env(safe-area-inset-top)+3.75rem))] z-30 w-[min(20rem,72vw)] -translate-x-1/2 rounded-lg border border-rose-300/55 bg-black/65 px-3 py-2 shadow-[0_10px_24px_rgba(255,90,120,0.18)] backdrop-blur">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-rose-100">
            <span>{bossName ?? 'Boss'}</span>
            <span>
              {Math.ceil(Math.max(0, bossHealth))} / {Math.ceil(Math.max(0, bossMaxHealth))} HP
            </span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded bg-black/50">
            <div
              className="h-full rounded bg-rose-400"
              style={{ width: `${bossRatio * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="pointer-events-auto absolute bottom-[max(5.8rem,env(safe-area-inset-bottom))] right-3 w-[min(13rem,36vw)] rounded-xl bg-black/45 p-3 backdrop-blur">
        <div className="text-xs uppercase tracking-wider text-slate-300">Boost</div>
        <div className="mt-2">
          <Meter label="Boost" value={boost} max={12} color="#ef69ff" />
        </div>
      </div>
    </div>
  );
}
