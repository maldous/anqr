import fs from "node:fs";
import path from "node:path";

export function getStoreDir() {
  const base =
    process.env.ANQR_DURABLE_STATE_DIR ||
    path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-durable-state");
  fs.mkdirSync(base, { recursive: true });
  return base;
}
