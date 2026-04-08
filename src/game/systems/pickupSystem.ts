import type { Pickup, PickupType } from '../types';

function randomPickupType(): PickupType {
  const roll = Math.random();
  if (roll < 0.27) return 'health';
  if (roll < 0.54) return 'shield';
  if (roll < 0.84) return 'ammo';
  return 'boost';
}

export function maybeCreatePickup(
  id: number,
  x: number,
  y: number,
  chance = 0.27
): Pickup | null {
  if (Math.random() > chance) {
    return null;
  }

  const type = randomPickupType();
  return {
    id,
    type,
    position: { x, y },
    radius: 0.4,
    value: type === 'ammo' ? 28 : type === 'boost' ? 6 : 22
  };
}
