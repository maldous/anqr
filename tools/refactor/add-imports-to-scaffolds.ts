/**
 * add-imports-to-scaffolds.ts
 *
 * Analyzes each scaffolded file from a granular split manifest and auto-generates
 * the needed import statements based on symbol references.
 *
 * Usage:
 *   tsx tools/refactor/add-imports-to-scaffolds.ts \
 *     --manifest manifests/symbol-splits/useQRGenerator.granular.split.json \
 *     --source src/hooks/useQRGenerator.ts
 *
 * What it does:
 *   1. Reads the manifest to build a symbol → target-file map (internal symbols)
 *   2. Parses the original source file's import section to build a symbol → module map (external)
 *   3. For each scaffolded file:
 *      a. Scans for references to known symbols
 *      b. Skips symbols defined IN the file itself
 *      c. Generates internal imports (from other scaffold files) using relative paths
 *      d. Generates external imports (from @/modules/*, react, etc.)
 *      e. Prepends them after the header comment block
 */
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
interface Args {
  manifestPath: string;
  sourcePath: string;
  dryRun: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let manifestPath = '';
  let sourcePath = '';
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--manifest' && argv[i + 1]) {
      manifestPath = argv[++i];
    } else if (argv[i] === '--source' && argv[i + 1]) {
      sourcePath = argv[++i];
    } else if (argv[i] === '--dry-run') {
      dryRun = true;
    }
  }
  if (!manifestPath || !sourcePath) {
    process.exit(1);
  }
  return { manifestPath, sourcePath, dryRun };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SplitManifest {
  sourceFile: string;
  groups: Array<{
    targetFile: string;
    symbols: string[];
    notes?: string;
  }>;
}

interface ExternalImport {
  module: string;
  isTypeOnly: boolean;
}

// ---------------------------------------------------------------------------
// Step 1: Build internal symbol → file map from manifest
// ---------------------------------------------------------------------------
function buildInternalSymbolMap(manifest: SplitManifest): Map<string, string> {
  const map = new Map<string, string>();
  for (const group of manifest.groups) {
    for (const symbol of group.symbols) {
      map.set(symbol, group.targetFile);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Step 2: Parse original source imports to build external symbol → module map
// ---------------------------------------------------------------------------
function buildExternalSymbolMap(sourceContent: string): Map<string, ExternalImport> {
  const map = new Map<string, ExternalImport>();
  const lines = sourceContent.split('\n');

  // Collect import blocks (may span multiple lines)
  let importBlock = '';
  let inImport = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Stop at first non-import, non-blank, non-comment line
    if (
      !inImport &&
      trimmed &&
      !trimmed.startsWith('import ') &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('/*') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('*/')
    ) {
      break;
    }

    if (trimmed.startsWith('import ')) {
      inImport = true;
      importBlock = line;
      if (line.includes(' from ')) {
        processImportLine(importBlock, map);
        inImport = false;
        importBlock = '';
      }
    } else if (inImport) {
      importBlock += ' ' + trimmed;
      if (line.includes(' from ')) {
        processImportLine(importBlock, map);
        inImport = false;
        importBlock = '';
      }
    }
  }

  return map;
}

function processImportLine(line: string, map: Map<string, ExternalImport>): void {
  const isTypeOnly = /^import\s+type\s/.test(line.trim());

  // Extract module path
  const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
  if (!moduleMatch) return;
  const modulePath = moduleMatch[1];

  // Extract named imports from { ... }
  const braceMatch = line.match(/\{([^}]+)\}/);
  if (!braceMatch) return;

  const symbols = braceMatch[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sym of symbols) {
    // Handle "type Foo" within a value import
    const typePrefix = sym.startsWith('type ');
    const cleanName = typePrefix ? sym.replace('type ', '').trim() : sym;
    // Handle "Foo as Bar" aliases
    const aliasMatch = cleanName.match(/^(\w+)\s+as\s+(\w+)$/);
    const importName = aliasMatch ? aliasMatch[1] : cleanName;
    const localName = aliasMatch ? aliasMatch[2] : cleanName;

    if (localName) {
      map.set(localName, {
        module: modulePath,
        isTypeOnly: isTypeOnly || typePrefix,
      });
    }
    // Also map the original import name if aliased
    if (aliasMatch && importName !== localName) {
      map.set(importName, {
        module: modulePath,
        isTypeOnly: isTypeOnly || typePrefix,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Step 3: For each scaffolded file, find references and generate imports
// ---------------------------------------------------------------------------
function findReferencedSymbols(
  fileContent: string,
  allKnownSymbols: Set<string>,
  fileOwnSymbols: Set<string>
): Set<string> {
  const referenced = new Set<string>();

  // Strip the header comment block before scanning
  let bodyContent = fileContent;
  const headerEnd = fileContent.indexOf('*/');
  if (headerEnd !== -1) {
    bodyContent = fileContent.slice(headerEnd + 2);
  }

  // Also strip any existing import lines
  bodyContent = bodyContent
    .split('\n')
    .filter((l) => !l.trim().startsWith('import '))
    .join('\n');

  for (const symbol of allKnownSymbols) {
    if (fileOwnSymbols.has(symbol)) continue; // Skip self-defined symbols

    // Use word boundary regex to find references.
    // Exclude matches preceded by '.' to avoid e.g. document.createElement matching 'createElement'
    const regex = new RegExp(`(?<!\\.)\\b${escapeRegex(symbol)}\\b`);
    if (regex.test(bodyContent)) {
      referenced.add(symbol);
    }
  }

  return referenced;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function computeRelativePath(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile);
  // Ensure it starts with ./ or ../
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  // Remove .ts extension
  rel = rel.replace(/\.tsx?$/, '');
  return rel;
}

interface ImportLine {
  module: string;
  symbols: string[];
  isTypeOnly: boolean;
  isRelative: boolean;
}

function generateImports(
  targetFile: string,
  referencedSymbols: Set<string>,
  internalMap: Map<string, string>,
  externalMap: Map<string, ExternalImport>
): string[] {
  // Group imports by module
  const importGroups = new Map<
    string,
    { symbols: string[]; isTypeOnly: boolean; isRelative: boolean }
  >();

  for (const symbol of referencedSymbols) {
    // Check internal first (other scaffold files)
    const internalFile = internalMap.get(symbol);
    if (internalFile && internalFile !== targetFile) {
      const relPath = computeRelativePath(targetFile, internalFile);
      const existing = importGroups.get(relPath);
      if (existing) {
        existing.symbols.push(symbol);
      } else {
        importGroups.set(relPath, { symbols: [symbol], isTypeOnly: false, isRelative: true });
      }
      continue;
    }

    // Check external
    const ext = externalMap.get(symbol);
    if (ext) {
      const key = `${ext.isTypeOnly ? 'type:' : ''}${ext.module}`;
      const existing = importGroups.get(key);
      if (existing) {
        existing.symbols.push(symbol);
      } else {
        importGroups.set(key, {
          symbols: [symbol],
          isTypeOnly: ext.isTypeOnly,
          isRelative: false,
        });
      }
    }
  }

  // Sort: external first, then internal
  const sorted = [...importGroups.entries()].sort((a, b) => {
    if (a[1].isRelative !== b[1].isRelative) return a[1].isRelative ? 1 : -1;
    return a[0].localeCompare(b[0]);
  });

  const lines: string[] = [];
  for (const [key, group] of sorted) {
    const modulePath = key.replace(/^type:/, '');
    const sortedSymbols = group.symbols.sort();
    const typeKeyword = group.isTypeOnly ? 'type ' : '';

    // Check if we need mixed type/value imports for this module
    // For external imports, some symbols might be type-only while others are value
    if (!group.isTypeOnly && !group.isRelative) {
      const typeSymbols: string[] = [];
      const valueSymbols: string[] = [];
      for (const sym of sortedSymbols) {
        const ext = externalMap.get(sym);
        if (ext?.isTypeOnly) {
          typeSymbols.push(sym);
        } else {
          valueSymbols.push(sym);
        }
      }
      if (typeSymbols.length > 0 && valueSymbols.length > 0) {
        // Mixed: use inline type annotations
        const parts = [...typeSymbols.map((s) => `type ${s}`), ...valueSymbols].sort();
        lines.push(`import { ${parts.join(', ')} } from '${modulePath}';`);
        continue;
      }
      if (typeSymbols.length > 0 && valueSymbols.length === 0) {
        lines.push(`import type { ${typeSymbols.join(', ')} } from '${modulePath}';`);
        continue;
      }
    }

    if (sortedSymbols.length <= 3) {
      lines.push(`import ${typeKeyword}{ ${sortedSymbols.join(', ')} } from '${modulePath}';`);
    } else {
      lines.push(`import ${typeKeyword}{`);
      for (const sym of sortedSymbols) {
        lines.push(`  ${sym},`);
      }
      lines.push(`} from '${modulePath}';`);
    }
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Step 4: Insert imports into file
// ---------------------------------------------------------------------------
function insertImports(fileContent: string, importLines: string[]): string {
  if (importLines.length === 0) return fileContent;

  const importBlock = importLines.join('\n') + '\n';

  // Find end of header comment block
  const lines = fileContent.split('\n');
  let insertAfter = 0;

  // Skip the /* ... */ header comment
  if (lines[0]?.trim().startsWith('/*')) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('*/')) {
        insertAfter = i + 1;
        // Skip blank line after comment
        if (insertAfter < lines.length && lines[insertAfter].trim() === '') {
          insertAfter++;
        }
        break;
      }
    }
  }

  // Insert imports after header comment
  const before = lines.slice(0, insertAfter).join('\n');
  const after = lines.slice(insertAfter).join('\n');

  return before + (before.endsWith('\n') ? '' : '\n') + importBlock + '\n' + after;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const args = parseArgs();

  // Load manifest
  const manifest: SplitManifest = JSON.parse(fs.readFileSync(args.manifestPath, 'utf8'));

  // Load source file
  const sourceContent = fs.readFileSync(args.sourcePath, 'utf8');

  // Build maps
  const internalMap = buildInternalSymbolMap(manifest);
  const externalMap = buildExternalSymbolMap(sourceContent);

  const allKnownSymbols = new Set([...internalMap.keys(), ...externalMap.keys()]);

  let filesProcessed = 0;
  let filesWithImports = 0;
  let totalImportLines = 0;

  for (const group of manifest.groups) {
    const targetPath = group.targetFile;
    if (!fs.existsSync(targetPath)) {
      continue;
    }

    const content = fs.readFileSync(targetPath, 'utf8');

    // Skip files that already have imports
    if (content.includes('\nimport ')) {
      filesProcessed++;
      continue;
    }

    // Build set of symbols defined in this file
    const fileOwnSymbols = new Set(group.symbols);

    // Find referenced symbols
    const referenced = findReferencedSymbols(content, allKnownSymbols, fileOwnSymbols);

    if (referenced.size === 0) {
      filesProcessed++;
      continue;
    }

    // Generate import lines
    const importLines = generateImports(targetPath, referenced, internalMap, externalMap);

    if (importLines.length === 0) {
      filesProcessed++;
      continue;
    }

    // Insert imports
    const newContent = insertImports(content, importLines);

    if (args.dryRun) {
      for (const line of importLines) {
      }
    } else {
      fs.writeFileSync(targetPath, newContent);
    }

    filesProcessed++;
    filesWithImports++;
    totalImportLines += importLines.length;
  }

  if (args.dryRun) {
  }
}

main().catch((err) => {
  process.exit(1);
});
