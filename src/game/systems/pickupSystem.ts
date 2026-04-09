import type {Pickup, PickupType} from "../types";

function randomPickupType(): PickupType {
  const roll = Math.random();
  if (roll < 0.26) return "health";
  if (roll < 0.5) return "shield";
  if (roll < 0.84) return "ammo";
  return "boost";
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
    value: type === "ammo" ? 14 : type === "boost" ? 5 : 22,
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
