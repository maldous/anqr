import { resolve } from "node:path";

import { STATE_DIR } from "../symphony-provider-health/state-dir.mjs";

export const PROVIDER_LEASE_FILE = resolve(STATE_DIR, "provider-leases.json");
