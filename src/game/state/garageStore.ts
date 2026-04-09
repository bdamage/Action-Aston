import {create} from "zustand";

// ─── Upgrade definitions ────────────────────────────────────────────────────

export interface UpgradeTier {
  name: string;
  description: string;
  cost: number; // cumulative total to own this tier
}

export const WEAPON_TIERS: UpgradeTier[] = [
  {name: "Standard Blaster", description: "Normal fire rate", cost: 0},
  {name: "Rapid Blaster", description: "+25% fire rate", cost: 600},
  {name: "Plasma Cannon", description: "+50% fire rate", cost: 1500},
];

export const SHIELD_TIERS: UpgradeTier[] = [
  {name: "Basic Shields", description: "60 max shield", cost: 0},
  {name: "Reinforced Shields", description: "75 max shield", cost: 500},
  {name: "Aegis Shields", description: "90 max shield", cost: 1300},
  {name: "Hardened Shields", description: "110 max shield", cost: 2500},
  {name: "Dense Shields", description: "135 max shield", cost: 4200},
  {name: "Reactive Armor", description: "165 max shield", cost: 6500},
  {name: "Composite Hull", description: "200 max shield", cost: 9500},
  {name: "Phase Barrier", description: "240 max shield", cost: 13500},
  {name: "Quantum Shields", description: "285 max shield", cost: 18500},
  {name: "Nano Armor", description: "340 max shield", cost: 25000},
  {name: "Divine Shield", description: "400 max shield", cost: 33000},
];

export const HEALTH_TIERS: UpgradeTier[] = [
  {name: "Standard Hull", description: "100 max health", cost: 0},
  {name: "Reinforced Hull", description: "120 max health", cost: 400},
  {name: "Hardened Hull", description: "145 max health", cost: 1100},
  {name: "Heavy Plating", description: "175 max health", cost: 2200},
  {name: "Nano Composite", description: "210 max health", cost: 3700},
  {name: "Bio Armor", description: "250 max health", cost: 5800},
  {name: "Crystal Skin", description: "295 max health", cost: 8500},
  {name: "Titan Alloy", description: "345 max health", cost: 12000},
  {name: "Voidium Plating", description: "400 max health", cost: 16500},
  {name: "Dark Matter", description: "460 max health", cost: 22500},
  {name: "Immortal Core", description: "530 max health", cost: 30000},
];

export const AMMO_TIERS: UpgradeTier[] = [
  {name: "Standard Magazine", description: "220 max ammo", cost: 0},
  {name: "Extended Mag", description: "265 max ammo", cost: 350},
  {name: "High-Cap Mag", description: "320 max ammo", cost: 950},
  {name: "Drum Magazine", description: "385 max ammo", cost: 1900},
  {name: "Oversize Tank", description: "460 max ammo", cost: 3200},
  {name: "Energy Cell", description: "545 max ammo", cost: 4900},
  {name: "Plasma Reservoir", description: "640 max ammo", cost: 7100},
  {name: "Quantum Cache", description: "745 max ammo", cost: 9800},
  {name: "Dark Energy Tank", description: "860 max ammo", cost: 13000},
  {name: "Infinite Coil", description: "985 max ammo", cost: 17500},
  {name: "Omni Ammo Core", description: "1120 max ammo", cost: 23000},
];

export const BOOST_TIERS: UpgradeTier[] = [
  {name: "No Starter Boost", description: "Boost via pickups only", cost: 0},
  {name: "Nitro Start", description: "Start with 4 s boost", cost: 450},
  {name: "Overdrive", description: "Start with 8 s boost", cost: 1100},
];

export interface SkinOption {
  name: string;
  description: string;
  frameIndex: number;
  cost: number;
}

export const SKIN_ATLAS = {
  columns: 4,
  rows: 5,
  frameWidth: 256,
  frameHeight: 256,
  imageWidth: 1024,
  imageHeight: 1536,
  frameOffsetX: 0,
  frameOffsetY: 70, //comment
} as const;

export const SKIN_OPTIONS: SkinOption[] = [
  {
    name: "Classic",
    description: "Factory standard ship",
    frameIndex: 0,
    cost: 0,
  },
  {
    name: "Inferno",
    description: "Molten-red strike craft",
    frameIndex: 1,
    cost: 300,
  },
  {
    name: "Verdant",
    description: "Emerald interceptor",
    frameIndex: 2,
    cost: 650,
  },
  {
    name: "Nebula",
    description: "Violet deep-space shell",
    frameIndex: 3,
    cost: 1000,
  },
  {
    name: "Sunflare",
    description: "Amber front armor",
    frameIndex: 4,
    cost: 1400,
  },
  {
    name: "Midnight",
    description: "Darkened cobalt hull",
    frameIndex: 5,
    cost: 1900,
  },
  {
    name: "Radiant",
    description: "Bright yellow cockpit",
    frameIndex: 6,
    cost: 2500,
  },
  {
    name: "Aurora",
    description: "Pink-white polished finish",
    frameIndex: 7,
    cost: 3200,
  },
  {name: "Frostline", description: "Icy cyan frame", frameIndex: 8, cost: 4000},
  {
    name: "Bloodline",
    description: "Crimson hunter variant",
    frameIndex: 9,
    cost: 4900,
  },
  {
    name: "Daystar",
    description: "Gold-white command shell",
    frameIndex: 10,
    cost: 6000,
  },
  {
    name: "Glacier",
    description: "Clean blue-white plating",
    frameIndex: 11,
    cost: 7300,
  },
  {
    name: "Jade Fang",
    description: "Forest-green assault skin",
    frameIndex: 12,
    cost: 8700,
  },
  {
    name: "Rosecore",
    description: "Magenta core fusion",
    frameIndex: 13,
    cost: 10300,
  },
  {
    name: "Skyrift",
    description: "Bright azure wingline",
    frameIndex: 14,
    cost: 12100,
  },
  {
    name: "Royal Ember",
    description: "Purple-gold high rank",
    frameIndex: 15,
    cost: 14100,
  },
  {
    name: "Bloom",
    description: "High-gloss pink chassis",
    frameIndex: 16,
    cost: 16300,
  },
  {
    name: "Solaris",
    description: "Golden-black war paint",
    frameIndex: 17,
    cost: 18700,
  },
  {
    name: "Aether",
    description: "Blue-gold refined profile",
    frameIndex: 18,
    cost: 21300,
  },
  {
    name: "Arctic",
    description: "White sapphire premium",
    frameIndex: 19,
    cost: 24100,
  },
];

// ─── Persistence helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "actionAston_garage";

interface PersistedGarage {
  weaponLevel: number;
  shieldLevel: number;
  healthLevel: number;
  ammoLevel: number;
  boostLevel: number;
  activeSkinIndex: number;
  purchasedSkins: number[]; // which skin indices have been bought
}

function clampSkinIndex(value: number): number {
  return Math.max(0, Math.min(SKIN_OPTIONS.length - 1, value));
}

function sanitizePurchasedSkins(value: unknown): number[] {
  if (!Array.isArray(value)) return [0];

  const skins = Array.from(
    new Set(
      value
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry))
        .map((entry) => clampSkinIndex(entry)),
    ),
  );

  if (!skins.includes(0)) skins.unshift(0);
  return skins;
}

function loadGarage(): PersistedGarage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedGarage>;
      const purchasedSkins = sanitizePurchasedSkins(parsed.purchasedSkins);
      const activeSkinIndex = clampSkinIndex(parsed.activeSkinIndex ?? 0);
      return {
        weaponLevel: Math.max(0, Math.min(2, parsed.weaponLevel ?? 0)),
        shieldLevel: Math.max(0, Math.min(10, parsed.shieldLevel ?? 0)),
        healthLevel: Math.max(0, Math.min(10, parsed.healthLevel ?? 0)),
        ammoLevel: Math.max(0, Math.min(10, parsed.ammoLevel ?? 0)),
        boostLevel: Math.max(0, Math.min(2, parsed.boostLevel ?? 0)),
        activeSkinIndex: purchasedSkins.includes(activeSkinIndex)
          ? activeSkinIndex
          : 0,
        purchasedSkins,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    weaponLevel: 0,
    shieldLevel: 0,
    healthLevel: 0,
    ammoLevel: 0,
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
  upgradeHealth: (spendCoins: (amount: number) => boolean) => boolean;
  upgradeAmmo: (spendCoins: (amount: number) => boolean) => boolean;
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

    upgradeHealth: (spendCoins) => {
      const {healthLevel} = get();
      const nextLevel = healthLevel + 1;
      if (nextLevel >= HEALTH_TIERS.length) return false;
      const cost =
        HEALTH_TIERS[nextLevel].cost - HEALTH_TIERS[healthLevel].cost;
      if (!spendCoins(cost)) return false;
      const updated = {...get(), healthLevel: nextLevel};
      saveGarage(updated);
      set({healthLevel: nextLevel});
      return true;
    },

    upgradeAmmo: (spendCoins) => {
      const {ammoLevel} = get();
      const nextLevel = ammoLevel + 1;
      if (nextLevel >= AMMO_TIERS.length) return false;
      const cost = AMMO_TIERS[nextLevel].cost - AMMO_TIERS[ammoLevel].cost;
      if (!spendCoins(cost)) return false;
      const updated = {...get(), ammoLevel: nextLevel};
      saveGarage(updated);
      set({ammoLevel: nextLevel});
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
      if (skinIndex < 0 || skinIndex >= SKIN_OPTIONS.length) return false;
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
      const {purchasedSkins} = get();
      if (!purchasedSkins.includes(skinIndex)) return;
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

/** Max shield for a given shield level (0–10). */
export function shieldMaxForLevel(level: number): number {
  const values = [60, 75, 90, 110, 135, 165, 200, 240, 285, 340, 400];
  return values[Math.min(level, values.length - 1)];
}

/** Max health for a given health level (0–10). */
export function healthMaxForLevel(level: number): number {
  const values = [100, 120, 145, 175, 210, 250, 295, 345, 400, 460, 530];
  return values[Math.min(level, values.length - 1)];
}

/** Max ammo for a given ammo level (0–10). */
export function ammoMaxForLevel(level: number): number {
  const values = [220, 265, 320, 385, 460, 545, 640, 745, 860, 985, 1120];
  return values[Math.min(level, values.length - 1)];
}

/** Starting boost timer (seconds) for a given boost level. */
export function startingBoostTimer(level: number): number {
  if (level >= 2) return 8;
  if (level >= 1) return 4;
  return 0;
}
