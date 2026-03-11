import { Project, SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

type ManifestRow = {
  source: string;
  action: 'move' | 'split' | 'delete' | 'review';
  target?: string | null;
  reason?: string;
  confidence?: string;
};

type CliOptions = {
  manifestPath: string;
  dryRun: boolean;
};

const ROOT = process.cwd();

function parseArgs(argv: string[]): CliOptions {
  let manifestPath = 'manifests/file-move-manifest.json';
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--manifest' && argv[i + 1]) {
      manifestPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
  }

  return { manifestPath, dryRun };
}

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function assertExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stripExtension(filePath: string): string {
  return filePath.replace(/\.[^.]+$/, '');
}

function toAlias(filePath: string): string | null {
  const rel = normalize(path.relative(ROOT, filePath));
  if (!rel.startsWith('src/')) return null;

  const noExt = stripExtension(rel);
  if (noExt.endsWith('/index')) {
    return `@/${noExt.slice('src/'.length, -'/index'.length)}`;
  }
  return `@/${noExt.slice('src/'.length)}`;
}

function toAliasCandidates(filePath: string): string[] {
  const rel = normalize(path.relative(ROOT, filePath));
  if (!rel.startsWith('src/')) return [];

  const noExt = stripExtension(rel);
  const candidates = new Set<string>();

  candidates.add(`@/${noExt.slice('src/'.length)}`);
  if (noExt.endsWith('/index')) {
    candidates.add(`@/${noExt.slice('src/'.length, -'/index'.length)}`);
  }

  return [...candidates];
}

function rewriteAliasPath(specifier: string, aliasMap: Map<string, string>): string {
  if (!specifier.startsWith('@/')) {
    return specifier;
  }

  for (const [oldAlias, newAlias] of aliasMap.entries()) {
    if (specifier === oldAlias) {
      return newAlias;
    }
    if (specifier.startsWith(`${oldAlias}/`)) {
      return `${newAlias}${specifier.slice(oldAlias.length)}`;
    }
  }

  return specifier;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const manifestAbs = path.resolve(ROOT, options.manifestPath);
  assertExists(manifestAbs);

  const manifest = JSON.parse(fs.readFileSync(manifestAbs, 'utf8')) as ManifestRow[];
  const moveRows = manifest.filter((row) => row.action === 'move' && row.target);

  if (moveRows.length === 0) {
    return;
  }

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
  });

  const aliasMap = new Map<string, string>();

  for (const row of moveRows) {
    const sourceAbs = path.resolve(ROOT, row.source);
    const targetAbs = path.resolve(ROOT, row.target!);

    assertExists(sourceAbs);
    ensureParentDir(targetAbs);

    const sourceAliases = toAliasCandidates(sourceAbs);
    const targetAlias = toAlias(targetAbs);

    if (targetAlias) {
      for (const sourceAlias of sourceAliases) {
        aliasMap.set(sourceAlias, targetAlias);
      }
    }

    if (options.dryRun) {
      continue;
    }

    const sourceFile = project.getSourceFile(sourceAbs);
    if (!sourceFile) {
      throw new Error(
        `ts-morph could not load source file: ${normalize(path.relative(ROOT, sourceAbs))}`
      );
    }

    sourceFile.move(targetAbs, { overwrite: false });
  }

  if (!options.dryRun) {
    const sourceFiles = project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      for (const importDecl of sourceFile.getImportDeclarations()) {
        const oldSpecifier = importDecl.getModuleSpecifierValue();
        const newSpecifier = rewriteAliasPath(oldSpecifier, aliasMap);
        if (newSpecifier !== oldSpecifier) {
          importDecl.setModuleSpecifier(newSpecifier);
        }
      }

      for (const exportDecl of sourceFile.getExportDeclarations()) {
        const moduleSpecifierValue = exportDecl.getModuleSpecifierValue();
        if (!moduleSpecifierValue) continue;
        const newSpecifier = rewriteAliasPath(moduleSpecifierValue, aliasMap);
        if (newSpecifier !== moduleSpecifierValue) {
          exportDecl.setModuleSpecifier(newSpecifier);
        }
      }
    }

    await project.save();
  } else {
  }
}

main().catch((error) => {
  process.exit(1);
});
