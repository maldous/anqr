import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

type Json = Record<string, unknown>;

type ImportKindTag =
  | 'browser'
  | 'react'
  | 'node'
  | 'netlify'
  | 'worker'
  | 'test'
  | 'i18n'
  | 'generated'
  | 'asset'
  | 'styles'
  | 'external'
  | 'internal';

type RuntimeTag = 'browser' | 'react' | 'node' | 'netlify' | 'worker' | 'test' | 'unknown';

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
  runtimeTags: RuntimeTag[];
  params?: Array<{ name: string; type: string; optional: boolean }>;
  returnType?: string;
  typeText?: string;
  extends?: string[];
  implements?: string[];
  importsUsed?: string[];
  referencedSymbols?: string[];
  sourceText?: string;
  leadingComments?: string[];
};

type FileImportRow = {
  module: string;
  defaultImport?: string;
  namespaceImport?: string;
  namedImports: string[];
  typeOnly: boolean;
  kindTags: ImportKindTag[];
  resolvedFile?: string | null;
};

type FileRow = {
  file: string;
  ext: string;
  bytes: number;
  loc: number;
  nonEmptyLoc: number;
  hasJsx: boolean;
  topLevelSideEffects: boolean;
  imports: FileImportRow[];
  exports: string[];
  symbolIds: string[];
  importKindTags: ImportKindTag[];
  runtimeTags: RuntimeTag[];
  isTestFile: boolean;
  isWorkerFile: boolean;
  isNetlifyFile: boolean;
  isGeneratedLike: boolean;
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
  refKind: 'identifier';
};

type ReactRow = {
  id: string;
  file: string;
  name: string | null;
  classification:
    | 'component'
    | 'hook'
    | 'context'
    | 'provider'
    | 'handler'
    | 'utility'
    | 'type-model'
    | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  runtimeTags: RuntimeTag[];
};

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'out', 'ast-inventory');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function rel(p: string) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function safeText(value: string | undefined, max = 4000) {
  if (!value) return undefined;
  return value.length > max ? value.slice(0, max) + '\n/* ...truncated... */' : value;
}

function appendJsonl(filePath: string, row: Json) {
  fs.appendFileSync(filePath, JSON.stringify(row) + '\n', 'utf8');
}

function resetOutput() {
  ensureDir(OUT_DIR);
  for (const name of [
    'symbols.jsonl',
    'files.jsonl',
    'file-deps.jsonl',
    'symbol-deps.jsonl',
    'react-classification.jsonl',
    'runtime-summary.jsonl',
    'summary.json',
  ]) {
    fs.writeFileSync(path.join(OUT_DIR, name), '', 'utf8');
  }
}

function getLeadingComments(node: Node): string[] {
  const ranges = node.getLeadingCommentRanges();
  return ranges.map((r) => r.getText()).filter(Boolean);
}

function hasJsxDescendants(node: Node): boolean {
  return (
    node.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
    node.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
    node.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0
  );
}

function getFileTextStats(sf: SourceFile) {
  const text = sf.getFullText();
  const lines = text.split(/\r?\n/);
  const loc = lines.length;
  const nonEmptyLoc = lines.filter((line) => line.trim().length > 0).length;
  const bytes = Buffer.byteLength(text, 'utf8');
  return { bytes, loc, nonEmptyLoc };
}

function fileHasTopLevelSideEffects(sf: SourceFile): boolean {
  return sf.getStatements().some((stmt) => {
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
      return stmt.getDeclarations().some((d) => {
        const init = d.getInitializer();
        return (
          !!init &&
          (Node.isCallExpression(init) ||
            Node.isAwaitExpression(init) ||
            Node.isNewExpression(init) ||
            Node.isTaggedTemplateExpression(init))
        );
      });
    }

    return true;
  });
}

function isReactComponentName(name: string | null) {
  return !!name && /^[A-Z][A-Za-z0-9_]*$/.test(name);
}

function isCustomHookName(name: string | null) {
  return !!name && /^use[A-Z0-9]/.test(name);
}

function isProviderName(name: string | null) {
  return !!name && name.endsWith('Provider');
}

function isContextName(name: string | null) {
  return !!name && name.endsWith('Context');
}

function isHandlerLikeName(name: string | null) {
  return !!name && /^(handler|on[A-Z]|handle[A-Z])/.test(name);
}

function getNodeId(sf: SourceFile, name: string | null, node: Node) {
  const start = node.getStartLineNumber();
  const end = node.getEndLineNumber();
  return `${rel(sf.getFilePath())}#${name ?? 'anon'}:${start}-${end}`;
}

function getExportFlags(node: Node) {
  const anyNode = node as any;
  return {
    exported: typeof anyNode.isExported === 'function' ? anyNode.isExported() : false,
    defaultExport:
      typeof anyNode.isDefaultExport === 'function' ? anyNode.isDefaultExport() : false,
  };
}

function getTypeTextSafe(node: Node) {
  try {
    return node.getType().getText(node);
  } catch {
    return undefined;
  }
}

function getReturnTypeTextSafe(node: Node) {
  try {
    if (
      Node.isFunctionDeclaration(node) ||
      Node.isFunctionExpression(node) ||
      Node.isArrowFunction(node) ||
      Node.isMethodDeclaration(node)
    ) {
      return node.getReturnType().getText(node);
    }
  } catch {}
  return undefined;
}

function getNodeLoc(node: Node) {
  return node.getEndLineNumber() - node.getStartLineNumber() + 1;
}

function tagImport(moduleSpecifier: string, currentFile: string): ImportKindTag[] {
  const mod = moduleSpecifier.toLowerCase();
  const file = currentFile.toLowerCase();
  const tags = new Set<ImportKindTag>();

  if (moduleSpecifier.startsWith('.')) tags.add('internal');
  else tags.add('external');

  if (
    mod === 'react' ||
    mod === 'react-dom' ||
    mod.startsWith('react/') ||
    mod.includes('@types/react')
  ) {
    tags.add('react');
  }

  if (
    mod.includes('window') ||
    mod.includes('document') ||
    mod.includes('clipboard') ||
    mod.includes('dom') ||
    mod.includes('browser') ||
    mod.includes('web') ||
    mod.includes('canvas') ||
    mod.includes('navigator')
  ) {
    tags.add('browser');
  }

  if (
    mod.startsWith('node:') ||
    ['fs', 'path', 'os', 'url', 'crypto', 'stream', 'buffer', 'events', 'process'].includes(mod)
  ) {
    tags.add('node');
  }

  if (mod.includes('netlify') || file.includes('/netlify/') || file.includes('edge-function')) {
    tags.add('netlify');
  }

  if (mod.includes('worker') || file.includes('worker')) {
    tags.add('worker');
  }

  if (
    mod.includes('vitest') ||
    mod.includes('jest') ||
    mod.includes('playwright') ||
    mod.includes('cypress') ||
    /(^|\.|\/)(test|spec)(\.|\/|$)/.test(mod) ||
    /(^|\.|\/)(test|spec)(\.|\/|$)/.test(file)
  ) {
    tags.add('test');
  }

  if (mod.includes('i18n') || mod.includes('locale') || file.includes('/i18n/')) {
    tags.add('i18n');
  }

  if (
    mod.endsWith('.json') ||
    mod.endsWith('.svg') ||
    mod.endsWith('.png') ||
    mod.endsWith('.jpg') ||
    mod.endsWith('.jpeg') ||
    mod.endsWith('.webp')
  ) {
    tags.add('asset');
  }

  if (
    mod.endsWith('.css') ||
    mod.endsWith('.scss') ||
    mod.endsWith('.sass') ||
    mod.endsWith('.less')
  ) {
    tags.add('styles');
  }

  if (file.includes('/generated/') || file.includes('.generated.') || mod.includes('generated')) {
    tags.add('generated');
  }

  return [...tags];
}

function inferRuntimeTagsFromFile(
  file: string,
  hasJsx: boolean,
  imports: FileImportRow[]
): RuntimeTag[] {
  const tags = new Set<RuntimeTag>();
  const lower = file.toLowerCase();
  const importTags = new Set(imports.flatMap((i) => i.kindTags));

  if (hasJsx || importTags.has('react') || lower.endsWith('.tsx')) tags.add('react');
  if (importTags.has('browser') || lower.includes('browser') || lower.includes('clipboard'))
    tags.add('browser');
  if (importTags.has('node') || lower.includes('scripts/') || lower.includes('node'))
    tags.add('node');
  if (importTags.has('netlify') || lower.includes('/netlify/') || lower.includes('edge-function'))
    tags.add('netlify');
  if (importTags.has('worker') || lower.includes('worker')) tags.add('worker');
  if (importTags.has('test') || /(^|\.|\/)(test|spec)(\.|\/|$)/.test(lower)) tags.add('test');
  if (tags.size === 0) tags.add('unknown');

  return [...tags];
}

function inferRuntimeTagsFromSymbol(
  fileRuntimeTags: RuntimeTag[],
  row: Pick<SymbolRow, 'hasJsx' | 'isReactComponent' | 'isCustomHook' | 'isHandlerLike'>
): RuntimeTag[] {
  const tags = new Set<RuntimeTag>(fileRuntimeTags);
  if (row.hasJsx || row.isReactComponent || row.isCustomHook) tags.add('react');
  if (row.isHandlerLike && tags.has('netlify')) tags.add('netlify');
  if (tags.size === 0) tags.add('unknown');
  return [...tags];
}

function classifyReactish(row: SymbolRow): ReactRow {
  const reasons: string[] = [];
  let classification: ReactRow['classification'] = 'unknown';
  let confidence: ReactRow['confidence'] = 'low';

  if (row.isCustomHook) {
    classification = 'hook';
    confidence = 'high';
    reasons.push('name matches useX');
  }

  if (row.isContext) {
    classification = 'context';
    confidence = 'high';
    reasons.push('name ends with Context');
  }

  if (row.isProvider) {
    classification = 'provider';
    confidence = 'high';
    reasons.push('name ends with Provider');
  }

  if (row.isHandlerLike) {
    classification = 'handler';
    confidence = 'medium';
    reasons.push('handler-like name');
  }

  if (row.isReactComponent) {
    classification = 'component';
    confidence = row.hasJsx ? 'high' : 'medium';
    reasons.push('PascalCase name');
    if (row.hasJsx) reasons.push('contains JSX');
  }

  if (row.kind === 'interface' || row.kind === 'type' || row.kind === 'enum') {
    classification = 'type-model';
    confidence = 'medium';
    reasons.push('type declaration');
  }

  if (classification === 'unknown') {
    classification = 'utility';
    confidence = 'low';
    reasons.push('no stronger match');
  }

  return {
    id: row.id,
    file: row.file,
    name: row.name,
    classification,
    confidence,
    reasons,
    runtimeTags: row.runtimeTags,
  };
}

function resolvedImportFile(sf: SourceFile, moduleSpecifier: string): string | null {
  const importDecl = sf
    .getImportDeclarations()
    .find((d) => d.getModuleSpecifierValue() === moduleSpecifier);
  if (!importDecl) return null;
  const resolved = importDecl.getModuleSpecifierSourceFile();
  return resolved ? rel(resolved.getFilePath()) : null;
}

function getReferencedProjectSymbols(
  node: Node,
  currentSourceFile: SourceFile
): Array<{ name: string; file?: string | null }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; file?: string | null }> = [];

  for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
    const symbol = id.getSymbol();
    if (!symbol) continue;

    const decls = symbol.getDeclarations();
    if (!decls.length) continue;

    const name = symbol.getName();
    const declFile = decls[0].getSourceFile();
    const file = rel(declFile.getFilePath());

    const key = `${name}@@${file}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (declFile === currentSourceFile || !declFile.isFromExternalLibrary()) {
      out.push({ name, file });
    }
  }

  return out;
}

function main() {
  resetOutput();

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });

  const sourceFiles = project
    .getSourceFiles()
    .filter(
      (sf) =>
        !sf.isDeclarationFile() &&
        !sf.isFromExternalLibrary() &&
        !sf.getFilePath().includes('/node_modules/') &&
        !sf.getFilePath().includes('/dist/') &&
        !sf.getFilePath().includes('/build/')
    );

  const symbolByFileAndName = new Map<string, string>();

  const symbolRows: SymbolRow[] = [];
  const fileRows: FileRow[] = [];
  const fileDepRows: FileDepRow[] = [];
  const symbolDepRows: SymbolDepRow[] = [];
  const reactRows: ReactRow[] = [];

  for (const sf of sourceFiles) {
    const file = rel(sf.getFilePath());
    const hasJsx = hasJsxDescendants(sf);
    const topLevelSideEffects = fileHasTopLevelSideEffects(sf);
    const exports = [...sf.getExportedDeclarations().keys()];
    const { bytes, loc, nonEmptyLoc } = getFileTextStats(sf);

    const imports: FileImportRow[] = sf.getImportDeclarations().map((d) => {
      const module = d.getModuleSpecifierValue();
      return {
        module,
        defaultImport: d.getDefaultImport()?.getText(),
        namespaceImport: d.getNamespaceImport()?.getText(),
        namedImports: d.getNamedImports().map((n) => n.getName()),
        typeOnly: d.isTypeOnly(),
        kindTags: tagImport(module, file),
        resolvedFile: resolvedImportFile(sf, module),
      };
    });

    const importKindTags = uniq(imports.flatMap((i) => i.kindTags));
    const runtimeTags = inferRuntimeTagsFromFile(file, hasJsx, imports);
    const lowerFile = file.toLowerCase();
    const isTestFile = runtimeTags.includes('test');
    const isWorkerFile = runtimeTags.includes('worker');
    const isNetlifyFile = runtimeTags.includes('netlify');
    const isGeneratedLike =
      lowerFile.includes('/generated/') ||
      lowerFile.includes('.generated.') ||
      lowerFile.includes('/i18n/static/');

    const symbolIdsForFile: string[] = [];

    for (const stmt of sf.getStatements()) {
      const rowsFromStatement: SymbolRow[] = [];

      const baseRow = (node: Node, kind: string, name: string | null): SymbolRow => {
        const flags = getExportFlags(node);
        const id = getNodeId(sf, name, node);
        const initialRow = {
          hasJsx: hasJsxDescendants(node),
          isReactComponent: isReactComponentName(name) && hasJsxDescendants(node),
          isCustomHook: isCustomHookName(name),
          isHandlerLike: isHandlerLikeName(name),
        };
        const row: SymbolRow = {
          id,
          file,
          kind,
          name,
          exported: flags.exported,
          defaultExport: flags.defaultExport,
          isNamedExport: flags.exported && !flags.defaultExport,
          isTypeOnly: kind === 'type' || kind === 'interface',
          isAsync: typeof (node as any).isAsync === 'function' ? (node as any).isAsync() : false,
          isGenerator:
            typeof (node as any).isGenerator === 'function' ? (node as any).isGenerator() : false,
          isReactComponent: initialRow.isReactComponent,
          isCustomHook: initialRow.isCustomHook,
          isContext: isContextName(name),
          isProvider: isProviderName(name),
          isHandlerLike: initialRow.isHandlerLike,
          hasJsx: initialRow.hasJsx,
          topLevel: node.getParent() === sf,
          startLine: node.getStartLineNumber(),
          endLine: node.getEndLineNumber(),
          loc: getNodeLoc(node),
          runtimeTags: inferRuntimeTagsFromSymbol(runtimeTags, initialRow),
          sourceText: safeText(node.getText()),
          leadingComments: getLeadingComments(node),
        };

        const refs = getReferencedProjectSymbols(node, sf);
        row.referencedSymbols = refs.map((r) => (r.file ? `${r.name}@@${r.file}` : r.name));
        row.importsUsed = uniq(
          refs
            .map((r) => r.file)
            .filter(Boolean)
            .filter((f) => f !== file) as string[]
        );

        symbolRows.push(row);
        symbolIdsForFile.push(id);
        if (name) {
          symbolByFileAndName.set(`${file}@@${name}`, id);
        }

        rowsFromStatement.push(row);
        return row;
      };

      if (Node.isFunctionDeclaration(stmt)) {
        const row = baseRow(stmt, 'function', stmt.getName() ?? null);
        row.returnType = getReturnTypeTextSafe(stmt);
        row.params = stmt.getParameters().map((p) => ({
          name: p.getName(),
          type: p.getType().getText(p),
          optional: p.isOptional(),
        }));
      } else if (Node.isClassDeclaration(stmt)) {
        const row = baseRow(stmt, 'class', stmt.getName() ?? null);
        row.extends = stmt.getExtends() ? [stmt.getExtends()!.getText()] : [];
        row.implements = stmt.getImplements().map((i) => i.getText());
      } else if (Node.isInterfaceDeclaration(stmt)) {
        const row = baseRow(stmt, 'interface', stmt.getName());
        row.extends = stmt.getExtends().map((e) => e.getText());
      } else if (Node.isTypeAliasDeclaration(stmt)) {
        const row = baseRow(stmt, 'type', stmt.getName());
        row.typeText = stmt.getTypeNode()?.getText() ?? getTypeTextSafe(stmt);
      } else if (Node.isEnumDeclaration(stmt)) {
        baseRow(stmt, 'enum', stmt.getName());
      } else if (Node.isVariableStatement(stmt)) {
        for (const decl of stmt.getDeclarations()) {
          const init = decl.getInitializer();
          const name = decl.getName();
          const kind =
            init && Node.isArrowFunction(init)
              ? 'arrow-function-variable'
              : init && Node.isFunctionExpression(init)
                ? 'function-expression-variable'
                : 'variable';
          const row = baseRow(decl, kind, name);
          row.typeText = getTypeTextSafe(decl);

          if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
            row.returnType = getReturnTypeTextSafe(init);
            row.params = init.getParameters().map((p) => ({
              name: p.getName(),
              type: p.getType().getText(p),
              optional: p.isOptional(),
            }));
            row.isAsync =
              typeof (init as any).isAsync === 'function' ? (init as any).isAsync() : false;
            row.isReactComponent = isReactComponentName(name) && hasJsxDescendants(init);
            row.hasJsx = hasJsxDescendants(init);
            row.runtimeTags = inferRuntimeTagsFromSymbol(runtimeTags, {
              hasJsx: row.hasJsx,
              isReactComponent: row.isReactComponent,
              isCustomHook: row.isCustomHook,
              isHandlerLike: row.isHandlerLike,
            });
          }
        }
      } else if (Node.isExportDeclaration(stmt)) {
        baseRow(stmt, 're-export', null);
      } else if (Node.isExportAssignment(stmt)) {
        baseRow(stmt, 'export-assignment', 'default');
      }

      for (const row of rowsFromStatement) {
        reactRows.push(classifyReactish(row));
      }
    }

    for (const imp of imports) {
      fileDepRows.push({
        from: file,
        to: imp.resolvedFile ?? null,
        module: imp.module,
        isRelative: imp.module.startsWith('.'),
        resolvedFile: imp.resolvedFile ?? null,
        typeOnly: imp.typeOnly,
        kindTags: imp.kindTags,
      });
    }

    fileRows.push({
      file,
      ext: path.extname(file),
      bytes,
      loc,
      nonEmptyLoc,
      hasJsx,
      topLevelSideEffects,
      imports,
      exports,
      symbolIds: symbolIdsForFile,
      importKindTags,
      runtimeTags,
      isTestFile,
      isWorkerFile,
      isNetlifyFile,
      isGeneratedLike,
    });
  }

  for (const row of symbolRows) {
    for (const ref of row.referencedSymbols ?? []) {
      const [toName, toFile] = ref.split('@@');
      const toId = toFile ? (symbolByFileAndName.get(`${toFile}@@${toName}`) ?? null) : null;
      symbolDepRows.push({
        fromId: row.id,
        fromName: row.name,
        fromFile: row.file,
        toName,
        toFile: toFile ?? null,
        toId,
        refKind: 'identifier',
      });
    }
  }

  for (const row of symbolRows) {
    appendJsonl(path.join(OUT_DIR, 'symbols.jsonl'), row as Json);
  }
  for (const row of fileRows) {
    appendJsonl(path.join(OUT_DIR, 'files.jsonl'), row as Json);
  }
  for (const row of fileDepRows) {
    appendJsonl(path.join(OUT_DIR, 'file-deps.jsonl'), row as Json);
  }
  for (const row of symbolDepRows) {
    appendJsonl(path.join(OUT_DIR, 'symbol-deps.jsonl'), row as Json);
  }
  for (const row of reactRows) {
    appendJsonl(path.join(OUT_DIR, 'react-classification.jsonl'), row as Json);
  }

  const runtimeSummary = [
    {
      kind: 'file-runtime-tags',
      counts: Object.fromEntries(
        uniq(fileRows.flatMap((f) => f.runtimeTags)).map((tag) => [
          tag,
          fileRows.filter((f) => f.runtimeTags.includes(tag)).length,
        ])
      ),
    },
    {
      kind: 'import-kind-tags',
      counts: Object.fromEntries(
        uniq(fileRows.flatMap((f) => f.importKindTags)).map((tag) => [
          tag,
          fileRows.filter((f) => f.importKindTags.includes(tag)).length,
        ])
      ),
    },
  ];

  for (const row of runtimeSummary) {
    appendJsonl(path.join(OUT_DIR, 'runtime-summary.jsonl'), row as Json);
  }

  const summary = {
    files: fileRows.length,
    symbols: symbolRows.length,
    fileDeps: fileDepRows.length,
    symbolDeps: symbolDepRows.length,
    reactClassifications: reactRows.length,
    components: reactRows.filter((r) => r.classification === 'component').length,
    hooks: reactRows.filter((r) => r.classification === 'hook').length,
    providers: reactRows.filter((r) => r.classification === 'provider').length,
    contexts: reactRows.filter((r) => r.classification === 'context').length,
    handlers: reactRows.filter((r) => r.classification === 'handler').length,
    sideEffectFiles: fileRows.filter((f) => f.topLevelSideEffects).length,
    testFiles: fileRows.filter((f) => f.isTestFile).length,
    workerFiles: fileRows.filter((f) => f.isWorkerFile).length,
    netlifyFiles: fileRows.filter((f) => f.isNetlifyFile).length,
    generatedLikeFiles: fileRows.filter((f) => f.isGeneratedLike).length,
    totalBytes: fileRows.reduce((sum, f) => sum + f.bytes, 0),
    totalLoc: fileRows.reduce((sum, f) => sum + f.loc, 0),
    totalNonEmptyLoc: fileRows.reduce((sum, f) => sum + f.nonEmptyLoc, 0),
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
}

main();
