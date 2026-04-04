// Generated from ../scripts/list-ast-names.mjs:217

import process from "node:process";
import { Project } from "ts-morph";
import path from "node:path";
import { DEFAULT_GLOBS } from "../lib/ast-helpers.mjs";

import { flattenResults } from "./flatten-results.mjs";
import { formatFlat } from "./format-flat.mjs";
import { formatGroupedFile } from "./format-grouped-file.mjs";
import { groupByFile } from "./group-by-file.mjs";
import { parseArgs } from "./parse-args.mjs";

export const main = () => {
  const options = parseArgs(process.argv.slice(2));

  const project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  const globs = options.paths.length > 0 ? options.paths : DEFAULT_GLOBS;
  const sourceFiles = project.addSourceFilesAtPaths(globs);

  const items = flattenResults(sourceFiles).sort(
    (a, b) =>
      a.path.localeCompare(b.path) ||
      a.line - b.line ||
      a.kind.localeCompare(b.kind) ||
      a.name.localeCompare(b.name),
  );

  if (options.json) {
    const payload = options.byFile ? groupByFile(items) : items;
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (options.byFile) {
    const groups = groupByFile(items);
    for (const group of groups) {
      process.stdout.write(`${formatGroupedFile(group)}\n`);
      process.stdout.write("\n");
    }
    return;
  }

  for (const item of items) {
    process.stdout.write(`${formatFlat(item)}\n`);
  }
};
