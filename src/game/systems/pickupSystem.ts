import type {Pickup, PickupType} from "../types";

const PICKUP_WEIGHTS: Array<{type: PickupType; weight: number}> = [
  {type: "health", weight: 0.17},
  {type: "shield", weight: 0.15},
  {type: "ammo", weight: 0.17},
  {type: "boost", weight: 0.12},
  // Speed-up is intentionally common compared to the stronger tactical pickups.
  {type: "speedUp", weight: 0.28},
  {type: "homingMissiles", weight: 0.08},
  {type: "waveClear", weight: 0.03},
];

export function randomPickupType(): PickupType {
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of PICKUP_WEIGHTS) {
    cumulative += entry.weight;
    if (roll <= cumulative) return entry.type;
  }
  return "speedUp";
}

export function createPickup(
  id: number,
  x: number,
  y: number,
  type: PickupType,
  radius = 0.4,
): Pickup {
  return {
    id,
    type,
    position: {x, y},
    radius,
    value:
      type === "ammo"
        ? 14
        : type === "boost"
          ? 5
          : type === "homingMissiles"
            ? 3
            : type === "speedUp"
              ? 8
              : type === "waveClear"
                ? 1
                : 22,
  };
}

export function maybeCreatePickup(
  id: number,
  x: number,
  y: number,
  chance = 0.27,
  radius = 0.4,
): Pickup | null {
  if (Math.random() > chance) {
    return null;
  }

  const type = randomPickupType();
  return createPickup(id, x, y, type, radius);
}
