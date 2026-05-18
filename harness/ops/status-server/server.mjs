export function serveStatic(res, filePath) {
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

export const server = http.createServer(async (req, res) => {
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