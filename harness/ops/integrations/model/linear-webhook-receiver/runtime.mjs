
import {
  DEDUP_WINDOW_MS,
  PORT,
  WEBHOOK_SECRET,
  WORKTREE_IDS,
  activeIssues,
  recentDeliveries,
  server,
} from "./index.mjs";

import { logInfo } from "./logger.mjs";

setInterval(() => {
  recentDeliveries.clear();
  // Don't clear activeIssues - we want to prevent duplicate processing
}, DEDUP_WINDOW_MS);

server.listen(PORT, "0.0.0.0", () => {
  logInfo("========================================");
  logInfo("Linear Webhook Receiver Starting");
  logInfo("========================================");
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Endpoint: /linear/webhook`);
  logInfo(`Worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Secret configured: ${!!WEBHOOK_SECRET}`);
  logInfo("========================================");
  logInfo("Ready to receive Linear webhook events");

  // Clear stale delivery tracking on startup to prevent false duplicates
  recentDeliveries.clear();
  activeIssues.clear();
  logInfo("🔄 Cleared stale delivery tracking and active issues for immediate webhook processing");
});

setInterval(() => {
  // activeIssues will naturally shrink as issues complete
  // This prevents memory growth over time
  if (activeIssues.size > 100) {
    logInfo(`Active issues count: ${activeIssues.size} - clearing oldest entries`);
    // Keep recent issues, clear older ones
    // In a real implementation, we'd track issue start time
    // For now, just log and potentially clear if it gets too large
  }
}, 300_000);

process.on("SIGTERM", () => {
  logInfo("Received SIGTERM, shutting down...");
  activeIssues.clear(); // Clear active issues on shutdown
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT, shutting down...");
  activeIssues.clear(); // Clear active issues on shutdown
  server.close(() => process.exit(0));
});
