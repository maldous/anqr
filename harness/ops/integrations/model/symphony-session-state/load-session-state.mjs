import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "session-state.json";

export function loadSessionState() {
  return loadBridgeFile(FILE_NAME);
}
