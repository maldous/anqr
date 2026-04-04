import { stat } from "node:fs/promises";

import { toResolvedPath } from "./to-resolved-path.mjs";

export async function getFileMtime(filePath) {
  try {
    const fileStat = await stat(toResolvedPath(filePath));
    return fileStat.mtimeMs;
  } catch {
    return 0;
  }
}
