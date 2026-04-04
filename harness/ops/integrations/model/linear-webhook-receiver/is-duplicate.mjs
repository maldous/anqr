import { recentDeliveries } from "./recent-deliveries.mjs";
import { logWarn } from "./logger.mjs";

export function isDuplicate(deliveryId) {
  if (recentDeliveries.has(deliveryId)) {
    logWarn(`Duplicate delivery: ${deliveryId}`);
    return true;
  }
  recentDeliveries.add(deliveryId);
  return false;
}
