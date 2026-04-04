import { readFile } from "node:fs/promises";

import { errors } from "./errors.mjs";
import { resolve } from "./resolve.mjs";

export async function read(rel) {
  try {
    return await readFile(resolve(rel), "utf8");
  } catch {
    errors.push(`${rel}: file not found`);
    return "";
  }
}
