import { resolve } from "node:path";
import { existsSync, readdirSync } from "node:fs";

import { ALLOWED_ROOT_DIRS } from "./allowed-root-dirs.mjs";
import { REQUIRED_DIRS } from "./required-dirs.mjs";
import { REQUIRED_FILES } from "./required-files.mjs";
import { ROOT } from "./root.mjs";

export function checkRepoStructure() {
  const issues = [];

  for (const dir of REQUIRED_DIRS) {
    const full = resolve(ROOT, dir);
    if (!existsSync(full)) {
      issues.push(`missing required directory: ${dir}/`);
    }
  }

  for (const file of REQUIRED_FILES) {
    const full = resolve(ROOT, file);
    if (!existsSync(full)) {
      issues.push(`missing required file: ${file}`);
    }
  }

  const topLevel = readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const unexpected = topLevel.filter((d) => !ALLOWED_ROOT_DIRS.has(d) && !d.startsWith("."));
  if (unexpected.length > 0) {
    issues.push(`unexpected root directories: ${unexpected.join(", ")}`);
  }

  return {
    pass: issues.length === 0,
    detail:
      issues.length === 0
        ? `All required dirs/files present, no unexpected root directories`
        : issues.join("; "),
  };
}
