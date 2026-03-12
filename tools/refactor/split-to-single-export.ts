/**
 * split-to-single-export.ts
 *
 * Scans all .ts/.tsx files under src/ and splits any file with >1 top-level
 * exported declaration into individual single-export files, replacing the
 * original with a barrel re-export.
 *
 * Usage:
 *   npx tsx tools/refactor/split-to-single-export.ts [--dry-run]
 */
import { Project, Node, SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
interface CliOptions {
  dryRun: boolean;
}

function parseArgs(): CliOptions {
  const argv = process.argv.slice(2);
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
  }
  return { dryRun };
}

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------
function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')   // camelCase boundary
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // consecutive caps
    .replace(/_/g, '-')                          // underscores
    .toLowerCase();
}

function stripExtension(filePath: string): string {
  return filePath.replace(/\.[^.]+$/, '');
}

// ---------------------------------------------------------------------------
// Exemption logic
// ---------------------------------------------------------------------------
const EXEMPT_DIR_SEGMENTS = ['i18n/static', 'i18n/locales', 'content/generated', 'content/gallery'];

function isExempt(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  const basename = path.basename(normalized);

  // index files
  if (basename === 'index.ts' || basename === 'index.tsx') return true;

  // *.types.ts / types.ts
  if (basename === 'types.ts' || basename === 'types.tsx') return true;
  if (basename.endsWith('.types.ts') || basename.endsWith('.types.tsx')) return true;

  // api files
  if (basename === 'api.ts' || basename === 'api.tsx') return true;

  // Exempt directories
  for (const seg of EXEMPT_DIR_SEGMENTS) {
    if (normalized.includes(`/${seg}/`) || normalized.includes(`/${seg}`)) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Declaration types
// ---------------------------------------------------------------------------
type DeclKind = 'type' | 'interface' | 'function' | 'class' | 'const' | 'let' | 'enum' | 'default';

interface ExportedDecl {
  kind: DeclKind;
  name: string;
  fullText: string;        // including leading trivia / JSDoc
  referencedNames: Set<string>;
  isDefault: boolean;
  isTypeOnly: boolean;     // type alias or interface
}

// ---------------------------------------------------------------------------
// Extract identifiers referenced in a block of text
// ---------------------------------------------------------------------------
function extractIdentifiers(text: string): Set<string> {
  const ids = new Set<string>();
  // Match word-boundary identifiers (at least 2 chars to reduce noise)
  const regex = /\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Check if text contains JSX (very simple heuristic)
// ---------------------------------------------------------------------------
function containsJsx(text: string): boolean {
  // Look for JSX-like patterns: <Component, <div, <>
  return /<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(text) || /<>/.test(text);
}

// ---------------------------------------------------------------------------
// Collect non-exported statements (module-scoped helpers)
// ---------------------------------------------------------------------------
function collectNonExportedStatements(sf: SourceFile): { name: string; fullText: string; definedNames: Set<string>; referencedNames: Set<string> }[] {
  const stmts: { name: string; fullText: string; definedNames: Set<string>; referencedNames: Set<string> }[] = [];
  for (const stmt of sf.getStatements()) {
    // Skip imports
    if (Node.isImportDeclaration(stmt)) continue;
    // Skip export declarations (already handled by collectExports)
    if (Node.isExportDeclaration(stmt)) continue;
    if (Node.isExportAssignment(stmt)) continue;
    // Skip if the statement is exported
    if ('isExported' in stmt && typeof stmt.isExported === 'function' && stmt.isExported()) continue;

    const fullText = stmt.getFullText();
    const definedNames = new Set<string>();
    const referencedNames = extractIdentifiers(fullText);

    // Try to get the defined name(s)
    if (Node.isVariableStatement(stmt)) {
      for (const d of stmt.getDeclarations()) {
        definedNames.add(d.getName());
      }
    } else if (Node.isFunctionDeclaration(stmt)) {
      const name = stmt.getName();
      if (name) definedNames.add(name);
    } else if (Node.isClassDeclaration(stmt)) {
      const name = stmt.getName();
      if (name) definedNames.add(name);
    } else if (Node.isTypeAliasDeclaration(stmt)) {
      definedNames.add(stmt.getName());
    } else if (Node.isInterfaceDeclaration(stmt)) {
      definedNames.add(stmt.getName());
    } else if (Node.isEnumDeclaration(stmt)) {
      definedNames.add(stmt.getName());
    }

    stmts.push({ name: [...definedNames][0] || '_unnamed_' + stmts.length, fullText, definedNames, referencedNames });
  }
  return stmts;
}

// ---------------------------------------------------------------------------
// Make a non-exported statement exportable by prepending `export`
// ---------------------------------------------------------------------------
function makeExportable(fullText: string): string {
  const trimmed = fullText.trimStart();
  // Already exported (shouldn't happen, but guard)
  if (trimmed.startsWith('export ')) return fullText;
  // const / let / var
  if (/^(const|let|var)\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // function
  if (/^(async\s+)?function\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // class
  if (/^(abstract\s+)?class\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // type alias
  if (/^type\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // interface
  if (/^interface\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // enum
  if (/^(const\s+)?enum\s/.test(trimmed)) return fullText.replace(trimmed, 'export ' + trimmed);
  // Fallback: leave as-is (side-effect statement)
  return fullText;
}

// ---------------------------------------------------------------------------
// Collect exported declarations from a source file
// ---------------------------------------------------------------------------
function collectExports(sf: SourceFile): ExportedDecl[] {
  const decls: ExportedDecl[] = [];

  for (const stmt of sf.getStatements()) {
    // --- export type ---
    if (Node.isTypeAliasDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName();
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'type',
        name,
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: true,
      });
      continue;
    }

    // --- export interface ---
    if (Node.isInterfaceDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName();
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'interface',
        name,
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: true,
      });
      continue;
    }

    // --- export function / export default function ---
    if (Node.isFunctionDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName() || 'default';
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'function',
        name,
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- export class / export default class ---
    if (Node.isClassDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName() || 'default';
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'class',
        name,
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- export enum ---
    if (Node.isEnumDeclaration(stmt) && stmt.isExported()) {
      const name = stmt.getName();
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'enum',
        name,
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: stmt.isDefaultExport(),
        isTypeOnly: false,
      });
      continue;
    }

    // --- export const / export let (VariableStatement) ---
    if (Node.isVariableStatement(stmt) && stmt.isExported()) {
      const declarations = stmt.getDeclarations();

      if (declarations.length === 1) {
        const d = declarations[0];
        const name = d.getName();
        const fullText = stmt.getFullText();
        const varKind = stmt.getDeclarationKind() === 'let' ? 'let' : 'const';
        decls.push({
          kind: varKind as DeclKind,
          name,
          fullText,
          referencedNames: extractIdentifiers(fullText),
          isDefault: stmt.isDefaultExport(),
          isTypeOnly: false,
        });
      } else {
        // Multi-declaration: export const a = 1, b = 2;
        // Split each into its own statement
        const isExportKeyword = stmt.hasExportKeyword();
        const declKind = stmt.getDeclarationKind(); // const | let | var
        for (const d of declarations) {
          const name = d.getName();
          const initText = d.getText(); // "a = 1"
          const exportPrefix = isExportKeyword ? 'export ' : '';
          const fullText = `${exportPrefix}${declKind} ${initText};`;
          decls.push({
            kind: declKind === 'let' ? 'let' : 'const',
            name,
            fullText: '\n' + fullText,
            referencedNames: extractIdentifiers(fullText),
            isDefault: false,
            isTypeOnly: false,
          });
        }
      }
      continue;
    }

    // --- export default <expression> ---
    if (Node.isExportAssignment(stmt) && !stmt.isExportEquals()) {
      const fullText = stmt.getFullText();
      decls.push({
        kind: 'default',
        name: 'default',
        fullText,
        referencedNames: extractIdentifiers(fullText),
        isDefault: true,
        isTypeOnly: false,
      });
      continue;
    }
  }

  return decls;
}

// ---------------------------------------------------------------------------
// Collect re-export statements: export { ... } from '...'
// ---------------------------------------------------------------------------
function collectReExports(sf: SourceFile): string[] {
  const reExports: string[] = [];
  for (const stmt of sf.getStatements()) {
    if (Node.isExportDeclaration(stmt)) {
      // export { x } from './y' or export * from './z'
      if (stmt.getModuleSpecifier()) {
        reExports.push(stmt.getFullText().trim());
      }
    }
  }
  return reExports;
}

// ---------------------------------------------------------------------------
// Filter imports to only those used in a given set of texts
// ---------------------------------------------------------------------------
function filterImports(
  originalImports: string[],
  usedIdentifiers: Set<string>,
): string[] {
  const result: string[] = [];

  for (const importLine of originalImports) {
    // For side-effect imports (import './foo' or import 'foo'), always include
    if (!importLine.includes('{') && !importLine.match(/import\s+\w/)) {
      // side-effect import — skip (don't duplicate)
      continue;
    }

    // Extract named imports from { ... }
    const braceMatch = importLine.match(/\{([^}]+)\}/);
    if (braceMatch) {
      const symbols = braceMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      const kept: string[] = [];
      for (const sym of symbols) {
        // Handle "type Foo", "Foo as Bar"
        const cleaned = sym.replace(/^type\s+/, '');
        const parts = cleaned.split(/\s+as\s+/);
        const localName = parts.length > 1 ? parts[1].trim() : parts[0].trim();
        if (usedIdentifiers.has(localName)) {
          kept.push(sym);
        }
      }
      if (kept.length > 0) {
        // Rebuild the import line with only kept symbols
        const moduleMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
        const isTypeImport = /^import\s+type\s/.test(importLine.trim());
        const typeKw = isTypeImport ? 'type ' : '';
        if (moduleMatch) {
          const mod = moduleMatch[1];
          if (kept.length <= 3) {
            result.push(`import ${typeKw}{ ${kept.join(', ')} } from '${mod}';`);
          } else {
            result.push(`import ${typeKw}{\n  ${kept.join(',\n  ')},\n} from '${mod}';`);
          }
        } else {
          result.push(importLine); // fallback
        }
      }
      continue;
    }

    // Default import: import Foo from '...'
    const defaultMatch = importLine.match(/import\s+(\w+)\s+from/);
    if (defaultMatch) {
      if (usedIdentifiers.has(defaultMatch[1])) {
        result.push(importLine);
      }
      continue;
    }

    // Namespace import: import * as Foo from '...'
    const nsMatch = importLine.match(/import\s+\*\s+as\s+(\w+)\s+from/);
    if (nsMatch) {
      if (usedIdentifiers.has(nsMatch[1])) {
        result.push(importLine);
      }
      continue;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Get original import texts from a source file
// ---------------------------------------------------------------------------
function getOriginalImportTexts(sf: SourceFile): string[] {
  const imports: string[] = [];
  for (const imp of sf.getImportDeclarations()) {
    imports.push(imp.getText().trim());
  }
  return imports;
}

// ---------------------------------------------------------------------------
// Compute relative path for imports (posix style, no extension)
// ---------------------------------------------------------------------------
function computeRelativePath(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  // Remove extension
  rel = rel.replace(/\.(ts|tsx)$/, '');
  return rel;
}

// ---------------------------------------------------------------------------
// Collision-safe filename
// ---------------------------------------------------------------------------
function safeFilePath(desired: string): string {
  if (!fs.existsSync(desired)) return desired;
  const dir = path.dirname(desired);
  const ext = path.extname(desired);
  const base = path.basename(desired, ext);
  let i = 2;
  while (fs.existsSync(path.join(dir, `${base}-${i}${ext}`))) {
    i++;
  }
  return path.join(dir, `${base}-${i}${ext}`);
}

// ---------------------------------------------------------------------------
// Generate the barrel file content
// ---------------------------------------------------------------------------
function generateBarrel(
  typeExports: { name: string; isDefault: boolean }[],
  otherExports: { name: string; fileName: string; isDefault: boolean }[],
  typesFileName: string | null,
  existingReExports: string[],
  originalDir: string,
): string {
  const lines: string[] = [];

  // Re-export types
  if (typesFileName && typeExports.length > 0) {
    const rel = './' + stripExtension(typesFileName);
    const typeNames = typeExports.map(t => t.name);
    if (typeNames.length <= 3) {
      lines.push(`export type { ${typeNames.join(', ')} } from '${rel}';`);
    } else {
      lines.push(`export type {`);
      for (const n of typeNames) {
        lines.push(`  ${n},`);
      }
      lines.push(`} from '${rel}';`);
    }
  }

  // Re-export each other symbol
  for (const exp of otherExports) {
    const rel = './' + stripExtension(exp.fileName);
    if (exp.isDefault) {
      lines.push(`export { default } from '${rel}';`);
    } else {
      lines.push(`export { ${exp.name} } from '${rel}';`);
    }
  }

  // Append original re-exports (export { x } from './y')
  if (existingReExports.length > 0) {
    lines.push('');
    for (const re of existingReExports) {
      lines.push(re);
    }
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const options = parseArgs();
  const ROOT = process.cwd();

  
  

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });

  const sourceFiles = project.getSourceFiles().filter(sf => {
    const filePath = sf.getFilePath().replace(/\\/g, '/');
    // Must be under src/
    if (!filePath.includes('/src/')) return false;
    // Must be .ts or .tsx
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return false;
    // Must not be exempt
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    if (isExempt(relPath)) return false;
    return true;
  });

  

  let filesProcessed = 0;
  let filesSkipped = 0;
  let filesCreated = 0;
  let filesModified = 0;
  const createdFiles: string[] = [];
  const modifiedFiles: string[] = [];

  for (const sf of sourceFiles) {
    const filePath = sf.getFilePath();
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);                  // .ts or .tsx
    const basename = path.basename(filePath, ext);        // e.g. "utils"

    // Collect all exported declarations
    const allDecls = collectExports(sf);

    if (allDecls.length <= 1) {
      filesSkipped++;
      continue;
    }

    const types = allDecls.filter(d => d.isTypeOnly);
    const others = allDecls.filter(d => !d.isTypeOnly);

    // Special case: if 1 non-type export + only type exports → don't fully split
    // Just extract types to .types.ts and keep original with 1 export
    if (others.length <= 1 && types.length > 0) {
      filesSkipped++;
      continue;
    }

    // If we only have types (all type/interface), skip (they'd all go to one types file)
    if (others.length === 0) {
      filesSkipped++;
      continue;
    }

    // Collect re-exports to preserve in barrel
    const existingReExports = collectReExports(sf);

    // Collect original imports
    const originalImports = getOriginalImportTexts(sf);

    // Build the list of all symbol names from this file
    const allSymbolNames = new Set(allDecls.map(d => d.name));

    // -----------------------------------------------------------------
    // Collect non-exported helper statements
    // -----------------------------------------------------------------
    const nonExportedStmts = collectNonExportedStatements(sf);

    // Determine which non-exported names are referenced by exported declarations
    const nonExportedNames = new Set<string>();
    for (const stmt of nonExportedStmts) {
      for (const name of stmt.definedNames) {
        nonExportedNames.add(name);
      }
    }

    // Compute transitive closure: if export references helper A, and helper A
    // references helper B, then both A and B must be in _internal.ts.
    const referencedNonExported = new Set<string>();

    // Seed: direct references from exported declarations
    for (const decl of allDecls) {
      for (const ref of decl.referencedNames) {
        if (nonExportedNames.has(ref)) {
          referencedNonExported.add(ref);
        }
      }
    }

    // Expand transitively: helpers that reference other helpers
    let changed = true;
    while (changed) {
      changed = false;
      for (const stmt of nonExportedStmts) {
        const isNeeded = [...stmt.definedNames].some(n => referencedNonExported.has(n));
        if (!isNeeded) continue;
        for (const ref of stmt.referencedNames) {
          if (nonExportedNames.has(ref) && !referencedNonExported.has(ref)) {
            referencedNonExported.add(ref);
            changed = true;
          }
        }
      }
    }

    // Filter to only the statements that define referenced names (or have no name but are needed)
    const neededStmts = nonExportedStmts.filter(s =>
      [...s.definedNames].some(n => referencedNonExported.has(n)) ||
      s.definedNames.size === 0 // Include unnamed statements (like standalone calls)
    );

    // Build symbol → target file map
    const symbolToFile = new Map<string, string>();
    let typesFilePath: string | null = null;
    let typesFileName: string | null = null;

    if (types.length > 0) {
      // Types files with JSX references need .tsx
      const typesHaveJsx = types.some(t => containsJsx(t.fullText));
      const typesExt = typesHaveJsx ? '.tsx' : '.ts';
      typesFileName = `${basename}.types${typesExt}`;
      typesFilePath = safeFilePath(path.join(dir, typesFileName));
      typesFileName = path.basename(typesFilePath);
      for (const t of types) {
        symbolToFile.set(t.name, typesFilePath);
      }
    }

    // _internal file for non-exported helpers
    let internalFilePath: string | null = null;
    let internalFileName: string | null = null;
    if (neededStmts.length > 0) {
      // Detect if any helper contains JSX — use .tsx extension if so
      const helpersHaveJsx = neededStmts.some(s => containsJsx(s.fullText));
      const internalExt = helpersHaveJsx ? '.tsx' : '.ts';
      internalFileName = `${basename}._internal${internalExt}`;
      internalFilePath = safeFilePath(path.join(dir, internalFileName));
      internalFileName = path.basename(internalFilePath);
      // Register all non-exported names in the symbolToFile map
      for (const stmt of neededStmts) {
        for (const name of stmt.definedNames) {
          symbolToFile.set(name, internalFilePath);
        }
      }
    }

    // Each non-type export → its own file
    interface OtherTarget {
      decl: ExportedDecl;
      filePath: string;
      fileName: string;
    }
    const otherTargets: OtherTarget[] = [];

    for (const decl of others) {
      const symbolKebab = decl.name === 'default' ? 'default-export' : toKebab(decl.name);
      // Decide extension: .tsx if the declaration contains JSX, or if the original
      // file is .tsx and the declaration references React/JSX patterns
      const declHasJsx = containsJsx(decl.fullText);
      const newExt = declHasJsx ? '.tsx' : '.ts';
      const desiredPath = safeFilePath(path.join(dir, `${symbolKebab}${newExt}`));
      const fileName = path.basename(desiredPath);
      symbolToFile.set(decl.name, desiredPath);
      otherTargets.push({ decl, filePath: desiredPath, fileName });
    }

    

    // -----------------------------------------------------------------------
    // Write _internal.ts file for non-exported helpers
    // -----------------------------------------------------------------------
    if (internalFilePath && neededStmts.length > 0) {
      // Gather all identifiers used in the helper statements
      const allHelperIds = new Set<string>();
      for (const stmt of neededStmts) {
        for (const id of stmt.referencedNames) allHelperIds.add(id);
      }

      // Filter original imports to those used by helpers
      const neededImports = filterImports(originalImports, allHelperIds);

      // Build content: imports + re-exported helpers
      const helperTexts = neededStmts.map(s => makeExportable(s.fullText).trim());
      const parts: string[] = [];
      if (neededImports.length > 0) parts.push(neededImports.join('\n'));
      const importSection = parts.length > 0 ? parts.join('\n') + '\n\n' : '';
      const content = importSection + helperTexts.join('\n\n') + '\n';

      const relInternalPath = path.relative(ROOT, internalFilePath).replace(/\\/g, '/');
      if (options.dryRun) {
        
      } else {
        fs.mkdirSync(path.dirname(internalFilePath), { recursive: true });
        fs.writeFileSync(internalFilePath, content, 'utf8');
        
      }
      createdFiles.push(relInternalPath);
      filesCreated++;
    }

    // -----------------------------------------------------------------------
    // Write types file
    // -----------------------------------------------------------------------
    if (typesFilePath && types.length > 0) {
      // Gather all identifiers used in types
      const allTypeIds = new Set<string>();
      for (const t of types) {
        for (const id of t.referencedNames) allTypeIds.add(id);
      }

      // Filter original imports to those used
      const neededImports = filterImports(originalImports, allTypeIds);

      // Cross-references: types might reference non-type symbols from the same file
      const crossRefImports = new Map<string, string[]>(); // targetFile → symbolNames
      for (const t of types) {
        for (const refName of t.referencedNames) {
          if (refName === t.name) continue;
          const targetFile = symbolToFile.get(refName);
          if (targetFile && targetFile !== typesFilePath) {
            const existing = crossRefImports.get(targetFile) || [];
            if (!existing.includes(refName)) existing.push(refName);
            crossRefImports.set(targetFile, existing);
          }
        }
      }

      const crossRefLines: string[] = [];
      for (const [targetFile, symbols] of crossRefImports) {
        const rel = computeRelativePath(typesFilePath, targetFile);
        crossRefLines.push(`import { ${symbols.join(', ')} } from '${rel}';`);
      }

      const typeTexts = types.map(t => t.fullText.trim());
      const parts: string[] = [];
      if (neededImports.length > 0) parts.push(neededImports.join('\n'));
      if (crossRefLines.length > 0) parts.push(crossRefLines.join('\n'));
      const importSection = parts.length > 0 ? parts.join('\n') + '\n\n' : '';
      const content = importSection + typeTexts.join('\n\n') + '\n';

      const relTypesPath = path.relative(ROOT, typesFilePath).replace(/\\/g, '/');
      if (options.dryRun) {
        
      } else {
        fs.mkdirSync(path.dirname(typesFilePath), { recursive: true });
        fs.writeFileSync(typesFilePath, content, 'utf8');
        
      }
      createdFiles.push(relTypesPath);
      filesCreated++;
    }

    // -----------------------------------------------------------------------
    // Write individual files for each non-type export
    // -----------------------------------------------------------------------
    for (const { decl, filePath: targetPath, fileName } of otherTargets) {
      // Gather identifiers used in this declaration
      const declIds = decl.referencedNames;

      // Filter original imports
      const neededImports = filterImports(originalImports, declIds);

      // Cross-references: this symbol may reference other symbols from the same file
      const crossRefImports = new Map<string, { symbols: string[]; isTypeOnly: boolean }>();
      for (const refName of declIds) {
        if (refName === decl.name) continue;
        const refTargetFile = symbolToFile.get(refName);
        if (refTargetFile && refTargetFile !== targetPath) {
          const isType = types.some(t => t.name === refName);
          const existing = crossRefImports.get(refTargetFile) || { symbols: [], isTypeOnly: isType };
          if (!existing.symbols.includes(refName)) existing.symbols.push(refName);
          // If any symbol is non-type, the import should be a value import
          if (!isType) existing.isTypeOnly = false;
          crossRefImports.set(refTargetFile, existing);
        }
      }

      // Cross-reference to _internal helpers
      if (internalFilePath) {
        const internalSymbols: string[] = [];
        for (const refName of declIds) {
          if (referencedNonExported.has(refName) && nonExportedNames.has(refName)) {
            if (!internalSymbols.includes(refName)) internalSymbols.push(refName);
          }
        }
        if (internalSymbols.length > 0) {
          const existing = crossRefImports.get(internalFilePath) || { symbols: [], isTypeOnly: false };
          for (const s of internalSymbols) {
            if (!existing.symbols.includes(s)) existing.symbols.push(s);
          }
          existing.isTypeOnly = false;
          crossRefImports.set(internalFilePath, existing);
        }
      }

      const crossRefLines: string[] = [];
      for (const [refTargetFile, { symbols, isTypeOnly }] of crossRefImports) {
        const rel = computeRelativePath(targetPath, refTargetFile);
        const typeKw = isTypeOnly ? 'type ' : '';
        crossRefLines.push(`import ${typeKw}{ ${symbols.join(', ')} } from '${rel}';`);
      }

      const declText = decl.fullText.trim();
      const parts: string[] = [];
      if (neededImports.length > 0) parts.push(neededImports.join('\n'));
      if (crossRefLines.length > 0) parts.push(crossRefLines.join('\n'));
      const importSection = parts.length > 0 ? parts.join('\n') + '\n\n' : '';
      const content = importSection + declText + '\n';

      const relTargetPath = path.relative(ROOT, targetPath).replace(/\\/g, '/');
      if (options.dryRun) {
        
      } else {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content, 'utf8');
        
      }
      createdFiles.push(relTargetPath);
      filesCreated++;
    }

    // -----------------------------------------------------------------------
    // Replace original file with barrel
    // -----------------------------------------------------------------------
    const typeExportsForBarrel = types.map(t => ({
      name: t.name,
      isDefault: t.isDefault,
    }));
    const otherExportsForBarrel = otherTargets.map(o => ({
      name: o.decl.name,
      fileName: o.fileName,
      isDefault: o.decl.isDefault,
    }));

    const barrelContent = generateBarrel(
      typeExportsForBarrel,
      otherExportsForBarrel,
      typesFileName,
      existingReExports,
      dir,
    );

    if (options.dryRun) {
      
      
      for (const line of barrelContent.split('\n').slice(0, 10)) {
        
      }
      if (barrelContent.split('\n').length > 10) {
        
      }
    } else {
      fs.writeFileSync(filePath, barrelContent, 'utf8');
      
    }
    modifiedFiles.push(relPath);
    filesModified++;
    filesProcessed++;
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  
  
  
  
  
  
  
  

  if (createdFiles.length > 0 && createdFiles.length <= 50) {
    
    for (const f of createdFiles) {
      
    }
  }
  if (modifiedFiles.length > 0 && modifiedFiles.length <= 50) {
    
    for (const f of modifiedFiles) {
      
    }
  }

  if (!options.dryRun) {
    
    
    
    
  }
}

main().catch((err) => {
  
  process.exit(1);
});
