import fs from "node:fs";
import { getStorePath } from "./get-store-path.mjs";

export function saveStore(name, store) {
  store.updatedAt = new Date().toISOString();
  const filePath = getStorePath(name);
  const tmpFile = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2) + "\n");
  fs.renameSync(tmpFile, filePath);
}
