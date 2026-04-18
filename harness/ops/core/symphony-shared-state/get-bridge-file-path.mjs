import path from "node:path";
import { getBridgeStateDir } from "./get-bridge-state-dir-impl.mjs";

/**
 * Resolve a file path under the shared bridge state directory.
 */
export function getBridgeFilePath(fileName) {
  return path.join(getBridgeStateDir(), fileName);
}
