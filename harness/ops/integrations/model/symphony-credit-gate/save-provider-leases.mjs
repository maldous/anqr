import { writeFileSync } from "node:fs";

import { ensureStateDir } from "./ensure-state-dir.mjs";
import { PROVIDER_LEASE_FILE } from "./provider-lease-file.mjs";

export function saveProviderLeases(leases) {
  ensureStateDir();
  writeFileSync(PROVIDER_LEASE_FILE, JSON.stringify({ leases }, null, 2));
}
