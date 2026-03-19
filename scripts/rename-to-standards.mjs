#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");

const DEFAULT_DIRS = ["src", "netlify", "tests"];
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".d.ts"]);

const parseArgs = (argv) => {
  const options = {
    apply: false,
    json: false,
    root: process.cwd(),
    dirs: [...DEFAULT_DIRS],
  };

  let index = 0;
  while (index < argv.length) {
    const arg = argv[index];
    if (arg === "--apply") {
      options.apply = true;
      index += 1;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      index += 1;
      continue;
    }
    if (arg === "--root") {
      const nextArg = argv[index + 1];
      options.root = path.resolve(nextArg);
      index += 2;
      continue;
    }
    if (arg === "--dirs") {
      const nextArg = argv[index + 1];
      options.dirs = nextArg
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      index += 2;
      continue;
    }
    index += 1;
  }

  return options;
};

const normalize = (value) => value.replaceAll("\\", "/");
const rel = (root, filePath) => normalize(path.relative(root, filePath));
const stripCodeExtension = (value) => value.replace(/\.(d\.ts|tsx|ts|jsx|js|mjs|cjs)$/u, "");
const replaceExt = (filePath, newExt) => `${stripCodeExtension(filePath)}${newExt}`;

const toKebab = (value) =>
  value
    .replaceAll(/([a-z\d])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z]+?)([A-Z][a-z])/g, "$1-$2")
    .replaceAll(/[_.\s]+/g, "-")
    .replaceAll(/--+/g, "-")
    .replaceAll(/(?:^-+)|(?:-+$)/g, "")
    .toLowerCase();

const isCodeFile = (filePath) => {
  const base = path.basename(filePath);
  if (base.endsWith(".spec.ts") || base.endsWith(".spec.tsx")) return true;
  if (base.endsWith(".test.ts") || base.endsWith(".test.tsx")) return true;
  return [...CODE_EXTENSIONS].some((ext) => filePath.endsWith(ext));
};

const shouldSkip = (filePath) => {
  const normalized = normalize(filePath);
  return (
    normalized.includes("/node_modules/") ||
    normalized.includes("/.git/") ||
    normalized.includes("/dist/") ||
    normalized.includes("/coverage/") ||
    normalized.includes("/src/i18n/locales/") ||
    normalized.includes("/src/i18n/static/") ||
    normalized.includes("/src/content/generated/")
  );
};

const walk = (dirPath, results = []) => {
  if (!fs.existsSync(dirPath)) return results;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (shouldSkip(fullPath)) continue;
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }
    if (entry.isFile() && isCodeFile(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
};

const scriptKindFor = (filePath) => {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs") || filePath.endsWith(".cjs"))
    return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
};

const createSourceFile = (filePath, text) =>
  ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKindFor(filePath));

const getDeclarationName = (node) => {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  return null;
};

const isExported = (node) =>
  Array.isArray(node.modifiers) &&
  node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

const getTopLevelEntries = (sourceFile) => {
  const entries = [];
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement)) {
      entries.push({
        kind: "function",
        name: getDeclarationName(statement),
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isClassDeclaration(statement)) {
      entries.push({
        kind: "class",
        name: getDeclarationName(statement),
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isInterfaceDeclaration(statement)) {
      entries.push({
        kind: "interface",
        name: statement.name.text,
        exported: isExported(statement),
      });
      continue;
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      entries.push({ kind: "type", name: statement.name.text, exported: isExported(statement) });
      continue;
    }
    if (ts.isEnumDeclaration(statement)) {
      entries.push({ kind: "enum", name: statement.name.text, exported: isExported(statement) });
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const name = ts.isIdentifier(declaration.name) ? declaration.name.text : null;
        let kind = "variable";
        if (
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          kind = "variable.function";
        } else if (
          declaration.initializer &&
          ts.isObjectLiteralExpression(declaration.initializer)
        ) {
          kind = "variable.object";
        }
        entries.push({ kind, name, exported: isExported(statement) });
      }
    }
  }
  return entries;
};

const collectModuleSpecifiers = (sourceFile) => {
  const items = [];
  for (const statement of sourceFile.statements) {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      items.push({
        value: statement.moduleSpecifier.text,
        start: statement.moduleSpecifier.getStart(sourceFile) + 1,
        end: statement.moduleSpecifier.getEnd() - 1,
      });
      continue;
    }
    if (
      ts.isImportEqualsDeclaration(statement) &&
      ts.isExternalModuleReference(statement.moduleReference) &&
      statement.moduleReference.expression &&
      ts.isStringLiteral(statement.moduleReference.expression)
    ) {
      items.push({
        value: statement.moduleReference.expression.text,
        start: statement.moduleReference.expression.getStart(sourceFile) + 1,
        end: statement.moduleReference.expression.getEnd() - 1,
      });
    }
  }
  return items;
};

const hasJsx = (sourceFile) => {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return found;
};

const isTypeOnlyStatement = (statement) =>
  ts.isImportDeclaration(statement) ||
  ts.isExportDeclaration(statement) ||
  ts.isInterfaceDeclaration(statement) ||
  ts.isTypeAliasDeclaration(statement) ||
  ts.isEnumDeclaration(statement) ||
  ts.isEmptyStatement(statement);

const isTypeOnlyFile = (sourceFile) => sourceFile.statements.every(isTypeOnlyStatement);

const choosePrimaryEntry = (entries) => {
  const named = entries.filter((entry) => entry.name && !entry.name.startsWith("_"));
  const exportedNamed = named.filter((entry) => entry.exported);
  const preferred = exportedNamed.length > 0 ? exportedNamed : named;
  return preferred.length === 1 ? preferred[0] : null;
};

const detectSuggestion = (root, filePath, text) => {
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

const buildPlan = (root, filePaths) => {
  const plan = [];
  for (const filePath of filePaths) {
    const text = fs.readFileSync(filePath, "utf8");
    const suggestion = detectSuggestion(root, filePath, text);
    if (suggestion) plan.push(suggestion);
  }
  return plan.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
};

const rewriteTextAtSpans = (text, edits) => {
  const ordered = [...edits].sort((a, b) => b.start - a.start);
  let next = text;
  for (const edit of ordered) {
    next = `${next.slice(0, edit.start)}${edit.value}${next.slice(edit.end)}`;
  }
  return next;
};

const ensureDot = (value) => (value.startsWith(".") ? value : `./${value}`);

const rewriteSpecifier = (rawSpecifier, importerOldRel, importerNewRel, mapByOldNoExt) => {
  if (rawSpecifier.startsWith("@/")) {
    const oldTarget = normalize(`src/${rawSpecifier.slice(2)}`);
    const newTarget = mapByOldNoExt.get(oldTarget) ?? oldTarget;
    if (!newTarget.startsWith("src/")) return null;
    return `@/${stripCodeExtension(newTarget).slice(4)}`;
  }

  if (rawSpecifier.startsWith("./") || rawSpecifier.startsWith("../")) {
    const oldTarget = normalize(
      path.posix.normalize(path.posix.join(path.posix.dirname(importerOldRel), rawSpecifier)),
    );
    const newTarget = mapByOldNoExt.get(oldTarget) ?? oldTarget;
    const relSpec = normalize(path.posix.relative(path.posix.dirname(importerNewRel), newTarget));
    return ensureDot(stripCodeExtension(relSpec));
  }

  return null;
};

const applyPlan = (root, filePaths, plan) => {
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

const partitionCollisions = (plan) => {
  const seen = new Map();
  for (const item of plan) {
    const bucket = seen.get(item.newRelativePath) ?? [];
    bucket.push(item);
    seen.set(item.newRelativePath, bucket);
  }
  const accepted = [];
  const skipped = [];
  for (const items of seen.values()) {
    if (items.length === 1) {
      accepted.push(items[0]);
      continue;
    }
    skipped.push(...items.map((item) => ({ ...item, reason: `${item.reason};collision` })));
  }
  accepted.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
  skipped.sort((a, b) => a.oldRelativePath.localeCompare(b.oldRelativePath));
  return { accepted, skipped };
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const root = options.root;
  const filePaths = options.dirs.flatMap((dir) => walk(path.join(root, dir)));
  const plan = buildPlan(root, filePaths);
  const { accepted, skipped } = partitionCollisions(plan);

  if (!options.apply) {
    if (options.json) {
      process.stdout.write(`${JSON.stringify({ accepted, skipped }, null, 2)}\n`);
      return;
    }
    for (const item of accepted) {
      process.stdout.write(
        `${item.oldRelativePath} -> ${item.newRelativePath}  [${item.reason}]\n`,
      );
    }
    if (skipped.length > 0) {
      process.stdout.write(`\n# skipped due to collisions\n`);
      for (const item of skipped) {
        process.stdout.write(
          `${item.oldRelativePath} -> ${item.newRelativePath}  [${item.reason}]\n`,
        );
      }
    }
    return;
  }

  applyPlan(root, filePaths, accepted);
  if (skipped.length > 0) {
    process.stdout.write(`skipped ${skipped.length} conflicting renames\n`);
  }
};

main();
