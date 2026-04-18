import fs from "node:fs";
import { getBridgeFilePath } from "./get-bridge-file-path.mjs";
import { getBridgeStateDir } from "./get-bridge-state-dir-impl.mjs";
import { withBridgeLock } from "./with-bridge-lock.mjs";

/**
 * Atomically save a JSON file to the shared bridge state directory.
 * Uses write-to-temp-then-rename for crash safety.
 *
 * If `withLock` is true, acquires a file lock before writing.
 * This should be used for read-modify-write patterns where concurrent
 * mutations could lose data. For simple overwrites (no read first),
 * the atomic rename is sufficient and `withLock` is unnecessary.
 *
 * @param {string} fileName - File name relative to bridge state dir
 * @param {object} data - JSON-serializable data to write
 * @param {{ withLock?: boolean }} [options] - Whether to acquire lock before writing
 */
export function saveBridgeFile(fileName, data, options = {}) {
  const filePath = getBridgeFilePath(fileName);

  const write = () => {
    fs.mkdirSync(getBridgeStateDir(), { recursive: true, mode: 0o700 });
    const tmpFile = `${filePath}.tmp.${process.pid}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2) + "\n");
    fs.renameSync(tmpFile, filePath);
  };

  if (options.withLock) {
    withBridgeLock(fileName, write);
  } else {
    write();
  }
}
