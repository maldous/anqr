import fs from "node:fs";
import { getStorePath } from "./get-store-path.mjs";

export function loadStore(name) {
  try {
    return JSON.parse(fs.readFileSync(getStorePath(name), "utf-8"));
  } catch {
    return { entries: {}, updatedAt: null };
  }
}
