import fs from "node:fs";
import { getBridgeStateDir } from "./get-bridge-state-dir-impl.mjs";

/**
 * Ensures the shared bridge state directory exists and returns its path.
 */
export function ensureBridgeStateDir() {
  const dir = getBridgeStateDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}
