/**
 * ANQR Status Server — Enhanced Dashboard
 * Port: STATUS_SERVER_PORT env var or 18800
 */

import http from "node:http";
import path from "node:path";
import { PORT, PUBLIC_DIR, SERVICES } from "./lib/constants.mjs";
import { getHealth } from "./lib/get-health.mjs";
import { refreshHealth } from "./lib/refresh-health.mjs";
import { getCommits } from "./lib/get-commits.mjs";
import { getLinearIssues } from "./lib/get-linear-issues.mjs";
import { getModelsData } from "./lib/get-models-data.mjs";
import { getSymphonyData } from "./lib/get-symphony-data.mjs";
import { getBridgeStats } from "./lib/get-bridge-stats.mjs";
import { res200 } from "./lib/res200.mjs";
import { serveStatic } from "./lib/serve-static.mjs";

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

async function bg() { try { await refreshHealth(); } catch {} setTimeout(bg, 30_000); }
bg();

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[status-server] http://127.0.0.1:${PORT}/`);
});
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT",  () => server.close(() => process.exit(0)));
