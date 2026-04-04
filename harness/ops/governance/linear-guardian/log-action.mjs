// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:154

import { actions } from "./actions.mjs";

export function logAction(type, detail) {
  const entry = { type, detail, ts: new Date().toISOString() };
  actions.push(entry);
  const icons = { create: "🆕", comment: "💬", hygiene: "🏷️", skip: "⏭️", stale: "⏰", info: "ℹ️" };
  let logLevel;
  if (type === "skip") {
    logLevel = logDebug;
  } else if (type === "stale") {
    logLevel = logWarn;
  } else {
    logLevel = logInfo;
  }
  logLevel(`${icons[type] || "•"} ${type}: ${detail}`);
}
