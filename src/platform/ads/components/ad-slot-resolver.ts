import { SLOT_IDS } from './ad-unit-slots';
import { isNumericSlot } from './numeric-slot';
import type { SlotName } from './ad-slot-name';

export function resolveSlotId(slot: string): string | null {
  if (isNumericSlot(slot)) return slot;
  const mapped = SLOT_IDS[slot as SlotName];
  return isNumericSlot(mapped) ? mapped : null;
}
