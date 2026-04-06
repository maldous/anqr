
import { MAX_CONCURRENT, PORT, WORKTREE_IDS, server } from "./index.mjs";

import { logInfo } from "./logger.mjs";

server.listen(PORT, "127.0.0.1", () => {
  logInfo(`========================================`);
  logInfo(`Discord Request Router Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://127.0.0.1:${PORT}`);
  logInfo(`Worktrees: wt${WORKTREE_IDS.join(", wt")}`);
  logInfo(`Max Concurrent: ${MAX_CONCURRENT}`);
  logInfo(`========================================`);

  // Send startup notification
  logInfo(`✅ Router ready to accept Discord requests`);
});

process.on("SIGTERM", () => {
  logInfo("Received SIGTERM, shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  logInfo("Received SIGINT, shutting down...");
  server.close(() => process.exit(0));
});
