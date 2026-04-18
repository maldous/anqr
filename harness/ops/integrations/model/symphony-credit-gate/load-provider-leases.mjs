import { loadBridgeFile } from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";

const FILE_NAME = "provider-leases.json";

export function loadProviderLeases() {
  const parsed = loadBridgeFile(FILE_NAME, { leases: [] });
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.leases)) return parsed.leases;
  return [];
}
