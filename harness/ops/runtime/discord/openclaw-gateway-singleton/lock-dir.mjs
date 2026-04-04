import path from "node:path";
import os from "node:os";

export const LOCK_DIR =
  process.env.OPENCLAW_LOCK_DIR || path.join(os.homedir(), ".cache", "anqr-openclaw");
