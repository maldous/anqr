// Generated from ../scripts/list-ast-names.mjs:172

import { normalizePath } from "../lib/ast-helpers.mjs";

import { collectTopLevelEntries } from "./collect-top-level-entries.mjs";

export const flattenResults = (sourceFiles) =>
  sourceFiles.flatMap((sourceFile) => {
    const filePath = normalizePath(sourceFile.getFilePath());
    const entries = collectTopLevelEntries(sourceFile);

    return entries.map((entry) => ({
      path: filePath,
      line: entry.line,
      kind: entry.kind,
      name: entry.name,
      exported: entry.exported,
    }));
  });
