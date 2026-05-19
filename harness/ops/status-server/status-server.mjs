/**
 * ANQR Status Server
 *
 * Lightweight HTTP server that aggregates health from all ANQR services
 * and serves the operation dashboard.
 *
 * Port: STATUS_SERVER_PORT env var or 18800
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { PORT, REPO_ROOT, REFRESH_INTERVAL_MS, COMMITS_REFRESH_MS, ISSUES_REFRESH_MS, MIME_TYPES } from "./constants.mjs";
import { SERVICES } from "./services.mjs";
import { probeService, aggregateHealth, getHealth } from "./health-probing.mjs";
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
