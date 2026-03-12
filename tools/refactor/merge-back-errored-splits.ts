/**
 * merge-back-errored-splits.ts
 *
 * Reverses the single-export split for barrel files whose split files have
 * TypeScript errors. Non-exported internal helpers (module-scoped variables,
 * private functions) were lost when the originals became barrel re-exports.
 * This script detects which barrels have errored split files and merges them
 * back into a single combined file.
 *
 * Usage:
 *   npx tsx tools/refactor/merge-back-errored-splits.ts [--dry-run]
 */
import { execSync } from 'node:child_process';
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
// Step 1: Run tsc and collect error file paths
// ---------------------------------------------------------------------------
function collectErrorFiles(): Set<string> {
  const ROOT = process.cwd();

  let tscOutput = '';
  try {
    execSync('npx tsc --noEmit --pretty false', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024,
    });

    return new Set();
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    tscOutput = (execErr.stdout || '') + '\n' + (execErr.stderr || '');
  }

  const errorFiles = new Set<string>();
  // tsc error lines look like: src/path/to/file.ts(10,5): error TS2304: ...
  // or with pretty false: src/path/to/file.ts(10,5): error TS2304: ...
  const errorLineRegex = /^(.+?)\(\d+,\d+\):\s*error\s+TS\d+/gm;
  let match: RegExpExecArray | null;
  while ((match = errorLineRegex.exec(tscOutput)) !== null) {
    const filePath = match[1].trim();
    // Normalize to absolute path
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
    const normalized = absPath.replace(/\\/g, '/');
    errorFiles.add(normalized);
  }

  return errorFiles;
}

// ---------------------------------------------------------------------------
// Step 2: Identify barrel files
// ---------------------------------------------------------------------------

interface BarrelReExport {
  /** The exported name(s) */
  names: string[];
  /** The module specifier (e.g. './foo') */
  moduleSpecifier: string;
  /** Whether it's a type-only re-export */
  isTypeOnly: boolean;
  /** The raw line */
  rawLine: string;
}

/**
 * Check if a file is a barrel: contains ONLY re-export lines
 * (export { X } from './y' and/or export type { X } from './y')
 */
function parseBarrelFile(content: string): BarrelReExport[] | null {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return null;

  const reExports: BarrelReExport[] = [];

  // Patterns for single-line re-exports:
  //   export { A } from './a';
  //   export { A, B } from './a';
  //   export type { A, B } from './a.types';
  // Also handle multi-line re-exports:
  //   export type {
  //     A,
  //     B,
  //   } from './a.types';
  const fullText = content.trim();

  // Use a regex that captures multi-line re-exports too
  const reExportRegex = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"];?/g;
  let m: RegExpExecArray | null;
  const matchedRanges: Array<[number, number]> = [];

  while ((m = reExportRegex.exec(fullText)) !== null) {
    const isTypeOnly = !!m[1];
    const namesStr = m[2];
    const moduleSpecifier = m[3];
    const names = namesStr
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    reExports.push({
      names,
      moduleSpecifier,
      isTypeOnly,
      rawLine: m[0],
    });
    matchedRanges.push([m.index, m.index + m[0].length]);
  }

  if (reExports.length === 0) return null;

  // Check that the entire file content is covered by re-export matches
  // (allowing whitespace/newlines between them)
  let remaining = fullText;
  // Remove all matched re-exports and see if anything non-whitespace remains
  // Sort matches in reverse order to splice correctly
  const sorted = [...matchedRanges].sort((a, b) => b[0] - a[0]);
  for (const [start, end] of sorted) {
    remaining = remaining.slice(0, start) + remaining.slice(end);
  }

  if (remaining.trim().length > 0) {
    // File has content other than re-exports — not a pure barrel
    return null;
  }

  return reExports;
}

// ---------------------------------------------------------------------------
// Step 2b: Resolve re-export paths to actual files on disk
// ---------------------------------------------------------------------------
function resolveModuleSpecifier(barrelFilePath: string, moduleSpecifier: string): string | null {
  const barrelDir = path.dirname(barrelFilePath);
  const basePath = path.resolve(barrelDir, moduleSpecifier);

  // Try extensions in order
  const extensions = ['.ts', '.tsx'];
  for (const ext of extensions) {
    const candidate = basePath + ext;
    if (fs.existsSync(candidate)) return candidate;
  }

  // Already has extension?
  if (fs.existsSync(basePath)) return basePath;

  // Try index files
  for (const ext of extensions) {
    const candidate = path.join(basePath, `index${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Step 3: Parse split file content
// ---------------------------------------------------------------------------
interface ParsedSplitFile {
  /** Import statements */
  imports: ImportStatement[];
  /** Non-import content (the exported declarations and any other code) */
  body: string;
  /** Full file path */
  filePath: string;
}

interface ImportStatement {
  /** The full import text */
  raw: string;
  /** The module specifier */
  moduleSpecifier: string;
  /** Whether this is a type-only import */
  isTypeOnly: boolean;
  /** Whether this is a side-effect import (import 'foo') */
  isSideEffect: boolean;
  /** Whether this is a namespace import (import * as X from 'foo') */
  isNamespace: boolean;
  /** The namespace name if namespace import */
  namespaceName?: string;
  /** Whether this is a default import (import X from 'foo') */
  isDefault: boolean;
  /** The default import name */
  defaultName?: string;
  /** Named imports { A, B, type C } */
  namedImports: Array<{ name: string; alias?: string; isTypeOnly: boolean }>;
}

function parseImportStatement(line: string): ImportStatement | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('import ')) return null;

  // Extract module specifier
  const moduleMatch = trimmed.match(/from\s+['"]([^'"]+)['"]/);
  const sideEffectMatch = trimmed.match(/^import\s+['"]([^'"]+)['"]/);

  if (!moduleMatch && !sideEffectMatch) return null;

  const moduleSpecifier = moduleMatch?.[1] || sideEffectMatch?.[1] || '';

  // Side-effect import
  if (sideEffectMatch && !moduleMatch) {
    return {
      raw: trimmed,
      moduleSpecifier,
      isTypeOnly: false,
      isSideEffect: true,
      isNamespace: false,
      isDefault: false,
      namedImports: [],
    };
  }

  const isTopLevelTypeOnly = /^import\s+type\s/.test(trimmed);

  // Namespace import: import * as X from 'foo'
  const nsMatch = trimmed.match(/import\s+(?:type\s+)?\*\s+as\s+(\w+)\s+from/);
  if (nsMatch) {
    return {
      raw: trimmed,
      moduleSpecifier,
      isTypeOnly: isTopLevelTypeOnly,
      isSideEffect: false,
      isNamespace: true,
      namespaceName: nsMatch[1],
      isDefault: false,
      namedImports: [],
    };
  }

  // Default + named: import Foo, { bar } from 'baz'
  const defaultAndNamedMatch = trimmed.match(/import\s+(?:type\s+)?(\w+)\s*,\s*\{([^}]*)\}\s*from/);
  if (defaultAndNamedMatch) {
    const defaultName = defaultAndNamedMatch[1];
    const namedImports = parseNamedImports(defaultAndNamedMatch[2], isTopLevelTypeOnly);
    return {
      raw: trimmed,
      moduleSpecifier,
      isTypeOnly: isTopLevelTypeOnly,
      isSideEffect: false,
      isNamespace: false,
      isDefault: true,
      defaultName,
      namedImports,
    };
  }

  // Named only: import { A, B } from 'foo' or import type { A } from 'foo'
  const namedMatch = trimmed.match(/import\s+(?:type\s+)?\{([^}]*)\}\s*from/);
  if (namedMatch) {
    const namedImports = parseNamedImports(namedMatch[1], isTopLevelTypeOnly);
    return {
      raw: trimmed,
      moduleSpecifier,
      isTypeOnly: isTopLevelTypeOnly,
      isSideEffect: false,
      isNamespace: false,
      isDefault: false,
      namedImports,
    };
  }

  // Default only: import Foo from 'bar'
  const defaultMatch = trimmed.match(/import\s+(?:type\s+)?(\w+)\s+from/);
  if (defaultMatch) {
    return {
      raw: trimmed,
      moduleSpecifier,
      isTypeOnly: isTopLevelTypeOnly,
      isSideEffect: false,
      isNamespace: false,
      isDefault: true,
      defaultName: defaultMatch[1],
      namedImports: [],
    };
  }

  return null;
}

function parseNamedImports(
  raw: string,
  parentIsTypeOnly: boolean
): Array<{ name: string; alias?: string; isTypeOnly: boolean }> {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const isType = s.startsWith('type ');
      const cleaned = s.replace(/^type\s+/, '');
      const parts = cleaned.split(/\s+as\s+/);
      return {
        name: parts[0].trim(),
        alias: parts.length > 1 ? parts[1].trim() : undefined,
        isTypeOnly: isType || parentIsTypeOnly,
      };
    });
}

function parseSplitFile(filePath: string): ParsedSplitFile {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const imports: ImportStatement[] = [];
  const bodyLines: string[] = [];
  let inImportBlock = true;

  // Handle multi-line imports
  let pendingImport = '';

  for (const line of lines) {
    if (inImportBlock) {
      // Accumulate multi-line imports
      if (pendingImport) {
        pendingImport += '\n' + line;
        if (/from\s+['"]/.test(line)) {
          // End of multi-line import
          const parsed = parseImportStatement(pendingImport.replace(/\n/g, ' '));
          if (parsed) {
            parsed.raw = pendingImport;
            imports.push(parsed);
          }
          pendingImport = '';
        }
        continue;
      }

      const trimmed = line.trim();

      // Empty lines at the top
      if (trimmed === '') continue;

      // Check if this starts an import
      if (trimmed.startsWith('import ')) {
        // Check if it's complete (has 'from' and ends with ;)
        if ((trimmed.includes("from '") || trimmed.includes('from "')) && trimmed.endsWith(';')) {
          const parsed = parseImportStatement(trimmed);
          if (parsed) imports.push(parsed);
        } else if (trimmed.includes("from '") || trimmed.includes('from "')) {
          // Single line import without semicolon — still complete
          const parsed = parseImportStatement(trimmed);
          if (parsed) imports.push(parsed);
        } else {
          // Start of multi-line import
          pendingImport = line;
        }
        continue;
      }

      // Not an import line and we're past the import block
      inImportBlock = false;
      bodyLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  return {
    imports,
    body: bodyLines.join('\n').trim(),
    filePath,
  };
}

// ---------------------------------------------------------------------------
// Step 3b: Parse types file content
// ---------------------------------------------------------------------------
function parseTypesFile(filePath: string): ParsedSplitFile {
  return parseSplitFile(filePath);
}

// ---------------------------------------------------------------------------
// Step 4: Merge imports
// ---------------------------------------------------------------------------
function mergeImports(
  allImports: ImportStatement[],
  barrelDir: string,
  excludeSpecifiers: Set<string>
): string[] {
  // Filter out imports that reference the split files themselves (cross-references)
  const filtered = allImports.filter((imp) => {
    if (imp.isSideEffect) return true;
    // Resolve the module specifier relative to each file — but since all split
    // files are in the same directory as the barrel, we just check the specifier
    // against excluded specifiers (relative paths of split files)
    const spec = imp.moduleSpecifier;
    if (excludeSpecifiers.has(spec)) return false;
    // Also check without extension
    const withoutExt = spec.replace(/\.(ts|tsx)$/, '');
    if (excludeSpecifiers.has(withoutExt)) return false;
    return true;
  });

  // Group by module specifier
  // For namespace and side-effect imports, deduplicate exactly
  const sideEffects = new Set<string>();
  const namespaceImports = new Map<string, { name: string; isTypeOnly: boolean }>();
  const defaultImports = new Map<string, { name: string; isTypeOnly: boolean }>();

  // For named imports, group by (moduleSpecifier)
  const namedByModule = new Map<
    string,
    {
      names: Map<string, { name: string; alias?: string; isTypeOnly: boolean }>;
      hasTypeOnlyImport: boolean;
      hasValueImport: boolean;
    }
  >();

  for (const imp of filtered) {
    if (imp.isSideEffect) {
      sideEffects.add(imp.moduleSpecifier);
      continue;
    }

    if (imp.isNamespace && imp.namespaceName) {
      // Keep the first one; if there's a value import, prefer that
      const existing = namespaceImports.get(imp.moduleSpecifier);
      if (!existing || (!imp.isTypeOnly && existing.isTypeOnly)) {
        namespaceImports.set(imp.moduleSpecifier, {
          name: imp.namespaceName,
          isTypeOnly: imp.isTypeOnly,
        });
      }
      continue;
    }

    if (imp.isDefault && imp.defaultName) {
      const existing = defaultImports.get(imp.moduleSpecifier);
      if (!existing || (!imp.isTypeOnly && existing.isTypeOnly)) {
        defaultImports.set(imp.moduleSpecifier, {
          name: imp.defaultName,
          isTypeOnly: imp.isTypeOnly,
        });
      }
    }

    if (imp.namedImports.length > 0) {
      let entry = namedByModule.get(imp.moduleSpecifier);
      if (!entry) {
        entry = {
          names: new Map(),
          hasTypeOnlyImport: imp.isTypeOnly,
          hasValueImport: !imp.isTypeOnly,
        };
        namedByModule.set(imp.moduleSpecifier, entry);
      } else {
        if (imp.isTypeOnly) entry.hasTypeOnlyImport = true;
        else entry.hasValueImport = true;
      }

      for (const named of imp.namedImports) {
        const key = named.alias ? `${named.name} as ${named.alias}` : named.name;
        const existing = entry.names.get(key);
        if (!existing) {
          entry.names.set(key, named);
        } else if (!named.isTypeOnly && existing.isTypeOnly) {
          // Prefer value import over type import
          entry.names.set(key, { ...named, isTypeOnly: false });
        }
      }
    }
  }

  // Build output lines
  const outputLines: string[] = [];

  // Side-effect imports
  for (const spec of sideEffects) {
    outputLines.push(`import '${spec}';`);
  }

  // Namespace imports
  for (const [spec, { name, isTypeOnly }] of namespaceImports) {
    const typeKw = isTypeOnly ? 'type ' : '';
    outputLines.push(`import ${typeKw}* as ${name} from '${spec}';`);
  }

  // Default + named imports — combine if both exist for the same module
  const handledAsDefaultPlusNamed = new Set<string>();

  for (const [spec, { name, isTypeOnly: defTypeOnly }] of defaultImports) {
    const namedEntry = namedByModule.get(spec);
    if (namedEntry && namedEntry.names.size > 0) {
      // Combine default + named into one import
      handledAsDefaultPlusNamed.add(spec);

      // If default is type-only but named has value imports, we need separate imports
      // For simplicity, if there's any value import, make it a value import
      const allTypeOnly = defTypeOnly && !namedEntry.hasValueImport;
      const typeKw = allTypeOnly ? 'type ' : '';

      const namedParts = buildNamedImportParts(namedEntry.names, allTypeOnly);

      if (namedParts.length <= 3) {
        outputLines.push(`import ${typeKw}${name}, { ${namedParts.join(', ')} } from '${spec}';`);
      } else {
        outputLines.push(
          `import ${typeKw}${name}, {\n  ${namedParts.join(',\n  ')},\n} from '${spec}';`
        );
      }
    } else {
      // Default only
      const typeKw = defTypeOnly ? 'type ' : '';
      outputLines.push(`import ${typeKw}${name} from '${spec}';`);
    }
  }

  // Named-only imports (not already handled as default+named)
  for (const [spec, entry] of namedByModule) {
    if (handledAsDefaultPlusNamed.has(spec)) continue;
    if (entry.names.size === 0) continue;

    // Determine if the whole import should be `import type`
    const allNamesAreTypeOnly = [...entry.names.values()].every((n) => n.isTypeOnly);
    const useImportType = allNamesAreTypeOnly;

    const typeKw = useImportType ? 'type ' : '';
    const namedParts = buildNamedImportParts(entry.names, useImportType);

    if (namedParts.length <= 3) {
      outputLines.push(`import ${typeKw}{ ${namedParts.join(', ')} } from '${spec}';`);
    } else {
      outputLines.push(`import ${typeKw}{\n  ${namedParts.join(',\n  ')},\n} from '${spec}';`);
    }
  }

  return outputLines;
}

function buildNamedImportParts(
  names: Map<string, { name: string; alias?: string; isTypeOnly: boolean }>,
  parentIsTypeOnly: boolean
): string[] {
  const parts: string[] = [];
  for (const [, { name, alias, isTypeOnly }] of names) {
    // If the parent import is `import type`, individual `type` keywords are redundant
    const needsTypePrefix = isTypeOnly && !parentIsTypeOnly;
    const typePrefix = needsTypePrefix ? 'type ' : '';
    const aliasStr = alias ? ` as ${alias}` : '';
    parts.push(`${typePrefix}${name}${aliasStr}`);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Step 5: Rewrite relative imports in body text
// ---------------------------------------------------------------------------
/**
 * When merging split files back, some split files may import from sibling
 * split files using relative paths like './foo'. Since all split file contents
 * are being combined into the barrel file, we need to remove those cross-
 * references (the symbols will now be in the same file). This is handled
 * by the import merging step which excludes cross-references.
 */

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const options = parseArgs();
  const ROOT = process.cwd();

  // Step 1: Collect error files
  const errorFiles = collectErrorFiles();
  if (errorFiles.size === 0) {
    return;
  }

  // Step 2: Find all barrel files under src/
  const srcDir = path.join(ROOT, 'src');
  const allTsFiles = findAllTsFiles(srcDir);

  interface BarrelInfo {
    filePath: string;
    reExports: BarrelReExport[];
    resolvedSplitFiles: Map<string, string>; // moduleSpecifier → absolute path
    typesFile: string | null; // absolute path to companion .types.ts if any
  }

  const barrels: BarrelInfo[] = [];

  for (const filePath of allTsFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const reExports = parseBarrelFile(content);
    if (!reExports) continue;

    const resolvedSplitFiles = new Map<string, string>();
    let typesFile: string | null = null;

    for (const re of reExports) {
      const resolved = resolveModuleSpecifier(filePath, re.moduleSpecifier);
      if (resolved) {
        resolvedSplitFiles.set(re.moduleSpecifier, resolved.replace(/\\/g, '/'));

        // Check if this is a .types.ts companion
        if (re.isTypeOnly && resolved.endsWith('.types.ts')) {
          typesFile = resolved.replace(/\\/g, '/');
        }
      }
    }

    barrels.push({
      filePath: filePath.replace(/\\/g, '/'),
      reExports,
      resolvedSplitFiles,
      typesFile,
    });
  }

  // Step 2b: Determine which barrels need merging
  interface MergeCandidate {
    barrel: BarrelInfo;
    erroredSplitFiles: string[];
  }

  const mergeCandidates: MergeCandidate[] = [];

  for (const barrel of barrels) {
    const erroredSplitFiles: string[] = [];

    for (const [, absPath] of barrel.resolvedSplitFiles) {
      if (errorFiles.has(absPath)) {
        erroredSplitFiles.push(absPath);
      }
    }

    if (erroredSplitFiles.length > 0) {
      mergeCandidates.push({ barrel, erroredSplitFiles });
    }
  }

  if (mergeCandidates.length === 0) {
    return;
  }

  // Step 3: Merge back each candidate
  let filesDeleted = 0;
  let barrelsRewritten = 0;

  for (const { barrel, erroredSplitFiles } of mergeCandidates) {
    const relBarrelPath = path.relative(ROOT, barrel.filePath).replace(/\\/g, '/');
    const erroredRels = erroredSplitFiles.map((f) => path.relative(ROOT, f).replace(/\\/g, '/'));

    // Collect all the module specifiers that point to split files within the
    // same directory (these are the ones created by the split script)
    const splitFileSpecifiers = new Set<string>();
    const splitFilePaths: string[] = [];

    for (const [spec, absPath] of barrel.resolvedSplitFiles) {
      splitFileSpecifiers.add(spec);
      // Also add without leading './'
      const stripped = spec.replace(/^\.\//, '');
      splitFileSpecifiers.add(stripped);
      splitFilePaths.push(absPath);
    }

    // Parse all split files
    const parsedFiles: ParsedSplitFile[] = [];

    // First: types file (if any)
    if (barrel.typesFile && fs.existsSync(barrel.typesFile)) {
      parsedFiles.push(parseTypesFile(barrel.typesFile));
    }

    // Then: non-types split files in order
    for (const re of barrel.reExports) {
      if (re.isTypeOnly) continue; // already handled via typesFile
      const absPath = barrel.resolvedSplitFiles.get(re.moduleSpecifier);
      if (absPath && fs.existsSync(absPath)) {
        parsedFiles.push(parseSplitFile(absPath));
      }
    }

    // Collect and merge all imports
    const allImports: ImportStatement[] = [];
    for (const pf of parsedFiles) {
      allImports.push(...pf.imports);
    }

    // Build set of module specifiers to exclude (cross-references between split files)
    const excludeSpecifiers = new Set<string>();
    for (const [spec] of barrel.resolvedSplitFiles) {
      excludeSpecifiers.add(spec);
      // Also add the types companion specifier
      const typesSpec = spec.replace(/\.types$/, '.types');
      excludeSpecifiers.add(typesSpec);
    }
    // Also exclude specifiers that reference the barrel's own basename-based patterns
    const barrelBasename = path.basename(barrel.filePath, path.extname(barrel.filePath));
    // Companion .types file specifier
    excludeSpecifiers.add(`./${barrelBasename}.types`);

    const barrelDir = path.dirname(barrel.filePath);
    const mergedImports = mergeImports(allImports, barrelDir, excludeSpecifiers);

    // Collect all body content
    const bodies: string[] = [];
    for (const pf of parsedFiles) {
      if (pf.body.trim().length > 0) {
        bodies.push(pf.body);
      }
    }

    // Assemble the merged file
    const parts: string[] = [];
    if (mergedImports.length > 0) {
      parts.push(mergedImports.join('\n'));
    }
    if (bodies.length > 0) {
      parts.push(bodies.join('\n\n'));
    }
    const mergedContent = parts.join('\n\n') + '\n';

    // Files to delete: all split files + types companion
    const filesToDelete: string[] = [];
    for (const absPath of splitFilePaths) {
      // Don't delete the barrel itself
      if (absPath !== barrel.filePath) {
        filesToDelete.push(absPath);
      }
    }

    if (options.dryRun) {
      for (const f of filesToDelete) {
      }

      const previewLines = mergedContent.split('\n').slice(0, 20);
      for (const line of previewLines) {
      }
      if (mergedContent.split('\n').length > 20) {
      }
    } else {
      // Write the merged content to the barrel file
      fs.writeFileSync(barrel.filePath, mergedContent, 'utf8');

      // Delete split files
      for (const f of filesToDelete) {
        if (fs.existsSync(f)) {
          fs.unlinkSync(f);

          filesDeleted++;
        }
      }
    }

    barrelsRewritten++;
  }

  // Summary

  if (!options.dryRun) {
  }

  if (!options.dryRun) {
  }
}

// ---------------------------------------------------------------------------
// Utility: Recursively find all .ts/.tsx files
// ---------------------------------------------------------------------------
function findAllTsFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          results.push(fullPath.replace(/\\/g, '/'));
        }
      }
    }
  }

  walk(dir);
  return results;
}

main().catch((err) => {
  process.exit(1);
});
