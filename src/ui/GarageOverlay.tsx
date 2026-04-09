import { useState } from 'react';
import garageUrl from '../assets/garage.png';
import {
  useGarageStore,
  WEAPON_TIERS,
  SHIELD_TIERS,
  HEALTH_TIERS,
  AMMO_TIERS,
  BOOST_TIERS,
  SKIN_OPTIONS,
} from '../game/state/garageStore';
import { useGameStore } from '../game/state/gameStore';

interface GarageOverlayProps {
  onClose: () => void;
}

type Tab = 'upgrades' | 'skins';

// ─── Upgrade card ────────────────────────────────────────────────────────────

interface UpgradeCardProps {
  label: string;
  icon: string;
  currentLevel: number;
  tiers: { name: string; description: string; cost: number }[];
  onUpgrade: () => void;
  coins: number;
}

function UpgradeCard({ label, icon, currentLevel, tiers, onUpgrade, coins }: UpgradeCardProps) {
  const maxLevel = tiers.length - 1;
  const isMaxed = currentLevel >= maxLevel;
  const nextTier = tiers[currentLevel + 1];
  const upgradeCost = nextTier ? nextTier.cost - tiers[currentLevel].cost : 0;
  const canAfford = coins >= upgradeCost;

  return (
    <div className="rounded-xl border border-cyan-200/20 bg-black/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-bold uppercase tracking-wide text-cyan-100">{label}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-300">{tiers[currentLevel].name}</p>
          <p className="text-xs text-slate-400">{tiers[currentLevel].description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex gap-1">
            {tiers.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-5 rounded-full ${i <= currentLevel ? 'bg-cyan-300' : 'bg-white/15'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400">Lvl {currentLevel + 1}/{tiers.length}</p>
        </div>
      </div>

      {!isMaxed && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Next: <span className="text-cyan-200">{nextTier.name}</span>
            <br />
            <span className="text-slate-400">{nextTier.description}</span>
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            disabled={!canAfford}
            className="ml-2 shrink-0 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            🪙 {upgradeCost}
          </button>
        </div>
      )}

      {isMaxed && (
        <p className="mt-2 text-center text-xs font-bold uppercase tracking-wider text-cyan-300">
          ✦ Maxed Out ✦
        </p>
      )}
    </div>
  );
}

// ─── Main overlay ────────────────────────────────────────────────────────────

export function GarageOverlay({ onClose }: GarageOverlayProps) {
  const [tab, setTab] = useState<Tab>('upgrades');
  const [flash, setFlash] = useState<string | null>(null);

  const totalCoins = useGameStore((state) => state.totalCoins);
  const spendCoins = useGameStore((state) => state.spendCoins);

  const weaponLevel     = useGarageStore((state) => state.weaponLevel);
  const shieldLevel     = useGarageStore((state) => state.shieldLevel);
  const healthLevel     = useGarageStore((state) => state.healthLevel);
  const ammoLevel       = useGarageStore((state) => state.ammoLevel);
  const boostLevel      = useGarageStore((state) => state.boostLevel);
  const activeSkinIndex = useGarageStore((state) => state.activeSkinIndex);
  const purchasedSkins  = useGarageStore((state) => state.purchasedSkins);

  const upgradeWeapon = useGarageStore((state) => state.upgradeWeapon);
  const upgradeShield = useGarageStore((state) => state.upgradeShield);
  const upgradeHealth = useGarageStore((state) => state.upgradeHealth);
  const upgradeAmmo   = useGarageStore((state) => state.upgradeAmmo);
  const upgradeBoost  = useGarageStore((state) => state.upgradeBoost);
  const buySkin       = useGarageStore((state) => state.buySkin);
  const setActiveSkin = useGarageStore((state) => state.setActiveSkin);

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1600);
  }

  function handleUpgrade(fn: (spend: (n: number) => boolean) => boolean, successMsg: string) {
    const ok = fn(spendCoins);
    if (ok) showFlash(successMsg);
    else    showFlash('Not enough coins!');
  }

  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      <img
        src={garageUrl}
        alt="Garage background"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

      <div className="absolute inset-0 flex flex-col overflow-hidden px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-widest text-cyan-100 drop-shadow">
            Garage
          </h2>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-yellow-300/50 bg-black/50 px-3 py-1 text-sm font-bold text-yellow-200">
              🪙 {totalCoins}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-cyan-200/40 bg-black/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cyan-100 active:scale-95"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Flash */}
        <div
          className={`mt-2 overflow-hidden text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 ${flash ? 'max-h-8 text-cyan-300 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {flash}
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-2">
          {(['upgrades', 'skins'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                tab === t
                  ? 'bg-cyan-400 text-slate-900'
                  : 'border border-cyan-200/30 bg-black/40 text-cyan-200'
              }`}
            >
              {t === 'upgrades' ? '⚙️ Upgrades' : '🎨 Skins'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="mt-3 flex-1 overflow-y-auto">
          {tab === 'upgrades' && (
            <div className="flex flex-col gap-3 pb-2">
              <UpgradeCard
                label="Weapon"
                icon="🔫"
                currentLevel={weaponLevel}
                tiers={WEAPON_TIERS}
                coins={totalCoins}
                onUpgrade={() => handleUpgrade(upgradeWeapon, 'Weapon upgraded!')}
              />
              <UpgradeCard
                label="Shields"
                icon="🛡️"
                currentLevel={shieldLevel}
                tiers={SHIELD_TIERS}
                coins={totalCoins}
                onUpgrade={() => handleUpgrade(upgradeShield, 'Shields upgraded!')}
              />
              <UpgradeCard
                label="Health"
                icon="❤️"
                currentLevel={healthLevel}
                tiers={HEALTH_TIERS}
                coins={totalCoins}
                onUpgrade={() => handleUpgrade(upgradeHealth, 'Health upgraded!')}
              />
              <UpgradeCard
                label="Ammo"
                icon="🔋"
                currentLevel={ammoLevel}
                tiers={AMMO_TIERS}
                coins={totalCoins}
                onUpgrade={() => handleUpgrade(upgradeAmmo, 'Ammo upgraded!')}
              />
              <UpgradeCard
                label="Boost"
                icon="⚡"
                currentLevel={boostLevel}
                tiers={BOOST_TIERS}
                coins={totalCoins}
                onUpgrade={() => handleUpgrade(upgradeBoost, 'Boost upgraded!')}
              />
            </div>
          )}

          {tab === 'skins' && (
            <div className="grid grid-cols-2 gap-3 pb-2">
              {SKIN_OPTIONS.map((skin, i) => {
                const owned     = purchasedSkins.includes(i);
                const isActive  = activeSkinIndex === i;
                const canAfford = totalCoins >= skin.cost;

                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 ${
                      isActive ? 'border-cyan-300 bg-cyan-900/40' : 'border-white/15 bg-black/50'
                    }`}
                  >
                    <div
                      className="mx-auto mb-2 h-10 w-10 rounded-full border-2 border-white/20 shadow-lg"
                      style={{ backgroundColor: skin.color }}
                    />
                    <p className="text-center text-xs font-bold text-slate-100">{skin.name}</p>
                    <p className="text-center text-[10px] text-slate-400">{skin.description}</p>

                    {owned && isActive && (
                      <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-cyan-300">Active</p>
                    )}
                    {owned && !isActive && (
                      <button
                        type="button"
                        onClick={() => { setActiveSkin(i); showFlash(`${skin.name} equipped!`); }}
                        className="mt-2 w-full rounded-lg bg-white/15 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-100 active:scale-95"
                      >
                        Equip
                      </button>
                    )}
                    {!owned && (
                      <button
                        type="button"
                        onClick={() => handleUpgrade((spend) => buySkin(i, spend), `${skin.name} unlocked!`)}
                        disabled={!canAfford}
                        className="mt-2 w-full rounded-lg bg-cyan-400 py-1 text-[10px] font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                      >
                        🪙 {skin.cost === 0 ? 'Free' : skin.cost}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
