import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-probe-results.json";

export function loadProbeResults() {
  return loadBridgeFile(FILE_NAME);
}
