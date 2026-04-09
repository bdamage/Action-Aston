import { useEffect, useRef, useState } from 'react';
import type { FormationType } from '../game/types';
import { HALF_HEIGHT } from '../game/constants';
import pickupHomingMissileUrl from '../assets/pickup_homingmissile.png';
import pickupSpeedUrl from '../assets/pickup_speed.png';

const FORMATION_LABELS: Partial<Record<FormationType, string>> = {
  V: 'V-FORMATION',
  'diagonal-left': 'DIAGONAL ATTACK',
  'diagonal-right': 'DIAGONAL ATTACK',
  arc: 'ARC SWEEP',
  pincer: 'PINCER INCOMING',
};

interface HUDProps {
  score: number;
  coins: number;
  wave: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  maxAmmo: number;
  homingMissiles: number;
  speedBoostTimer: number;
  bossName?: string;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossWorldX?: number;
  bossWorldY?: number;
  lastFormation?: FormationType | null;
  onPause: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

export function HUD({ score, coins, wave, health, maxHealth, shield, maxShield, ammo, maxAmmo, homingMissiles, speedBoostTimer, bossName, bossHealth, bossMaxHealth, bossWorldX, bossWorldY, lastFormation, onPause }: HUDProps) {
  const showBossBar =
    typeof bossHealth === 'number' && typeof bossMaxHealth === 'number' && bossMaxHealth > 0;
  const bossRatio =
    showBossBar
      ? Math.max(0, Math.min(1, bossHealth / bossMaxHealth))
      : 0;

  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  const [announcementText, setAnnouncementText] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const trackedBossBarStyle = (() => {
    if (!showBossBar || typeof bossWorldX !== 'number' || typeof bossWorldY !== 'number') {
      return null;
    }

    const aspect = viewportSize.height > 0 ? viewportSize.width / viewportSize.height : 1;
    const halfWidth = HALF_HEIGHT * aspect;
    const xPct = ((bossWorldX + halfWidth) / (halfWidth * 2)) * 100;
    const yPct = ((HALF_HEIGHT - bossWorldY) / (HALF_HEIGHT * 2)) * 100;
    const topPct = clamp(yPct - 7, 8, 66);
    const edgeFade = clamp((topPct - 8) / 7, 0.45, 1);

    return {
      left: `${clamp(xPct, 9, 91)}%`,
      top: `${topPct}%`,
      opacity: edgeFade,
    };
  })();

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
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <span className="text-[11px] font-bold text-yellow-300">⬡</span>
          <span className="text-sm font-bold leading-none text-yellow-300">{coins}</span>
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
        <Meter label="Health" value={health} max={maxHealth} color="#59f6a6" compact />
        <Meter label="Shield" value={shield} max={maxShield} color="#4c8fff" compact />
        <Meter label="Ammo" value={ammo} max={maxAmmo} color="#fdd065" compact />
      </div>

      {showBossBar && trackedBossBarStyle && (
        <div
          title={bossName ?? 'Boss'}
          className="pointer-events-none absolute z-30 w-[min(8.5rem,36vw)] -translate-x-1/2 rounded-md border border-rose-300/45 bg-black/55 px-1.5 py-1 shadow-[0_6px_12px_rgba(255,90,120,0.12)] backdrop-blur"
          style={trackedBossBarStyle}
        >
          <div className="h-1.5 w-full overflow-hidden rounded bg-black/55">
            <div className="h-full rounded bg-rose-400" style={{ width: `${bossRatio * 100}%` }} />
          </div>
        </div>
      )}

      <div className="pointer-events-auto absolute bottom-[max(5.8rem,env(safe-area-inset-bottom))] right-3 flex items-end gap-3 rounded-xl bg-black/45 p-3 backdrop-blur">
        <img
          src={pickupHomingMissileUrl}
          alt="Homing missile pickup"
          className="h-8 w-8 object-contain"
          style={{ opacity: homingMissiles > 0 ? 1 : 0.35 }}
        />
        <img
          src={pickupSpeedUrl}
          alt="Speed boost pickup"
          className="h-12 w-12 object-contain"
          style={{ opacity: speedBoostTimer > 0 ? 1 : 0.35 }}
        />
      </div>
    </div>
  );
}
