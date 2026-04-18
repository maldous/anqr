import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "adaptive-params.json";

export function saveAdaptiveParams(params) {
  saveBridgeFile(FILE_NAME, params, { withLock: true });
}
