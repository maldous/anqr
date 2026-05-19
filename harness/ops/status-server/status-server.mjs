import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPO_ROOT, REFRESH_INTERVAL_MS } from "./constants.mjs";
import { SERVICES } from "./services.mjs";
import { aggregateHealth } from "./health-probing.mjs";
import { fetchCommits, getCommits } from "./commits.mjs";
import { fetchLinearIssues, getLinearIssues } from "./linear-issues.mjs";
import { serveStatic, server } from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Cached Health ────────────────────────────────────────────────────────────

let cachedHealth = null;
let cacheAge = 0;

// ── Recent Commits ───────────────────────────────────────────────────────────

let cachedCommits = null;
let commitsCacheAge = 0;

// ── Linear In-Progress Issues ────────────────────────────────────────────────

let cachedIssues = null;
let issuesCacheAge = 0;

// Background refresh every 30s so first request is always fast
async function backgroundRefresh() {
  try {
    cachedHealth = await aggregateHealth();
    cacheAge = Date.now();
  } catch { /* next cycle will retry */ }
  setTimeout(backgroundRefresh, REFRESH_INTERVAL_MS);
}
backgroundRefresh();
