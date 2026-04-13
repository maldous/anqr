import path from "node:path";
import { getStoreDir } from "./get-store-dir.mjs";

export function getStorePath(name) {
  return path.join(getStoreDir(), `${name}.json`);
}
