// Generated runtime carry-forward.

import { startContext7Server } from "../context7-server.mjs";

import { PORT, server, shutdown } from "./index.mjs";

import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

server.timeout = 0;

server.keepAliveTimeout = 0;

process.on("SIGTERM", () => shutdown("SIGTERM").catch(() => process.exit(1)));

process.on("SIGINT", () => shutdown("SIGINT").catch(() => process.exit(1)));

server.listen(PORT, "127.0.0.1", async () => {
  logInfo("========================================");
  logInfo("Context7 HTTP Service Starting");
  logInfo("========================================");
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Endpoints: POST /v1/resolve-docs, GET /health`);

  // Start the MCP server
  const ok = await startContext7Server();
  if (ok) {
    logInfo("✅ Context7 MCP server started successfully");
  } else {
    logWarn("⚠️ Context7 MCP server failed to start — will use cloud API fallback");
  }

  logInfo("========================================");
  logInfo("Ready to accept requests");
  logInfo("========================================");
});
