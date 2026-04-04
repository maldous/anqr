// Generated from ../scripts/audit-ast-density.mjs:178

import process from "node:process";
import { Project } from "ts-morph";
import path from "node:path";
import { DEFAULT_GLOBS, normalizePath } from "../lib/ast-helpers.mjs";

import { collectHeavyNodes } from "./collect-heavy-nodes.mjs";
import { formatEntry } from "./format-entry.mjs";
import { isPureTypeDeclarationFile } from "./is-pure-type-declaration-file.mjs";
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

  const results = sourceFiles
    .map((sourceFile) => {
      const nodes = collectHeavyNodes(sourceFile);
      return {
        path: normalizePath(sourceFile.getFilePath()),
        count: nodes.length,
        nodes,
      };
    })
    .filter((entry) => !isPureTypeDeclarationFile(entry))
    .filter((entry) => entry.count > options.threshold)
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

  if (options.json) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
    return;
  }

  for (const entry of results) {
    process.stdout.write(`${formatEntry(entry)}\n`);
  }
};
