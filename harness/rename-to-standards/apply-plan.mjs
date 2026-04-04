import path from "node:path";
import fs from "node:fs";
import process from "node:process";

import { collectModuleSpecifiers } from "./collect-module-specifiers.mjs";
import { createSourceFile } from "./create-source-file.mjs";
import { rel } from "./rel.mjs";
import { replaceExt } from "./replace-ext.mjs";
import { rewriteSpecifier } from "./rewrite-specifier.mjs";
import { rewriteTextAtSpans } from "./rewrite-text-at-spans.mjs";
import { stripCodeExtension } from "./strip-code-extension.mjs";

export const applyPlan = (root, filePaths, plan) => {
  const mapByOldNoExt = new Map(
    plan.map((item) => [
      stripCodeExtension(item.oldRelativePath),
      stripCodeExtension(item.newRelativePath),
    ]),
  );

  for (const filePath of filePaths) {
    const oldRel = rel(root, filePath);
    const newRelBase = mapByOldNoExt.get(stripCodeExtension(oldRel));
    const newRel = newRelBase ? replaceExt(newRelBase, path.extname(oldRel)) : oldRel;
    const text = fs.readFileSync(filePath, "utf8");
    const sourceFile = createSourceFile(filePath, text);
    const specifiers = collectModuleSpecifiers(sourceFile);
    const edits = [];
    for (const specifier of specifiers) {
      const replacement = rewriteSpecifier(specifier.value, oldRel, newRel, mapByOldNoExt);
      if (replacement && replacement !== specifier.value) {
        edits.push({ start: specifier.start, end: specifier.end, value: replacement });
      }
    }
    if (edits.length > 0) {
      fs.writeFileSync(filePath, rewriteTextAtSpans(text, edits), "utf8");
    }
  }

  const moves = plan
    .map((item) => ({
      oldAbs: path.join(root, item.oldRelativePath),
      newAbs: path.join(root, item.newRelativePath),
    }))
    .sort((a, b) => b.oldAbs.length - a.oldAbs.length);

  for (const move of moves) {
    if (!fs.existsSync(move.oldAbs)) continue;
    fs.mkdirSync(path.dirname(move.newAbs), { recursive: true });
    fs.renameSync(move.oldAbs, move.newAbs);
    process.stdout.write(`moved ${rel(root, move.oldAbs)} -> ${rel(root, move.newAbs)}\n`);
  }
};
