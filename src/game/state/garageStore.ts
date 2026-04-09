import {create} from "zustand";

// ─── Upgrade definitions ────────────────────────────────────────────────────

export interface UpgradeTier {
  name: string;
  description: string;
  cost: number; // cumulative total to own this tier
}

export const WEAPON_TIERS: UpgradeTier[] = [
  {name: "Standard Blaster", description: "Normal fire rate", cost: 0},
  {name: "Rapid Blaster", description: "+25% fire rate", cost: 120},
  {name: "Plasma Cannon", description: "+50% fire rate", cost: 300},
];

export const SHIELD_TIERS: UpgradeTier[] = [
  {name: "Basic Shields", description: "60 max shield", cost: 0},
  {name: "Reinforced Shields", description: "90 max shield", cost: 100},
  {name: "Aegis Shields", description: "120 max shield", cost: 260},
];

export const BOOST_TIERS: UpgradeTier[] = [
  {name: "No Starter Boost", description: "Boost via pickups only", cost: 0},
  {name: "Nitro Start", description: "Start with 4 s boost", cost: 90},
  {name: "Overdrive", description: "Start with 8 s boost", cost: 220},
];

export interface SkinOption {
  name: string;
  description: string;
  color: string;
  cost: number;
}

export const SKIN_OPTIONS: SkinOption[] = [
  {name: "Default", description: "Original look", color: "#ffffff", cost: 0},
  {
    name: "Nova Red",
    description: "Fiery red tint",
    color: "#ff7070",
    cost: 180,
  },
  {name: "Emerald", description: "Emerald green", color: "#6bffb8", cost: 180},
  {
    name: "Solar Gold",
    description: "Golden chrome",
    color: "#ffd060",
    cost: 280,
  },
];

// ─── Persistence helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "actionAston_garage";

interface PersistedGarage {
  weaponLevel: number;
  shieldLevel: number;
  boostLevel: number;
  activeSkinIndex: number;
  purchasedSkins: number[]; // which skin indices have been bought
}

function loadGarage(): PersistedGarage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedGarage>;
      return {
        weaponLevel: Math.max(0, Math.min(2, parsed.weaponLevel ?? 0)),
        shieldLevel: Math.max(0, Math.min(2, parsed.shieldLevel ?? 0)),
        boostLevel: Math.max(0, Math.min(2, parsed.boostLevel ?? 0)),
        activeSkinIndex: Math.max(0, Math.min(3, parsed.activeSkinIndex ?? 0)),
        purchasedSkins: Array.isArray(parsed.purchasedSkins)
          ? parsed.purchasedSkins
          : [0],
      };
    }
  } catch {
    /* ignore */
  }
  return {
    weaponLevel: 0,
    shieldLevel: 0,
    boostLevel: 0,
    activeSkinIndex: 0,
    purchasedSkins: [0],
  };
}

function saveGarage(state: PersistedGarage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export interface GarageStore extends PersistedGarage {
  upgradeWeapon: (spendCoins: (amount: number) => boolean) => boolean;
  upgradeShield: (spendCoins: (amount: number) => boolean) => boolean;
  upgradeBoost: (spendCoins: (amount: number) => boolean) => boolean;
  buySkin: (
    skinIndex: number,
    spendCoins: (amount: number) => boolean,
  ) => boolean;
  setActiveSkin: (skinIndex: number) => void;
}

export const useGarageStore = create<GarageStore>((set, get) => {
  const initial = loadGarage();

  return {
    ...initial,

    upgradeWeapon: (spendCoins) => {
      const {weaponLevel} = get();
      const nextLevel = weaponLevel + 1;
      if (nextLevel >= WEAPON_TIERS.length) return false;
      const cost =
        WEAPON_TIERS[nextLevel].cost - WEAPON_TIERS[weaponLevel].cost;
      if (!spendCoins(cost)) return false;
      const updated = {...get(), weaponLevel: nextLevel};
      saveGarage(updated);
      set({weaponLevel: nextLevel});
      return true;
    },

    upgradeShield: (spendCoins) => {
      const {shieldLevel} = get();
      const nextLevel = shieldLevel + 1;
      if (nextLevel >= SHIELD_TIERS.length) return false;
      const cost =
        SHIELD_TIERS[nextLevel].cost - SHIELD_TIERS[shieldLevel].cost;
      if (!spendCoins(cost)) return false;
      const updated = {...get(), shieldLevel: nextLevel};
      saveGarage(updated);
      set({shieldLevel: nextLevel});
      return true;
    },

    upgradeBoost: (spendCoins) => {
      const {boostLevel} = get();
      const nextLevel = boostLevel + 1;
      if (nextLevel >= BOOST_TIERS.length) return false;
      const cost = BOOST_TIERS[nextLevel].cost - BOOST_TIERS[boostLevel].cost;
      if (!spendCoins(cost)) return false;
      const updated = {...get(), boostLevel: nextLevel};
      saveGarage(updated);
      set({boostLevel: nextLevel});
      return true;
    },

    buySkin: (skinIndex, spendCoins) => {
      const {purchasedSkins} = get();
      if (purchasedSkins.includes(skinIndex)) return false;
      const cost = SKIN_OPTIONS[skinIndex].cost;
      if (!spendCoins(cost)) return false;
      const newPurchasedSkins = [...purchasedSkins, skinIndex];
      const updated = {
        ...get(),
        purchasedSkins: newPurchasedSkins,
        activeSkinIndex: skinIndex,
      };
      saveGarage(updated);
      set({purchasedSkins: newPurchasedSkins, activeSkinIndex: skinIndex});
      return true;
    },

    setActiveSkin: (skinIndex) => {
      const updated = {...get(), activeSkinIndex: skinIndex};
      saveGarage(updated);
      set({activeSkinIndex: skinIndex});
    },
  };
});

// ─── Derived helpers (used by gameStore to build starting player) ────────────

/** Shoot cooldown in seconds for a given weapon level (normal / while boosting). */
export function weaponShootCooldown(level: number): number {
  if (level >= 2) return 0.12; // –33 %
  if (level >= 1) return 0.145; // –19 %
  return 0.18; // base
}

/** Max shield for a given shield level. */
export function shieldMaxForLevel(level: number): number {
  if (level >= 2) return 120;
  if (level >= 1) return 90;
  return 60;
}

/** Starting boost timer (seconds) for a given boost level. */
export function startingBoostTimer(level: number): number {
  if (level >= 2) return 8;
  if (level >= 1) return 4;
  return 0;
}
