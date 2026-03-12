/**
 * decompose-all-internals.ts
 *
 * Decomposes every *._internal.ts / *._internal.tsx file under src/ into
 * individual 1-export-per-file modules, then rewrites the _internal file
 * as a barrel that re-exports from all the new files.
 *
 * Usage:
 *   npx tsx tools/refactor/decompose-all-internals.ts [--dry-run] [--file <path>]
 *
 *   --dry-run   Print what would be done without writing any files.
 *   --file <p>  Only process one specific _internal file (for testing).
 */

import { Project, Node, type SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
interface CliOptions {
  dryRun: boolean;
  singleFile: string | null;
}

function parseArgs(): CliOptions {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let singleFile: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') {
      dryRun = true;
    } else if (argv[i] === '--file' && i + 1 < argv.length) {
      singleFile = argv[++i];
    }
  }
  return { dryRun, singleFile };
}

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

/** Convert a symbol name to kebab-case, stripping leading underscores. */
function toKebab(name: string): string {
  // Strip leading underscores
  let cleaned = name.replace(/^_+/, '');
  if (cleaned.length === 0) cleaned = name; // all underscores — keep as-is

  return (
    cleaned
      // Insert hyphen between lowercase/digit and uppercase: "computeSafety" → "compute-Safety"
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Insert hyphen between consecutive uppercase and uppercase+lowercase: "HTMLParser" → "HTML-Parser"
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      // Replace underscores with hyphens
      .replace(/_/g, '-')
      .toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Declaration info
// ---------------------------------------------------------------------------
type DeclKind = 'type' | 'interface' | 'function' | 'class' | 'const' | 'let' | 'enum' | 'default';

interface ExportedDecl {
  kind: DeclKind;
  name: string;
  fullText: string; // including leading trivia (comments / JSDoc)
  text: string; // just the declaration text (no leading trivia)
  isDefault: boolean;
  isTypeOnly: boolean; // true for type aliases and interfaces
}

// ---------------------------------------------------------------------------
// Collect exported declarations from a ts-morph SourceFile
// ---------------------------------------------------------------------------
function collectExports(sf: SourceFile): ExportedDecl[] {
  const decls: ExportedDecl[] = [];

  for (const stmt of sf.getStatements()) {
    // --- type alias ---
    if (Node.isTypeAliasDeclaration(stmt) && stmt.isExported()) {
      decls.push({
        kind: 'type',
        name: stmt.getName(),
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: true,
      });
      continue;
    }

    // --- interface ---
    if (Node.isInterfaceDeclaration(stmt) && stmt.isExported()) {
      decls.push({
        kind: 'interface',
        name: stmt.getName(),
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: true,
      });
      continue;
    }

    // --- function ---
    if (Node.isFunctionDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName() || 'default';
      decls.push({
        kind: 'function',
        name,
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- class ---
    if (Node.isClassDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName() || 'default';
      decls.push({
        kind: 'class',
        name,
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- enum ---
    if (Node.isEnumDeclaration(stmt) && stmt.isExported()) {
      decls.push({
        kind: 'enum',
        name: stmt.getName(),
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- variable statement (const / let) ---
    if (Node.isVariableStatement(stmt) && stmt.isExported()) {
      const declarations = stmt.getDeclarations();
      if (declarations.length === 1) {
        const d = declarations[0];
        const varKind = stmt.getDeclarationKind() === 'let' ? 'let' : 'const';
        decls.push({
          kind: varKind as DeclKind,
          name: d.getName(),
          fullText: stmt.getFullText(),
          text: stmt.getText(),
          isDefault: stmt.isDefaultExport(),
          isTypeOnly: false,
        });
      } else {
        // Multi-declaration: export const a = 1, b = 2;
        const declKind = stmt.getDeclarationKind(); // const | let | var
        for (const d of declarations) {
          const name = d.getName();
          const initText = d.getText(); // "a = 1"
          const fullText = `export ${declKind} ${initText};`;
          decls.push({
            kind: declKind === 'let' ? 'let' : 'const',
            name,
            fullText: '\n' + fullText,
            text: fullText,
            isDefault: false,
            isTypeOnly: false,
          });
        }
      }
      continue;
    }

    // --- export default <expression> ---
    if (Node.isExportAssignment(stmt) && !stmt.isExportEquals()) {
      decls.push({
        kind: 'default',
        name: 'default',
        fullText: stmt.getFullText(),
        text: stmt.getText(),
        isDefault: true,
        isTypeOnly: false,
      });
      continue;
    }
  }

  return decls;
}

// ---------------------------------------------------------------------------
// Extract all word-boundary identifiers from text
// ---------------------------------------------------------------------------
function extractIdentifiers(text: string): Set<string> {
  const ids = new Set<string>();
  const regex = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Import helpers
// ---------------------------------------------------------------------------

interface ParsedImport {
  fullText: string;
  isTypeOnly: boolean; // import type { ... }
  moduleSpecifier: string;
  // Named imports: { localName, importedName, isTypeQualified }
  namedImports: { localName: string; importedName: string; isTypeQualified: boolean }[];
  // Default import name (if any)
  defaultImportName: string | null;
  // Namespace import name (if any)
  namespaceImportName: string | null;
  // Side-effect only (no bindings)
  isSideEffect: boolean;
}

function parseImportDeclarations(sf: SourceFile): ParsedImport[] {
  const imports: ParsedImport[] = [];
  for (const imp of sf.getImportDeclarations()) {
    const fullText = imp.getText().trim();
    const isTypeOnly = imp.isTypeOnly();
    const moduleSpecifier = imp.getModuleSpecifierValue();

    const namedImports: ParsedImport['namedImports'] = [];
    for (const named of imp.getNamedImports()) {
      namedImports.push({
        localName: named.getAliasNode()?.getText() ?? named.getName(),
        importedName: named.getName(),
        isTypeQualified: named.isTypeOnly(),
      });
    }

    const defaultImport = imp.getDefaultImport();
    const namespaceImport = imp.getNamespaceImport();

    imports.push({
      fullText,
      isTypeOnly,
      moduleSpecifier,
      namedImports,
      defaultImportName: defaultImport?.getText() ?? null,
      namespaceImportName: namespaceImport?.getText() ?? null,
      isSideEffect: !defaultImport && !namespaceImport && namedImports.length === 0,
    });
  }
  return imports;
}

/**
 * Given the parsed imports from the original file and the set of identifiers
 * used in a declaration, produce the import lines needed for the extracted file.
 */
function filterImportsForDecl(
  parsedImports: ParsedImport[],
  usedIds: Set<string>,
): string[] {
  const lines: string[] = [];

  for (const imp of parsedImports) {
    // Side-effect imports — skip (each extracted file shouldn't duplicate side effects)
    if (imp.isSideEffect) continue;

    // Namespace import: import * as Foo from '...'
    if (imp.namespaceImportName) {
      if (usedIds.has(imp.namespaceImportName)) {
        lines.push(imp.fullText);
      }
      continue;
    }

    // Collect which named imports are needed
    const keptNamed: { text: string; isTypeQualified: boolean }[] = [];
    for (const n of imp.namedImports) {
      if (usedIds.has(n.localName)) {
        const typePrefix = n.isTypeQualified ? 'type ' : '';
        const aliasText =
          n.localName !== n.importedName ? `${n.importedName} as ${n.localName}` : n.localName;
        keptNamed.push({ text: `${typePrefix}${aliasText}`, isTypeQualified: n.isTypeQualified });
      }
    }

    // Check if default import is needed
    const needDefault = imp.defaultImportName && usedIds.has(imp.defaultImportName);

    if (!needDefault && keptNamed.length === 0) continue;

    // Determine if the whole import should be `import type`
    const allKeptAreType =
      keptNamed.length > 0 &&
      keptNamed.every((k) => k.isTypeQualified || imp.isTypeOnly) &&
      (!needDefault || imp.isTypeOnly);

    const typeKw = imp.isTypeOnly || allKeptAreType ? 'type ' : '';

    // Build the import statement
    const parts: string[] = [];
    if (needDefault) {
      parts.push(imp.defaultImportName!);
    }
    if (keptNamed.length > 0) {
      // If the whole import is `import type`, strip individual `type` qualifiers
      const namedTexts = keptNamed.map((k) => {
        if ((imp.isTypeOnly || allKeptAreType) && k.isTypeQualified) {
          return k.text.replace(/^type\s+/, '');
        }
        return k.text;
      });
      if (namedTexts.length <= 3) {
        parts.push(`{ ${namedTexts.join(', ')} }`);
      } else {
        parts.push(`{\n  ${namedTexts.join(',\n  ')},\n}`);
      }
    }

    lines.push(`import ${typeKw}${parts.join(', ')} from '${imp.moduleSpecifier}';`);
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Collect re-export statements already present in the _internal file
// ---------------------------------------------------------------------------
function collectReExports(sf: SourceFile): string[] {
  const reExports: string[] = [];
  for (const stmt of sf.getStatements()) {
    if (Node.isExportDeclaration(stmt)) {
      if (stmt.getModuleSpecifier()) {
        reExports.push(stmt.getFullText().trim());
      }
    }
  }
  return reExports;
}

// ---------------------------------------------------------------------------
// Determine the file extension for extracted files
// ---------------------------------------------------------------------------
function extractedExt(internalFilePath: string): '.ts' | '.tsx' {
  return internalFilePath.endsWith('.tsx') ? '.tsx' : '.ts';
}

// ---------------------------------------------------------------------------
// Build a collision-free file path. If the path exists, append -2, -3, etc.
// ---------------------------------------------------------------------------
function collisionFreeFileName(
  dir: string,
  baseName: string,
  ext: string,
  existingNames: Set<string>,
): string {
  let candidate = `${baseName}${ext}`;
  if (!existingNames.has(candidate) && !fs.existsSync(path.join(dir, candidate))) {
    return candidate;
  }
  let i = 2;
  while (true) {
    candidate = `${baseName}-${i}${ext}`;
    if (!existingNames.has(candidate) && !fs.existsSync(path.join(dir, candidate))) {
      return candidate;
    }
    i++;
  }
}

// ---------------------------------------------------------------------------
// Strip the file extension for import paths
// ---------------------------------------------------------------------------
function stripExt(fileName: string): string {
  return fileName.replace(/\.(ts|tsx)$/, '');
}

// ---------------------------------------------------------------------------
// Count non-blank lines
// ---------------------------------------------------------------------------
function countLines(text: string): number {
  return text.split('\n').length;
}

// ---------------------------------------------------------------------------
// Process a single _internal file
// ---------------------------------------------------------------------------
interface ProcessResult {
  filesCreated: number;
  exportCount: number;
}

function processInternalFile(
  filePath: string,
  project: Project,
  dryRun: boolean,
): ProcessResult {
  const ROOT = process.cwd();
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const dir = path.dirname(filePath);
  const ext = extractedExt(filePath);

  // Derive the base name for the _internal file (for default export naming)
  // e.g. "render-modes._internal.ts" → "render-modes"
  const internalBasename = path.basename(filePath).replace(/\._internal\.(ts|tsx)$/, '');

  // Read source and parse
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  const tempFileName = `temp${ext === '.tsx' ? '.tsx' : '.ts'}`;
  const sf = project.createSourceFile(tempFileName, sourceCode, { overwrite: true });

  // Collect exports
  const decls = collectExports(sf);
  if (decls.length === 0) {
    
    return { filesCreated: 0, exportCount: 0 };
  }

  

  // Parse imports from the original file
  const parsedImports = parseImportDeclarations(sf);

  // Collect existing re-exports (export { x } from './y')
  const existingReExports = collectReExports(sf);

  // Build a map: symbolName → ExportedDecl
  const symbolMap = new Map<string, ExportedDecl>();
  for (const d of decls) {
    symbolMap.set(d.name, d);
  }

  // All top-level exported symbol names
  const allSymbolNames = new Set(decls.map((d) => d.name));

  // Build symbol → fileName map and allocate file names
  const symbolToFileName = new Map<string, string>();
  const usedFileNames = new Set<string>();

  for (const decl of decls) {
    let kebab: string;
    if (decl.isDefault && decl.name === 'default') {
      kebab = `${internalBasename}-default`;
    } else {
      kebab = toKebab(decl.name);
    }

    const fileName = collisionFreeFileName(dir, kebab, ext, usedFileNames);
    usedFileNames.add(fileName);
    symbolToFileName.set(decl.name, fileName);
  }

  // Write each declaration to its own file
  let filesCreated = 0;

  for (const decl of decls) {
    const fileName = symbolToFileName.get(decl.name)!;
    const targetPath = path.join(dir, fileName);
    const relTargetPath = path.relative(ROOT, targetPath).replace(/\\/g, '/');

    // If the file already exists (from a previous run), skip it
    if (fs.existsSync(targetPath)) {
      
      continue;
    }

    // Determine which identifiers this declaration references
    const declIds = extractIdentifiers(decl.fullText);

    // 1) External imports needed
    const externalImports = filterImportsForDecl(parsedImports, declIds);

    // 2) Sibling imports: references to other symbols from the same _internal file
    const siblingImportLines: string[] = [];
    const typeImportSymbols: { name: string; fileName: string }[] = [];
    const valueImportSymbols: { name: string; fileName: string }[] = [];

    for (const otherName of allSymbolNames) {
      if (otherName === decl.name) continue; // skip self
      // Check if this declaration references the other symbol (word boundary match)
      const regex = new RegExp(`\\b${escapeRegExp(otherName)}\\b`);
      if (regex.test(decl.fullText)) {
        const otherDecl = symbolMap.get(otherName);
        const otherFileName = symbolToFileName.get(otherName)!;
        if (otherDecl?.isTypeOnly) {
          typeImportSymbols.push({ name: otherName, fileName: otherFileName });
        } else {
          valueImportSymbols.push({ name: otherName, fileName: otherFileName });
        }
      }
    }

    // Group sibling imports by file
    const siblingByFile = new Map<string, { names: string[]; isType: boolean }>();
    for (const s of valueImportSymbols) {
      const existing = siblingByFile.get(s.fileName);
      if (existing) {
        existing.names.push(s.name);
      } else {
        siblingByFile.set(s.fileName, { names: [s.name], isType: false });
      }
    }
    for (const s of typeImportSymbols) {
      const existing = siblingByFile.get(s.fileName);
      if (existing) {
        existing.names.push(s.name);
        // Keep isType false if there's already a value import from the same file
      } else {
        siblingByFile.set(s.fileName, { names: [s.name], isType: true });
      }
    }

    for (const [sibFileName, { names, isType }] of siblingByFile) {
      const relImport = `./${stripExt(sibFileName)}`;
      const typeKw = isType ? 'type ' : '';
      if (names.length <= 3) {
        siblingImportLines.push(`import ${typeKw}{ ${names.join(', ')} } from '${relImport}';`);
      } else {
        siblingImportLines.push(
          `import ${typeKw}{\n  ${names.join(',\n  ')},\n} from '${relImport}';`,
        );
      }
    }

    // Build the file content
    const importSection = [...externalImports, ...siblingImportLines];
    const importText = importSection.length > 0 ? importSection.join('\n') + '\n\n' : '';

    // Clean up declaration text: trim leading blank lines but keep JSDoc/comments
    const declText = decl.fullText.replace(/^\n+/, '\n').trimStart();

    const fileContent = importText + declText + '\n';
    const lineCount = countLines(fileContent);

    if (dryRun) {
      
    } else {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(targetPath, fileContent, 'utf8');
      
    }
    filesCreated++;
  }

  // Rewrite the _internal file as a barrel
  const barrelLines: string[] = [];

  // Preserve existing re-exports
  for (const re of existingReExports) {
    barrelLines.push(re);
  }

  for (const decl of decls) {
    const fileName = symbolToFileName.get(decl.name)!;
    const relImport = `./${stripExt(fileName)}`;

    if (decl.isDefault && decl.name === 'default') {
      barrelLines.push(`export { default } from '${relImport}';`);
    } else if (decl.isTypeOnly) {
      barrelLines.push(`export type { ${decl.name} } from '${relImport}';`);
    } else {
      barrelLines.push(`export { ${decl.name} } from '${relImport}';`);
    }
  }

  const barrelContent = barrelLines.join('\n') + '\n';

  if (dryRun) {
    
  } else {
    fs.writeFileSync(filePath, barrelContent, 'utf8');
    
  }

  return { filesCreated, exportCount: decls.length };
}

// ---------------------------------------------------------------------------
// Escape special regex characters
// ---------------------------------------------------------------------------
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const options = parseArgs();
  const ROOT = process.cwd();

  
  

  // Create a standalone ts-morph project (no tsconfig needed for parsing)
  const project = new Project({
    useInMemoryFileSystem: false,
    compilerOptions: {
      jsx: 2, // React
      allowJs: true,
      esModuleInterop: true,
    },
  });

  // Discover _internal files
  let internalFiles: string[];

  if (options.singleFile) {
    const resolved = path.resolve(ROOT, options.singleFile);
    if (!fs.existsSync(resolved)) {
      
      process.exit(1);
    }
    internalFiles = [resolved];
  } else {
    const tsFiles = glob.sync('src/**/*._internal.ts', { cwd: ROOT, absolute: true });
    const tsxFiles = glob.sync('src/**/*._internal.tsx', { cwd: ROOT, absolute: true });
    internalFiles = [...tsFiles, ...tsxFiles].sort();
  }

  

  let totalFilesCreated = 0;
  let totalInternalsProcessed = 0;

  for (const filePath of internalFiles) {
    const result = processInternalFile(filePath, project, options.dryRun);
    if (result.exportCount > 0) {
      totalFilesCreated += result.filesCreated;
      totalInternalsProcessed++;
    }
    
  }

  
  
  if (options.dryRun) {
    
  }
}

main().catch((err) => {
  
  process.exit(1);
});
