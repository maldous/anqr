import { HISTORY_LIMIT } from "./history-limit.mjs";

export function pruneHistory(history = []) {
  return history.slice(-HISTORY_LIMIT);
}
