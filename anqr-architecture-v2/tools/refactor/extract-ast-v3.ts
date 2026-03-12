import {
  Project,
  Node,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import fs from "node:fs";
import path from "node:path";

type ImportKindTag =
  | "internal"
  | "external"
  | "react"
  | "browser"
  | "node"
  | "netlify"
  | "worker"
  | "test"
  | "styles"
  | "asset"
  | "i18n"
  | "generated";

type FileRow = {
  file: string;
  ext: string;
  bytes: number;
  loc: number;
  nonEmptyLoc: number;
  hasJsx: boolean;
  topLevelSideEffects: boolean;
  runtimeTags: string[];
  importKindTags: ImportKindTag[];
  isTestFile: boolean;
  isWorkerFile: boolean;
  isNetlifyFile: boolean;
  isGeneratedLike: boolean;
  imports: Array<{
    module: string;
    kindTags: ImportKindTag[];
    defaultImport?: string;
    namespaceImport?: string;
    namedImports: string[];
    typeOnly: boolean;
    resolvedFile?: string | null;
  }>;
  exports: string[];
  symbolIds: string[];
};

type SymbolRow = {
  id: string;
  file: string;
  kind: string;
  name: string | null;
  exported: boolean;
  defaultExport: boolean;
  isNamedExport: boolean;
  isTypeOnly: boolean;
  isAsync: boolean;
  isGenerator: boolean;
  isReactComponent: boolean;
  isCustomHook: boolean;
  isContext: boolean;
  isProvider: boolean;
  isHandlerLike: boolean;
  hasJsx: boolean;
  topLevel: boolean;
  startLine: number;
  endLine: number;
  loc: number;
  runtimeTags: string[];
  params?: Array<{ name: string; type: string; optional: boolean }>;
  returnType?: string;
  typeText?: string;
  extends?: string[];
  implements?: string[];
  referencedSymbols?: string[];
  sourceText?: string;
  leadingComments?: string[];
};

type FileDepRow = {
  from: string;
  to: string | null;
  module: string;
  isRelative: boolean;
  resolvedFile?: string | null;
  typeOnly: boolean;
  kindTags: ImportKindTag[];
};

type SymbolDepRow = {
  fromId: string;
  fromName: string | null;
  fromFile: string;
  toName: string;
  toFile?: string | null;
  toId?: string | null;
  refKind: "identifier";
  internal: boolean;
};

type ReactRow = {
  id: string;
  file: string;
  name: string | null;
  classification:
    | "component"
    | "hook"
    | "context"
    | "provider"
    | "handler"
    | "utility"
    | "type-model"
    | "unknown";
  confidence: "high" | "medium" | "low";
  reasons: string[];
};

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out", "ast-inventory");

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(p: string): string {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function writeJsonl<T>(filePath: string, rows: T[]): void {
  fs.writeFileSync(filePath, rows.map(row => JSON.stringify(row)).join("\n") + "\n", "utf8");
}

function safeText(value: string | undefined, max = 6000): string | undefined {
  if (value == null) return undefined;
  return value.length > max ? `${value.slice(0, max)}\n/* ...truncated... */` : value;
}

function getLeadingComments(node: Node): string[] {
  return node.getLeadingCommentRanges().map(r => r.getText()).filter(Boolean);
}

function isReactComponentName(name: string | null): boolean {
  return !!name && /^[A-Z][A-Za-z0-9_]*$/.test(name);
}

function isCustomHookName(name: string | null): boolean {
  return !!name && /^use[A-Z0-9]/.test(name);
}

function isProviderName(name: string | null): boolean {
  return !!name && /Provider$/.test(name);
}

function isContextName(name: string | null): boolean {
  return !!name && /Context$/.test(name);
}

function isHandlerLikeName(name: string | null): boolean {
  return !!name && /^(handler|on[A-Z]|handle[A-Z])/.test(name);
}

function hasJsxDescendants(node: Node): boolean {
  return (
    node.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
    node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
    node.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0
  );
}

function getLocFromText(text: string): { loc: number; nonEmptyLoc: number } {
  const lines = text.split(/\r?\n/);
  return {
    loc: lines.length,
    nonEmptyLoc: lines.filter(line => line.trim().length > 0).length,
  };
}

function fileHasTopLevelSideEffects(sf: SourceFile): boolean {
  return sf.getStatements().some(stmt => {
    if (
      Node.isImportDeclaration(stmt) ||
      Node.isExportDeclaration(stmt) ||
      Node.isExportAssignment(stmt) ||
      Node.isInterfaceDeclaration(stmt) ||
      Node.isTypeAliasDeclaration(stmt) ||
      Node.isFunctionDeclaration(stmt) ||
      Node.isClassDeclaration(stmt) ||
      Node.isEnumDeclaration(stmt)
    ) {
      return false;
    }

    if (Node.isVariableStatement(stmt)) {
      return stmt.getDeclarations().some(d => {
        const init = d.getInitializer();
        return !!init && (
          Node.isCallExpression(init) ||
          Node.isAwaitExpression(init) ||
          Node.isNewExpression(init) ||
          Node.isTaggedTemplateExpression(init)
        );
      });
    }

    return true;
  });
}

function getImportKindTags(moduleSpecifier: string, resolvedFile: string | null): ImportKindTag[] {
  const tags: ImportKindTag[] = [];

  if (moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../") || moduleSpecifier.startsWith("@/")) {
    tags.push("internal");
  } else {
    tags.push("external");
  }

  if (/^react($|-|\/)/.test(moduleSpecifier) || moduleSpecifier === "react-i18next") {
    tags.push("react");
  }
  if (
    /@capacitor|browser|canvas|clipboard|dom|web|window|document|imagebitmap/i.test(moduleSpecifier)
  ) {
    tags.push("browser");
  }
  if (/^node:|^fs$|^path$|^os$|^crypto$|^url$/.test(moduleSpecifier)) {
    tags.push("node");
  }
  if (/netlify/i.test(moduleSpecifier)) {
    tags.push("netlify");
  }
  if (/worker/i.test(moduleSpecifier)) {
    tags.push("worker");
  }
  if (/\.spec\.|\.test\.|testing|vitest|jest|playwright|cypress/i.test(moduleSpecifier)) {
    tags.push("test");
  }
  if (/\.(css|scss|sass|less)$/.test(moduleSpecifier)) {
    tags.push("styles");
  }
  if (/\.(svg|png|jpg|jpeg|gif|webp|avif)$/.test(moduleSpecifier)) {
    tags.push("asset");
  }
  if (/i18n|locale|translation/i.test(moduleSpecifier)) {
    tags.push("i18n");
  }
  if (/generated|manifest|showcase/i.test(moduleSpecifier)) {
    tags.push("generated");
  }

  if (resolvedFile) {
    if (/src\/content\/generated|src\/i18n\/static/.test(resolvedFile)) {
      tags.push("generated");
    }
    if (/src\/content\/i18n|src\/i18n/.test(resolvedFile)) {
      tags.push("i18n");
    }
    if (/worker/i.test(resolvedFile)) {
      tags.push("worker");
    }
    if (/netlify/i.test(resolvedFile)) {
      tags.push("netlify");
    }
  }

  return uniq(tags);
}

function getFileRuntimeTags(file: string, imports: Array<{ kindTags: ImportKindTag[] }>, hasJsx: boolean): string[] {
  const tags = new Set<string>();

  if (hasJsx || /\.tsx$/.test(file)) tags.add("react");
  if (/worker/i.test(file)) tags.add("worker");
  if (/netlify/i.test(file) || /^netlify\//.test(file)) tags.add("netlify");
  if (/\.spec\.|\.test\./.test(file) || /__tests__/.test(file)) tags.add("test");
  if (/src\/i18n\/|src\/content\/i18n\//.test(file)) tags.add("i18n");
  if (/generated/.test(file)) tags.add("generated");
  if (/browser|canvas|clipboard|download|image/.test(file)) tags.add("browser");

  for (const imp of imports) {
    for (const tag of imp.kindTags) tags.add(tag);
  }

  return [...tags].sort();
}

function getFlags(node: Node): { exported: boolean; defaultExport: boolean; isAsync: boolean; isGenerator: boolean } {
  const anyNode = node as unknown as {
    isExported?: () => boolean;
    isDefaultExport?: () => boolean;
    isAsync?: () => boolean;
    isGenerator?: () => boolean;
  };

  return {
    exported: typeof anyNode.isExported === "function" ? anyNode.isExported() : false,
    defaultExport: typeof anyNode.isDefaultExport === "function" ? anyNode.isDefaultExport() : false,
    isAsync: typeof anyNode.isAsync === "function" ? anyNode.isAsync() : false,
    isGenerator: typeof anyNode.isGenerator === "function" ? anyNode.isGenerator() : false,
  };
}

function getTypeTextSafe(node: Node): string | undefined {
  try {
    return node.getType().getText(node);
  } catch {
    return undefined;
  }
}

function getReturnTypeTextSafe(node: Node): string | undefined {
  try {
    if (
      Node.isFunctionDeclaration(node) ||
      Node.isFunctionExpression(node) ||
      Node.isArrowFunction(node) ||
      Node.isMethodDeclaration(node)
    ) {
      return node.getReturnType().getText(node);
    }
  } catch {
    // ignore
  }
  return undefined;
}

function getNodeId(sf: SourceFile, name: string | null, node: Node): string {
  return `${rel(sf.getFilePath())}#${name ?? "anon"}:${node.getStartLineNumber()}-${node.getEndLineNumber()}`;
}

function getReferencedProjectSymbols(
  node: Node,
  currentSourceFile: SourceFile
): Array<{ name: string; file?: string | null; internal: boolean }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; file?: string | null; internal: boolean }> = [];

  for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const symbol = id.getSymbol();
    if (!symbol) continue;

    const declarations = symbol.getDeclarations();
    if (declarations.length === 0) continue;

    const declFile = declarations[0].getSourceFile();
    const file = rel(declFile.getFilePath());
    const internal = !declFile.isFromExternalLibrary() && !declFile.isInNodeModules();
    const key = `${symbol.getName()}@@${file}`;

    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name: symbol.getName(),
      file,
      internal,
    });
  }

  return out;
}

function classifyReactish(row: SymbolRow): ReactRow {
  const reasons: string[] = [];
  let classification: ReactRow["classification"] = "unknown";
  let confidence: ReactRow["confidence"] = "low";

  if (row.isCustomHook) {
    classification = "hook";
    confidence = "high";
    reasons.push("name matches useX");
  } else if (row.isContext) {
    classification = "context";
    confidence = "high";
    reasons.push("name ends with Context");
  } else if (row.isProvider) {
    classification = "provider";
    confidence = "high";
    reasons.push("name ends with Provider");
  } else if (row.isHandlerLike) {
    classification = "handler";
    confidence = "medium";
    reasons.push("handler-like name");
  } else if (row.isReactComponent) {
    classification = "component";
    confidence = row.hasJsx ? "high" : "medium";
    reasons.push("PascalCase name");
    if (row.hasJsx) reasons.push("contains JSX");
  } else if (row.kind === "interface" || row.kind === "type" || row.kind === "enum") {
    classification = "type-model";
    confidence = "medium";
    reasons.push("type declaration");
  } else {
    classification = "utility";
    confidence = "low";
    reasons.push("no stronger match");
  }

  return {
    id: row.id,
    file: row.file,
    name: row.name,
    classification,
    confidence,
    reasons,
  };
}

function main(): void {
  ensureDir(OUT_DIR);

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
  });

  const sourceFiles = project
    .getSourceFiles()
    .filter(sf => !sf.isDeclarationFile() && !sf.isInNodeModules() && !sf.isFromExternalLibrary());

  const fileRows: FileRow[] = [];
  const symbolRows: SymbolRow[] = [];
  const fileDepRows: FileDepRow[] = [];
  const symbolDepRows: SymbolDepRow[] = [];
  const reactRows: ReactRow[] = [];

  const symbolIdByFileAndName = new Map<string, string>();

  for (const sf of sourceFiles) {
    const filePath = rel(sf.getFilePath());
    const text = sf.getFullText();
    const stats = fs.existsSync(sf.getFilePath()) ? fs.statSync(sf.getFilePath()) : null;
    const { loc, nonEmptyLoc } = getLocFromText(text);

    const importRows = sf.getImportDeclarations().map(imp => {
      const resolved = imp.getModuleSpecifierSourceFile();
      const resolvedFile = resolved ? rel(resolved.getFilePath()) : null;
      const kindTags = getImportKindTags(imp.getModuleSpecifierValue(), resolvedFile);

      return {
        module: imp.getModuleSpecifierValue(),
        kindTags,
        defaultImport: imp.getDefaultImport()?.getText(),
        namespaceImport: imp.getNamespaceImport()?.getText(),
        namedImports: imp.getNamedImports().map(n => n.getName()),
        typeOnly: imp.isTypeOnly(),
        resolvedFile,
      };
    });

    const hasJsx = hasJsxDescendants(sf);
    const runtimeTags = getFileRuntimeTags(filePath, importRows, hasJsx);
    const exports = [...sf.getExportedDeclarations().keys()];
    const topLevelSideEffects = fileHasTopLevelSideEffects(sf);
    const symbolIdsForFile: string[] = [];

    for (const stmt of sf.getStatements()) {
      const createRow = (node: Node, kind: string, name: string | null): SymbolRow => {
        const flags = getFlags(node);
        const refs = getReferencedProjectSymbols(node, sf);
        const id = getNodeId(sf, name, node);

        const row: SymbolRow = {
          id,
          file: filePath,
          kind,
          name,
          exported: flags.exported,
          defaultExport: flags.defaultExport,
          isNamedExport: flags.exported && !flags.defaultExport,
          isTypeOnly: kind === "interface" || kind === "type",
          isAsync: flags.isAsync,
          isGenerator: flags.isGenerator,
          isReactComponent: isReactComponentName(name) && hasJsxDescendants(node),
          isCustomHook: isCustomHookName(name),
          isContext: isContextName(name),
          isProvider: isProviderName(name),
          isHandlerLike: isHandlerLikeName(name),
          hasJsx: hasJsxDescendants(node),
          topLevel: node.getParent() === sf,
          startLine: node.getStartLineNumber(),
          endLine: node.getEndLineNumber(),
          loc: node.getEndLineNumber() - node.getStartLineNumber() + 1,
          runtimeTags,
          referencedSymbols: refs.map(ref => `${ref.name}@@${ref.file ?? "<unknown>"}`),
          sourceText: safeText(node.getText()),
          leadingComments: getLeadingComments(node),
        };

        symbolRows.push(row);
        symbolIdsForFile.push(id);

        if (name) {
          symbolIdByFileAndName.set(`${filePath}@@${name}`, id);
        }

        return row;
      };

      if (Node.isFunctionDeclaration(stmt)) {
        const row = createRow(stmt, "function", stmt.getName() ?? null);
        row.returnType = getReturnTypeTextSafe(stmt);
        row.params = stmt.getParameters().map(p => ({
          name: p.getName(),
          type: p.getType().getText(p),
          optional: p.isOptional(),
        }));
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isClassDeclaration(stmt)) {
        const row = createRow(stmt, "class", stmt.getName() ?? null);
        row.extends = stmt.getExtends() ? [stmt.getExtends()!.getText()] : [];
        row.implements = stmt.getImplements().map(i => i.getText());
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isInterfaceDeclaration(stmt)) {
        const row = createRow(stmt, "interface", stmt.getName());
        row.extends = stmt.getExtends().map(e => e.getText());
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isTypeAliasDeclaration(stmt)) {
        const row = createRow(stmt, "type", stmt.getName());
        row.typeText = stmt.getTypeNode()?.getText() ?? getTypeTextSafe(stmt);
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isEnumDeclaration(stmt)) {
        const row = createRow(stmt, "enum", stmt.getName());
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isVariableStatement(stmt)) {
        for (const decl of stmt.getDeclarations()) {
          const init = decl.getInitializer();
          const name = decl.getName();
          const kind =
            init && Node.isArrowFunction(init)
              ? "arrow-function-variable"
              : init && Node.isFunctionExpression(init)
              ? "function-expression-variable"
              : "variable";
          const row = createRow(decl, kind, name);
          row.typeText = getTypeTextSafe(decl);

          if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
            row.returnType = getReturnTypeTextSafe(init);
            row.params = init.getParameters().map(p => ({
              name: p.getName(),
              type: p.getType().getText(p),
              optional: p.isOptional(),
            }));
            row.isAsync = getFlags(init).isAsync;
            row.isReactComponent = isReactComponentName(name) && hasJsxDescendants(init);
            row.hasJsx = hasJsxDescendants(init);
          }

          reactRows.push(classifyReactish(row));
        }
        continue;
      }

      if (Node.isExportDeclaration(stmt)) {
        const row = createRow(stmt, "re-export", null);
        reactRows.push(classifyReactish(row));
        continue;
      }

      if (Node.isExportAssignment(stmt)) {
        const row = createRow(stmt, "export-assignment", "default");
        reactRows.push(classifyReactish(row));
      }
    }

    for (const imp of importRows) {
      fileDepRows.push({
        from: filePath,
        to: imp.resolvedFile ?? null,
        module: imp.module,
        isRelative: imp.module.startsWith("./") || imp.module.startsWith("../"),
        resolvedFile: imp.resolvedFile ?? null,
        typeOnly: imp.typeOnly,
        kindTags: imp.kindTags,
      });
    }

    fileRows.push({
      file: filePath,
      ext: path.extname(filePath),
      bytes: stats?.size ?? Buffer.byteLength(text, "utf8"),
      loc,
      nonEmptyLoc,
      hasJsx,
      topLevelSideEffects,
      runtimeTags,
      importKindTags: uniq(importRows.flatMap(imp => imp.kindTags)).sort() as ImportKindTag[],
      isTestFile: /\.spec\.|\.test\./.test(filePath) || /__tests__/.test(filePath),
      isWorkerFile: /worker/i.test(filePath),
      isNetlifyFile: /netlify/i.test(filePath),
      isGeneratedLike:
        /generated/.test(filePath) ||
        /^src\/i18n\/static\//.test(filePath) ||
        /^src\/content\/generated\//.test(filePath),
      imports: importRows,
      exports,
      symbolIds: symbolIdsForFile,
    });
  }

  for (const row of symbolRows) {
    for (const ref of row.referencedSymbols ?? []) {
      const [toName, toFile] = ref.split("@@");
      const internal = !!toFile && !toFile.startsWith("node_modules/") && !toFile.includes("/node_modules/");
      const toId = toFile ? symbolIdByFileAndName.get(`${toFile}@@${toName}`) ?? null : null;

      symbolDepRows.push({
        fromId: row.id,
        fromName: row.name,
        fromFile: row.file,
        toName,
        toFile: toFile ?? null,
        toId,
        refKind: "identifier",
        internal,
      });
    }
  }

  const activeFiles = fileRows.filter(
    file =>
      !file.file.startsWith("src/i18n/static/") &&
      !file.file.startsWith("src/content/generated/") &&
      !file.file.endsWith(".json")
  );
  const activeFileSet = new Set(activeFiles.map(file => file.file));

  const summary = {
    generatedAt: new Date().toISOString(),
    files: fileRows.length,
    symbols: symbolRows.length,
    fileDeps: fileDepRows.length,
    symbolDeps: symbolDepRows.length,
    reactClassifications: reactRows.length,
    components: reactRows.filter(r => r.classification === "component").length,
    hooks: reactRows.filter(r => r.classification === "hook").length,
    providers: reactRows.filter(r => r.classification === "provider").length,
    contexts: reactRows.filter(r => r.classification === "context").length,
    handlers: reactRows.filter(r => r.classification === "handler").length,
    sideEffectFiles: fileRows.filter(f => f.topLevelSideEffects).length,
    activeFilesExcludingGeneratedAndStaticI18n: activeFiles.length,
    activeSymbolsExcludingGeneratedAndStaticI18n: symbolRows.filter(s => activeFileSet.has(s.file)).length,
    internalFileDepsExcludingGeneratedAndStaticI18n: fileDepRows.filter(
      dep => activeFileSet.has(dep.from) && dep.to != null && activeFileSet.has(dep.to)
    ).length,
    internalSymbolDeps: symbolDepRows.filter(dep => dep.internal).length,
  };

  writeJsonl(path.join(OUT_DIR, "files.jsonl"), fileRows);
  writeJsonl(path.join(OUT_DIR, "symbols.jsonl"), symbolRows);
  writeJsonl(path.join(OUT_DIR, "file-deps.jsonl"), fileDepRows);
  writeJsonl(path.join(OUT_DIR, "symbol-deps.jsonl"), symbolDepRows);
  writeJsonl(path.join(OUT_DIR, "react-classification.jsonl"), reactRows);
  fs.writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf8");

  console.log(`Wrote inventory to ${rel(OUT_DIR)}`);
  console.log(summary);
}

main();