import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";
import { logWarn } from "./logger.mjs";

const FILE_NAME = "provider-health.json";

export function loadHealthState() {
  try {
    return loadBridgeFile(FILE_NAME);
  } catch (err) {
    logWarn(`Failed to load health state: ${err.message}`);
  }
  return {};
}
