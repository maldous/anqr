import { PROVIDER_STATS } from "./provider-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function resetProviderStats() {
  saveStats(PROVIDER_STATS);
}
