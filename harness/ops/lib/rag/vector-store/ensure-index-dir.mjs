import { mkdir } from "node:fs/promises";

import { INDEX_DIR } from "./index-dir.mjs";

export async function ensureIndexDir() {
  await mkdir(INDEX_DIR, { recursive: true });
}
