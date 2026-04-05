import { resolve } from "node:path";

import { PROJECT_ROOT } from "../symphony-credit-gate/project-root.mjs";

export const PROVIDER_CATALOG_CACHE_FILE = resolve(
  PROJECT_ROOT,
  "reports",
  "symphony",
  "provider-catalog-cache.json",
);
