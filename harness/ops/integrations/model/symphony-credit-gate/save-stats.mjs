import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-stats.json";

export function saveStats(stats) {
  saveBridgeFile(FILE_NAME, stats, { withLock: true });
}
