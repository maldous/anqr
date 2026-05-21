/**
 * ANQR Status Server — Enhanced Dashboard
 * Port: STATUS_SERVER_PORT env var or 18800
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.STATUS_SERVER_PORT || "18800", 10);
const PUBLIC_DIR = path.resolve(__dirname, "public");
const REPO_ROOT = path.resolve(__dirname, "../../..");
const BRIDGE_STATE = process.env.XDG_RUNTIME_DIR
  ? `${process.env.XDG_RUNTIME_DIR}/anqr-bridge-state`
  : "/run/user/1000/anqr-bridge-state";
const SYMPHONY_STATE_PATH = process.env.XDG_RUNTIME_DIR
  ? `${process.env.XDG_RUNTIME_DIR}/anqr-symphony-state/state.json`
  : "/run/user/1000/anqr-symphony-state/state.json";

const SERVICES = [
  { id: "symphony-router",  name: "Symphony Router",  url: "http://127.0.0.1:4319/health",  critical: true  },
  { id: "discord-router",   name: "Discord Router",   url: "http://127.0.0.1:18790/health", critical: true  },
  { id: "linear-webhook",   name: "Linear Webhook",   url: "http://127.0.0.1:18795/health", critical: true  },
  { id: "context7-mcp",     name: "Context7 MCP",     url: "http://127.0.0.1:4320/health",  critical: false },
  { id: "openclaw-gateway", name: "OpenClaw Gateway", url: "http://127.0.0.1:18789/health", critical: false },
  { id: "ollama",           name: "Ollama",            url: "http://127.0.0.1:11434/",       critical: false },
  { id: "executor-wt1",     name: "Executor wt1",     url: "http://127.0.0.1:4321/health",  critical: false },
  { id: "executor-wt2",     name: "Executor wt2",     url: "http://127.0.0.1:4322/health",  critical: false },
  { id: "executor-wt3",     name: "Executor wt3",     url: "http://127.0.0.1:4323/health",  critical: false },
  { id: "executor-wt4",     name: "Executor wt4",     url: "http://127.0.0.1:4324/health",  critical: false },
  { id: "executor-wt5",     name: "Executor wt5",     url: "http://127.0.0.1:4325/health",  critical: false },
  { id: "executor-wt6",     name: "Executor wt6",     url: "http://127.0.0.1:4326/health",  critical: false },
  { id: "executor-wt7",     name: "Executor wt7",     url: "http://127.0.0.1:4327/health",  critical: false },
  { id: "executor-wt8",     name: "Executor wt8",     url: "http://127.0.0.1:4328/health",  critical: false },
];

async function probeService(service) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const start = Date.now();
  try {
    const res = await fetch(service.url, { signal: controller.signal });
    const responseTime = Date.now() - start;
    let data = null;
    try { data = await res.json(); } catch { /* not json */ }
    return { id: service.id, name: service.name, critical: service.critical,
      status: res.ok ? "healthy" : "degraded", statusCode: res.status, responseTime, data };
  } catch (err) {
    return { id: service.id, name: service.name, critical: service.critical,
      status: "down", statusCode: null, responseTime: Date.now() - start, error: err.message };
  } finally { clearTimeout(timeout); }
}

let cachedHealth = null; let healthAge = 0;
let cachedCommits = null; let commitsAge = 0;
let cachedIssues = null; let issuesAge = 0;

async function aggregateHealth() {
  const results = await Promise.all(SERVICES.map(probeService));
  const healthy = results.filter(r => r.status === "healthy").length;
  const degraded = results.filter(r => r.status === "degraded").length;
  const down = results.filter(r => r.status === "down").length;
  const criticalDown = results.filter(r => r.critical && r.status !== "healthy");
  return { timestamp: new Date().toISOString(),
    summary: { total: results.length, healthy, degraded, down },
    criticalDown: criticalDown.map(r => r.id), allClear: criticalDown.length === 0, services: results };
}

async function getHealth() {
  if (cachedHealth && Date.now() - healthAge < 30_000) return cachedHealth;
  cachedHealth = await aggregateHealth(); healthAge = Date.now();
  return cachedHealth;
}

function fetchCommits() {
  try {
    const out = execFileSync("git",
      ["log", "--max-count=20", "--format=%h|%s|%an|%ar|%ad", "--date=short", "--no-color"],
      { cwd: REPO_ROOT, encoding: "utf-8", timeout: 5000 });
    return out.trim().split("\n").filter(Boolean).map(line => {
      const [hash, subject, author, relative, date] = line.split("|");
      const m = /^(fix|feat|chore|docs|refactor|test|ci|build|perf|style|revert)[:(]/.exec(subject);
      return { hash, subject, author, relative, date, type: m ? m[1] : "other" };
    });
  } catch { return []; }
}

function getCommits() {
  if (cachedCommits && Date.now() - commitsAge < 60_000) return cachedCommits;
  cachedCommits = fetchCommits(); commitsAge = Date.now();
  return cachedCommits;
}

async function fetchLinearIssues() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return [];
  const query = `query { issues(filter:{team:{id:{eq:"01534c1e-4041-474d-a81e-24f917f33912"}},state:{type:{eq:"started"}}},first:20,orderBy:updatedAt) { nodes { identifier title url priority state{name type} assignee{name} updatedAt estimate labels{nodes{name color}} } } }`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({ query }), signal: controller.signal,
    });
    clearTimeout(t);
    const body = await res.json();
    return body?.data?.issues?.nodes || [];
  } catch { return []; }
}

async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesAge < 60_000) return cachedIssues;
  cachedIssues = await fetchLinearIssues(); issuesAge = Date.now();
  return cachedIssues;
}

function loadJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }

function getModelsData() {
  const stats = loadJson(`${BRIDGE_STATE}/provider-stats.json`);
  const cache = loadJson(`${BRIDGE_STATE}/provider-probe-cache.json`);
  const health = loadJson(`${BRIDGE_STATE}/provider-health.json`);
  if (!stats && !cache) return { ranked: [], totalAvailable: 0, totalConfigured: 0, error: "bridge state unavailable" };
  const probeResults = cache?.probeResults || [];
  const availSet = new Set(probeResults.filter(r => r.available).map(r => r.name));
  const probeMap = Object.fromEntries(probeResults.map(r => [r.name, r]));
  const healthMap = health || {};
  const sel = stats?.selections || {};
  const totalCalls = Object.values(sel).reduce((a, b) => a + b, 0);
  const ranked = Object.entries(sel)
    .map(([name, count]) => {
      const h = healthMap[name] || {};
      const probe = probeMap[name] || {};
      return { name, count, pct: totalCalls ? Math.round(count / totalCalls * 1000) / 10 : 0,
        available: availSet.has(name), healthState: h.state || "unknown",
        consecutiveFailures: h.consecutiveFailures || 0, consecutiveSuccesses: h.consecutiveSuccesses || 0,
        probeDurationMs: probe.durationMs || null };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
  return { ranked, totalCalls, totalAvailable: availSet.size,
    totalConfigured: probeResults.length, totalTracked: Object.keys(sel).length,
    lastProbe: cache?.lastProbeAt,
    degradedProviders: Object.values(healthMap).filter(v => v.state !== "healthy").length };
}

function getSymphonyData() {
  const state = loadJson(SYMPHONY_STATE_PATH);
  if (!state) return null;
  const wts = state.worktreeStates || {};
  const issues = state.issues || {};
  const now = Date.now();
  const worktrees = Object.values(wts).map(wt => ({
    id: wt.worktreeId, state: wt.state, assignedIssue: wt.assignedIssue,
    reason: wt.reason, repairAttempts: wt.repairAttempts || 0, updatedAt: wt.updatedAt,
  }));
  const issueStats = { total: 0, active: 0, cooldown: 0, exhausted: 0, eligible: 0 };
  for (const v of Object.values(issues)) {
    if (typeof v !== "object" || !v) continue;
    issueStats.total++;
    if (v.lease) issueStats.active++;
    else if (v.retry_exhausted || v.blocked_reason) issueStats.exhausted++;
    else if (v.cooldown_until && new Date(v.cooldown_until).getTime() > now) issueStats.cooldown++;
    else issueStats.eligible++;
  }
  const wStats = {
    executing: worktrees.filter(w => w.state === "executing").length,
    available: worktrees.filter(w => w.state === "available").length,
    quarantined: worktrees.filter(w => w.state === "quarantined").length,
    total: worktrees.length,
  };
  return { worktrees, issueStats, worktreeStats: wStats };
}

function getBridgeStats() {
  const stats = loadJson(`${BRIDGE_STATE}/provider-stats.json`);
  const health = loadJson(`${BRIDGE_STATE}/provider-health.json`);
  const cache = loadJson(`${BRIDGE_STATE}/provider-probe-cache.json`);
  if (!stats) return null;
  const h = health || {};
  const sel = stats.selections || {};
  const totalCalls = Object.values(sel).reduce((a, b) => a + b, 0);
  return { totalCalls,
    healthyProviders: Object.values(h).filter(v => v.state === "healthy").length,
    degradedProviders: Object.values(h).filter(v => v.state !== "healthy").length,
    availableProviders: (cache?.probeResults || []).filter(r => r.available).length,
    totalConfigured: (cache?.probeResults || []).length, lastProbe: cache?.lastProbeAt };
}

const MIME = { ".html":"text/html;charset=utf-8",".css":"text/css;charset=utf-8",".js":"application/javascript;charset=utf-8",".json":"application/json",".svg":"image/svg+xml" };

function res200(res, obj) {
  const buf = Buffer.from(JSON.stringify(obj), "utf-8");
  res.writeHead(200, { "Content-Type":"application/json","Content-Length":buf.length,"Access-Control-Allow-Origin":"*","Cache-Control":"no-store,no-cache" });
  res.end(buf);
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store,no-cache,must-revalidate" });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type":"application/json" }); res.end('{"error":"Not found"}');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = url.pathname;
  if (p === "/api/health")        return res200(res, await getHealth());
  if (p === "/api/services")      return res200(res, SERVICES);
  if (p === "/api/commits")       { const c = getCommits(); return res200(res, { commits: c, count: c.length }); }
  if (p === "/api/linear-issues") { const i = await getLinearIssues(); return res200(res, { issues: i, count: i.length }); }
  if (p === "/api/models")        return res200(res, getModelsData());
  if (p === "/api/symphony")      return res200(res, getSymphonyData() || { error: "unavailable" });
  if (p === "/api/bridge")        return res200(res, getBridgeStats() || { error: "unavailable" });
  if (p === "/api/all") {
    const [health, issues] = await Promise.all([getHealth(), getLinearIssues()]);
    // Fetch Linear todo/backlog counts separately for accurate queue display
    // (symphony state has 400+ stale historical records that inflate the "eligible" count)
    let linearTodoCount = null;
    try {
      const apiKey = process.env.LINEAR_API_KEY;
      if (apiKey) {
        const q = `query { issues(filter:{team:{id:{eq:"01534c1e-4041-474d-a81e-24f917f33912"}},state:{type:{in:["unstarted"]}}},first:250) { nodes { id } } }`;
        const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 3000);
        const r = await fetch("https://api.linear.app/graphql", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: apiKey },
          body: JSON.stringify({ query: q }), signal: ctrl.signal,
        });
        const body = await r.json();
        linearTodoCount = body?.data?.issues?.nodes?.length ?? null;
      }
    } catch { /* best effort */ }
    return res200(res, { health, symphony: getSymphonyData(), models: getModelsData(),
      bridge: getBridgeStats(), commits: getCommits(), issues, linearTodoCount,
      generatedAt: new Date().toISOString() });
  }
  let safePath = p === "/" ? "/index.html" : p;
  safePath = path.normalize(safePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('{"error":"Forbidden"}'); return; }
  serveStatic(res, filePath);
});

async function bg() { try { cachedHealth = await aggregateHealth(); healthAge = Date.now(); } catch {} setTimeout(bg, 30_000); }
bg();

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[status-server] http://127.0.0.1:${PORT}/`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT",  () => server.close(() => process.exit(0)));
