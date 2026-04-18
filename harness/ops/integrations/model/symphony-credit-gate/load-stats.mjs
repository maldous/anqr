import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";
import { PROVIDER_STATS } from "./provider-stats.mjs";

const FILE_NAME = "provider-stats.json";

export function loadStats() {
  const data = loadBridgeFile(FILE_NAME, null);
  if (data) {
    return { ...PROVIDER_STATS, ...data };
  }
  return { ...PROVIDER_STATS };
}
