// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:62

import { promises as fsp } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { logWarn } from "./log-warn.mjs";

export async function readLockInfo() {
  try {
    const raw = await fsp.readFile(LOCK_FILE, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    logWarn(`Failed to read lock info: ${err.message}`);
    return null;
  }
}
