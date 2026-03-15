import type { PayloadItemEntry } from './payload-category-item-entry';

export function payloadItems(entries: readonly PayloadItemEntry[]) {
  return entries.map(([value, labelKey]) => ({ value, labelKey }));
}
