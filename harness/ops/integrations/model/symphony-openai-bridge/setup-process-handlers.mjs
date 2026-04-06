// Extracted from runtime.mjs: process-level setup (GC interval, signal handlers).

import { shutdown } from "./shutdown.mjs";
import { logInfo } from "./logger.mjs";

const PROCESS_HANDLERS_SETUP_KEY = Symbol.for("anqr.symphony-openai-bridge.process-handlers");
const GC_INTERVAL_KEY = Symbol.for("anqr.symphony-openai-bridge.gc-interval");

export function setupProcessHandlers() {
  if (globalThis[PROCESS_HANDLERS_SETUP_KEY]) {
    return;
  }
  globalThis[PROCESS_HANDLERS_SETUP_KEY] = true;

  if (typeof globalThis.gc === "function" && !globalThis[GC_INTERVAL_KEY]) {
    const interval = setInterval(() => {
      const mem = process.memoryUsage();
      const heapMB = Math.round(mem.heapUsed / 1024 / 1024);
      const rssMB = Math.round(mem.rss / 1024 / 1024);
      logInfo(`[gc] Periodic GC: heap=${heapMB}MB rss=${rssMB}MB`);
      globalThis.gc();
      const after = process.memoryUsage();
      const heapAfter = Math.round(after.heapUsed / 1024 / 1024);
      const rssAfter = Math.round(after.rss / 1024 / 1024);
      logInfo(
        `[gc] After GC: heap=${heapAfter}MB rss=${rssAfter}MB (freed ${heapMB - heapAfter}MB)`,
      );
    }, 5 * 60 * 1000);
    interval.unref?.();
    globalThis[GC_INTERVAL_KEY] = interval;
    logInfo(`[gc] Periodic GC enabled (every 5 minutes)`);
  }

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch(() => process.exit(1));
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT").catch(() => process.exit(1));
  });
}
