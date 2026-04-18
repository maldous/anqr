import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-failures.json";

export function loadFailures() {
  return loadBridgeFile(FILE_NAME);
}
