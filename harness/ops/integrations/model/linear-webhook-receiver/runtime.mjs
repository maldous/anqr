import { PORT, WEBHOOK_SECRET, WORKTREE_IDS, server } from "./index.mjs";

import { logInfo } from "./logger.mjs";

server.listen(PORT, "0.0.0.0", () => {
  logInfo("========================================");
  logInfo("Linear Webhook Receiver Starting");
  logInfo("========================================");
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Endpoint: /linear/webhook`);
  logInfo(`Worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Secret configured: ${!!WEBHOOK_SECRET}`);
  logInfo(`Insecure webhooks: ${process.env.ANQR_ALLOW_INSECURE_WEBHOOKS === "true"}`);
  logInfo("========================================");
  logInfo("Durable state with TTL-based expiry active — no startup clearing needed");
  logInfo("Ready to receive Linear webhook events");
});

process.on("SIGTERM", () => {
  logInfo("Received SIGTERM, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT, shutting down...");
  server.close(() => process.exit(0));
});
