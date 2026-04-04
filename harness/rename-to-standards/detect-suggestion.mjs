import path from "node:path";

import { choosePrimaryEntry } from "./choose-primary-entry.mjs";
import { createSourceFile } from "./create-source-file.mjs";
import { getTopLevelEntries } from "./get-top-level-entries.mjs";
import { hasJsx } from "./has-jsx.mjs";
import { isTypeOnlyFile } from "./is-type-only-file.mjs";
import { normalize } from "./normalize.mjs";
import { rel } from "./rel.mjs";
import { toKebab } from "./to-kebab.mjs";

export const detectSuggestion = (root, filePath, text) => {
  const relativePath = rel(root, filePath);
  const sourceFile = createSourceFile(filePath, text);
  const entries = getTopLevelEntries(sourceFile);
  const primary = choosePrimaryEntry(entries);
  const dirName = path.posix.dirname(relativePath);
  const ext = path.extname(relativePath);
  const baseName = path.posix.basename(relativePath, ext);
  const jsx = hasJsx(sourceFile);
  const typeOnly = isTypeOnlyFile(sourceFile);

  let nextStem = null;
  let nextExt = ext;
  let reason = null;

  const strippedLegacyStem = baseName
    .replace(/\.(type|interface|props|state)$/u, "")
    .replace(/-(type|interface|props|state)$/u, "")
    .replaceAll(/-(fn|type|interface)-/gu, "-");

  if (
    (/\.(type|interface|props|state)$/u.test(baseName) ||
      /-(type|interface|props|state)$/u.test(baseName)) &&
    typeOnly
  ) {
    nextStem = `${toKebab(strippedLegacyStem)}.types`;
    nextExt = ".ts";
    reason = "legacy-type-suffix";
  } else if ((baseName.includes("-type-") || baseName.includes("-interface-")) && typeOnly) {
    nextStem = `${toKebab(strippedLegacyStem)}.types`;
    nextExt = ".ts";
    reason = "legacy-inline-type-marker";
  } else if (typeOnly && /^[A-Z]/u.test(baseName)) {
    nextStem = `${toKebab(baseName)}.types`;
    nextExt = ".ts";
    reason = "pascal-case-type-file";
  } else if (baseName.includes("-fn-")) {
    const inApplication = relativePath.includes("/application/");
    nextStem = toKebab(primary?.name ?? strippedLegacyStem);
    if (inApplication) nextStem = `${nextStem}.service`;
    nextExt = jsx ? ".tsx" : ".ts";
    reason = inApplication ? "legacy-inline-fn-marker-application" : "legacy-inline-fn-marker";
  } else if (/^[A-Z]/u.test(baseName) && primary?.name) {
    nextStem = toKebab(primary.name);
    nextExt = jsx ? ".tsx" : ".ts";
    reason = "pascal-case-file-name";
  }

  if (!nextStem) return null;
  const nextRelativePath = normalize(path.posix.join(dirName, `${nextStem}${nextExt}`));
  if (nextRelativePath === relativePath) return null;

  return { oldRelativePath: relativePath, newRelativePath: nextRelativePath, reason };
};
