import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";
import { logWarn } from "./logger.mjs";

const FILE_NAME = "provider-health.json";

export function saveHealthState(state) {
  try {
    saveBridgeFile(FILE_NAME, state, { withLock: true });
  } catch (err) {
    logWarn(`Failed to save health state: ${err.message}`);
  }
}
