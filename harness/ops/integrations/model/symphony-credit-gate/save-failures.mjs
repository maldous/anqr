import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-failures.json";

export function saveFailures(failures) {
  saveBridgeFile(FILE_NAME, failures, { withLock: true });
}
