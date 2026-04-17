import { resolve } from "node:path";

// Same directory as provider-catalog-cache.json and provider-probe-cache.json
const PROJECT_ROOT = resolve(import.meta.dirname, "../../../../..");

export const DISCOVERED_PER_REQUEST_LIMITS_FILE = resolve(
  PROJECT_ROOT,
  "reports/symphony/discovered-per-request-limits.json",
);
