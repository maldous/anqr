import fs from "node:fs";
import path from "node:path";
import type { TsConfigPaths } from "./tsconfig-paths.types.ts";
import { escapeRegex } from "./escape-regex.ts";

export function buildTsconfigAliases(repoRoot: string) {
  const tsconfigPath = path.resolve(repoRoot, "tsconfig.base.json");
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8")) as {
    compilerOptions?: { paths?: TsConfigPaths };
  };
  const paths = tsconfig.compilerOptions?.paths ?? {};

  return Object.entries(paths)
    .sort(([a], [b]) => b.length - a.length)
    .map(([key, targets]) => {
      const target = targets[0];
      const isWildcard = key.endsWith("/*") && target.endsWith("/*");
      if (isWildcard) {
        return {
          find: new RegExp(`^${escapeRegex(key.slice(0, -2))}/(.+)$`),
          replacement: path.resolve(repoRoot, target.slice(0, -2)) + "/$1",
        };
      }
      return {
        find: key,
        replacement: path.resolve(repoRoot, target),
      };
    });
}
