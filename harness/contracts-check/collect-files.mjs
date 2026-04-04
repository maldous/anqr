import { readdir } from "node:fs/promises";
import path from "node:path";

export async function collectFiles(rootPath) {
  const files = [];
  const entries = await readdir(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const nextPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(nextPath)));
      continue;
    }
    files.push(nextPath);
  }
  return files;
}
