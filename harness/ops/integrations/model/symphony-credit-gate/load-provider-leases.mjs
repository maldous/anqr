import { existsSync, readFileSync } from "node:fs";

import { PROVIDER_LEASE_FILE } from "./provider-lease-file.mjs";

export function loadProviderLeases() {
  try {
    if (!existsSync(PROVIDER_LEASE_FILE)) return [];
    const parsed = JSON.parse(readFileSync(PROVIDER_LEASE_FILE, "utf8"));
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.leases)) return parsed.leases;
  } catch {}
  return [];
}
