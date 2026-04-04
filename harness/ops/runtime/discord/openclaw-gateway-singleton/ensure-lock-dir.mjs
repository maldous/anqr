// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:58

import { promises as fsp } from "node:fs";

import { LOCK_DIR } from "./lock-dir.mjs";

export async function ensureLockDir() {
  await fsp.mkdir(LOCK_DIR, { recursive: true });
}
