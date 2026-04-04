import { readFileSync, existsSync } from "node:fs";

import { SESSION_STATE_FILE } from "./session-state-file.mjs";

export function loadSessionState() {
  try {
    if (existsSync(SESSION_STATE_FILE)) {
      return JSON.parse(readFileSync(SESSION_STATE_FILE, "utf-8"));
    }
  } catch {}
  return {};
}
