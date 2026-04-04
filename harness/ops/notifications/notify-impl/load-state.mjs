import fs from "node:fs";

import { RATE_LIMIT_FILE } from "./rate-limit-file.mjs";

export function loadState() {
  try {
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, "utf-8"));
  } catch {
    return { sends: [] };
  }
}
