import type { PayloadItemEntry } from "./payload-category-item-entry";
import type { PayloadTier } from "./payload-category-tier";
import { payloadItems } from "./payload-items";

export function payloadCategory(
  groupKey: string,
  tier: PayloadTier,
  entries: readonly PayloadItemEntry[],
) {
  return {
    groupKey,
    tier,
    items: payloadItems(entries),
  };
}
