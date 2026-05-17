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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.STATUS_SERVER_PORT || "18800", 10);
const PUBLIC_DIR = path.resolve(__dirname, "public");
const REPO_ROOT = path.resolve(__dirname, "../../..");

// ── Service Registry ────────────────────────────────────────────────────────

const SERVICES = [
  { id: "symphony-router",      name: "Symphony Router",      url: "http://127.0.0.1:4319/health",      critical: true },
  { id: "discord-router",       name: "Discord Router",       url: "http://127.0.0.1:18790/health",      critical: true },
  { id: "linear-webhook",       name: "Linear Webhook",       url: "http://127.0.0.1:18795/health",      critical: true },
  { id: "context7-mcp",         name: "Context7 MCP",         url: "http://127.0.0.1:4320/health",       critical: false },
  { id: "openclaw-gateway",     name: "OpenClaw Gateway",     url: "http://127.0.0.1:18789/health",      critical: false },
  { id: "litellm-proxy",        name: "LiteLLM Proxy",        url: "http://127.0.0.1:4010/health",       critical: false },
  { id: "executor-wt1",         name: "Executor wt1",         url: "http://127.0.0.1:4321/health",       critical: false },
  { id: "executor-wt2",         name: "Executor wt2",         url: "http://127.0.0.1:4322/health",       critical: false },
  { id: "executor-wt3",         name: "Executor wt3",         url: "http://127.0.0.1:4323/health",       critical: false },
  { id: "executor-wt4",         name: "Executor wt4",         url: "http://127.0.0.1:4324/health",       critical: false },
  { id: "executor-wt5",         name: "Executor wt5",         url: "http://127.0.0.1:4325/health",       critical: false },
  { id: "executor-wt6",         name: "Executor wt6",         url: "http://127.0.0.1:4326/health",       critical: false },
  { id: "executor-wt7",         name: "Executor wt7",         url: "http://127.0.0.1:4327/health",       critical: false },
  { id: "executor-wt8",         name: "Executor wt8",         url: "http://127.0.0.1:4328/health",       critical: false },
];

// ── Health Probing ───────────────────────────────────────────────────────────

async function probeService(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(service.url, { signal: controller.signal });
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }

    return {
      id: service.id,
      name: service.name,
      critical: service.critical,
      status: res.ok ? "healthy" : "degraded",
      statusCode: res.status,
      data,
    };
  } catch (err) {
    return {
      id: service.id,
      name: service.name,
      critical: service.critical,
      status: "down",
      statusCode: null,
      error: err.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Cached Health ────────────────────────────────────────────────────────────

let cachedHealth = null;
let cacheAge = 0;
const REFRESH_INTERVAL_MS = 30_000;

async function aggregateHealth() {
  const results = await Promise.all(SERVICES.map(probeService));
  const healthy = results.filter((r) => r.status === "healthy").length;
  const degraded = results.filter((r) => r.status === "degraded").length;
  const down = results.filter((r) => r.status === "down").length;
  const criticalDown = results.filter((r) => r.critical && r.status !== "healthy");

  return {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, healthy, degraded, down },
    criticalDown: criticalDown.map((r) => r.id),
    allClear: criticalDown.length === 0,
    services: results,
  };
}

async function getHealth() {
  if (cachedHealth && Date.now() - cacheAge < REFRESH_INTERVAL_MS) {
    return cachedHealth;
  }
  cachedHealth = await aggregateHealth();
  cacheAge = Date.now();
  return cachedHealth;
}

// ── Recent Commits ───────────────────────────────────────────────────────────

const COMMITS_REFRESH_MS = 60_000;
let cachedCommits = null;
let commitsCacheAge = 0;

function fetchCommits() {
  try {
    const out = execSync(
      'git log --oneline --max-count=10 --format="%h %s" --no-color',
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 5000 },
    );
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, ...rest] = line.split(" ");
        return { hash, subject: rest.join(" ") };
      });
  } catch (err) {
    console.error(`[status-server] git log failed: ${err.message}`);
    return [];
  }
}

function getCommits() {
  if (cachedCommits && Date.now() - commitsCacheAge < COMMITS_REFRESH_MS) {
    return cachedCommits;
  }
  cachedCommits = fetchCommits();
  commitsCacheAge = Date.now();
  return cachedCommits;
}

// ── Linear In-Progress Issues ────────────────────────────────────────────────

const ISSUES_REFRESH_MS = 60_000;
let cachedIssues = null;
let issuesCacheAge = 0;

async function fetchLinearIssues() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return [];

  const query = `
    query RunningIssues {
      issues(
        filter: {
          team: { id: { eq: "01534c1e-4041-474d-a81e-24f917f33912" } }
          state: { type: { eq: "started" } }
        }
        first: 10
      ) {
        nodes {
          identifier
          title
          url
          state { name type }
          assignee { name }
          updatedAt
        }
      }
    }
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await res.json();
    return body?.data?.issues?.nodes || [];
  } catch (err) {
    console.error(`[status-server] Linear query failed: ${err.message}`);
    return [];
  }
}

async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesCacheAge < ISSUES_REFRESH_MS) {
    return cachedIssues;
  }
  cachedIssues = await fetchLinearIssues();
  issuesCacheAge = Date.now();
  return cachedIssues;
}

// Background refresh every 30s so first request is always fast
async function backgroundRefresh() {
  try {
    cachedHealth = await aggregateHealth();
    cacheAge = Date.now();
  } catch { /* next cycle will retry */ }
  setTimeout(backgroundRefresh, REFRESH_INTERVAL_MS);
}
backgroundRefresh();

// ── HTTP Server ──────────────────────────────────────────────────────────────

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // ── API Routes ──
  if (pathname === "/api/health") {
    const health = await getHealth();
    const body = JSON.stringify(health, null, 2);
    const buf = Buffer.from(body, "utf-8");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": buf.length,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(buf);
    return;
  }

  if (pathname === "/api/services") {
    const body = JSON.stringify(SERVICES, null, 2);
    const buf = Buffer.from(body, "utf-8");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": buf.length,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(buf);
    return;
  }

  if (pathname === "/api/commits") {
    const commits = getCommits();
    const body = JSON.stringify({ commits, count: commits.length });
    const buf = Buffer.from(body, "utf-8");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": buf.length,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(buf);
    return;
  }

  if (pathname === "/api/linear-issues") {
    const issues = await getLinearIssues();
    const body = JSON.stringify({ issues, count: issues.length });
    const buf = Buffer.from(body, "utf-8");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Length": buf.length,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(buf);
    return;
  }

  // ── Static Files ──
  let safePath = pathname === "/" ? "/index.html" : pathname;
  // Prevent directory traversal
  safePath = path.normalize(safePath).replace(/^(\.\.(\/|\\|$))+/, "");

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Only serve files under PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
    return;
  }

  serveStatic(res, filePath);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[status-server] Listening on http://127.0.0.1:${PORT}`);
  console.log(`[status-server] Dashboard: http://127.0.0.1:${PORT}/`);
  console.log(`[status-server] API:       http://127.0.0.1:${PORT}/api/health`);
  console.log(`[status-server] Services:  ${SERVICES.length} registered`);
});

process.on("SIGTERM", () => {
  console.log("[status-server] SIGTERM received, shutting down");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("[status-server] SIGINT received, shutting down");
  server.close(() => process.exit(0));
});
