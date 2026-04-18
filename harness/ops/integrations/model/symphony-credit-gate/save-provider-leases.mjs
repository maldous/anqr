import { saveBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-leases.json";

export function saveProviderLeases(leases) {
  saveBridgeFile(FILE_NAME, { leases }, { withLock: true });
}
