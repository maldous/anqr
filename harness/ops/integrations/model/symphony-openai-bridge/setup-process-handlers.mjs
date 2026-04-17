// Extracted from runtime.mjs: process-level setup (GC interval, signal handlers).

import { shutdown } from "./shutdown.mjs";
import { logInfo, logError } from "./logger.mjs";

const PROCESS_HANDLERS_SETUP_KEY = Symbol.for("anqr.symphony-openai-bridge.process-handlers");
const GC_INTERVAL_KEY = Symbol.for("anqr.symphony-openai-bridge.gc-interval");

export function setupProcessHandlers() {
  if (globalThis[PROCESS_HANDLERS_SETUP_KEY]) {
    return;
  }
  globalThis[PROCESS_HANDLERS_SETUP_KEY] = true;

  if (typeof globalThis.gc === "function" && !globalThis[GC_INTERVAL_KEY]) {
    const interval = setInterval(
      () => {
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
      },
      5 * 60 * 1000,
    );
    interval.unref?.();
    globalThis[GC_INTERVAL_KEY] = interval;
    logInfo(`[gc] Periodic GC enabled (every 5 minutes)`);
  }

  // 🔍 Production diagnostics: Capture full stack traces for unhandled rejections
  // and uncaught exceptions. Console output guarded by SYMPHONY_DEBUG to avoid
  // noise in normal operation. Per Node.js docs, uncaught exceptions leave the
  // process in an undefined state — we set process.exitCode = 1 so it exits
  // after the current request completes.
  process.on("unhandledRejection", (reason, promise) => {
    const stack = reason instanceof Error ? reason.stack : String(reason);
    logError(`🚨 UNHANDLED REJECTION: ${stack}`);
    if (process.env.SYMPHONY_DEBUG) console.error(`[DIAG] UNHANDLED REJECTION at:`, stack);
  });

  process.on("uncaughtException", (err) => {
    const stack = err instanceof Error ? err.stack : String(err);
    logError(`🚨 UNCAUGHT EXCEPTION: ${stack}`);
    if (process.env.SYMPHONY_DEBUG) console.error(`[DIAG] UNCAUGHT EXCEPTION at:`, stack);
    // Mark process for exit after current request completes — per Node.js docs,
    // the process is in an undefined state after an uncaught exception.
    process.exitCode = 1;
  });

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch(() => process.exit(1));
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT").catch(() => process.exit(1));
  });
}
