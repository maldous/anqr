// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:31

import { actions } from "./actions.mjs";
import { logInfo } from "./logger.mjs";

export function logAction(type, detail) {
  actions.push({ type, detail, ts: new Date().toISOString() });
  const icons = {
    feed: "📥",
    drain: "📤",
    stale: "⏰",
    info: "ℹ️",
    concurrent: "🔒",
    recover: "🩹",
    skip: "⏭️",
  };
  logInfo(`${icons[type] || "•"} ${type}: ${detail}`);
}
