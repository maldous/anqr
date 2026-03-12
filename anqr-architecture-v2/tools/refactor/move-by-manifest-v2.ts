import { Project } from 'ts-morph';
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
  shims: boolean;
};

type MoveRow = {
  source: string;
  target: string;
  sourceAbs: string;
  targetAbs: string;
};

type TripleSlashRef = {
  targetAbs: string;
  oldRelativePath: string;
  newRelativePath: string;
};

const ROOT = process.cwd();

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function parseArgs(argv: string[]): CliOptions {
  let manifestPath = 'manifests/file-move-manifest.safe.json';
  let dryRun = false;
  let shims = true;

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
    if (arg === '--no-shims') {
      shims = false;
      continue;
    }
  }

  return { manifestPath, dryRun, shims };
}

function assertExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${normalize(path.relative(ROOT, filePath))}`);
  }
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function stripExtension(filePath: string): string {
  return filePath.replace(/\.[^.]+$/, '');
}

function toPosixRelative(fromDir: string, toFile: string): string {
  const rel = normalize(path.relative(fromDir, toFile));
  const withoutExt = stripExtension(rel);
  return withoutExt.startsWith('.') ? withoutExt : `./${withoutExt}`;
}

function getTripleSlashRefs(fileText: string, sourceAbs: string, targetAbs: string): TripleSlashRef[] {
  const refs: TripleSlashRef[] = [];
  const regex = /\/\/\/\s*<reference\s+path=["']([^"']+)["']\s*\/>/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(fileText)) !== null) {
    const oldRelativePath = match[1];
    const referencedAbs = path.resolve(path.dirname(sourceAbs), oldRelativePath);
    const newRelativePath = normalize(path.relative(path.dirname(targetAbs), referencedAbs));
    refs.push({
      targetAbs,
      oldRelativePath,
      newRelativePath: newRelativePath.startsWith('.') ? newRelativePath : `./${newRelativePath}`,
    });
  }

  return refs;
}

function applyTripleSlashFixes(targetAbs: string, refs: TripleSlashRef[]): void {
  if (!refs.length || !fs.existsSync(targetAbs)) return;

  let text = fs.readFileSync(targetAbs, 'utf8');
  for (const ref of refs) {
    const escapedOld = ref.oldRelativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(<reference\\s+path=["'])${escapedOld}(["']\\s*\\/>)`, 'g');
    text = text.replace(regex, `$1${ref.newRelativePath}$2`);
  }
  fs.writeFileSync(targetAbs, text, 'utf8');
}

function targetHasDefaultExport(project: Project, targetAbs: string): boolean {
  const sf = project.getSourceFile(targetAbs);
  if (!sf) return false;
  return sf.getDefaultExportSymbol() != null || sf.getExportAssignments().length > 0;
}

function createCompatibilityShim(project: Project, move: MoveRow): void {
  if (!/\.(ts|tsx|js|jsx)$/.test(move.sourceAbs)) return;
  ensureParentDir(move.sourceAbs);

  const spec = toPosixRelative(path.dirname(move.sourceAbs), move.targetAbs);
  const hasDefault = targetHasDefaultExport(project, move.targetAbs);
  const lines = [`export * from '${spec}';`];
  if (hasDefault) {
    lines.push(`export { default } from '${spec}';`);
  }
  lines.push('');
  fs.writeFileSync(move.sourceAbs, lines.join('\n'), 'utf8');
}

function writeReport(rows: MoveRow[], options: CliOptions): void {
  const reportPath = path.join(ROOT, 'out', 'refactor-move-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        manifest: normalize(options.manifestPath),
        dryRun: options.dryRun,
        shims: options.shims,
        moved: rows.map((r) => ({ source: r.source, target: r.target })),
      },
      null,
      2,
    ),
    'utf8',
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const manifestAbs = path.resolve(ROOT, options.manifestPath);
  assertExists(manifestAbs);

  const manifest = JSON.parse(fs.readFileSync(manifestAbs, 'utf8')) as ManifestRow[];
  const moveRows: MoveRow[] = manifest
    .filter((row) => row.action === 'move' && row.target)
    .map((row) => ({
      source: row.source,
      target: row.target!,
      sourceAbs: path.resolve(ROOT, row.source),
      targetAbs: path.resolve(ROOT, row.target!),
    }));

  if (!moveRows.length) {
    
    return;
  }

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
  });

  const tripleSlashFixes = new Map<string, TripleSlashRef[]>();

  

  for (const move of moveRows) {
    assertExists(move.sourceAbs);
    ensureParentDir(move.targetAbs);

    const sourceFile = project.getSourceFile(move.sourceAbs);
    if (!sourceFile) {
      throw new Error(`ts-morph could not load source file: ${move.source}`);
    }

    const refs = getTripleSlashRefs(sourceFile.getFullText(), move.sourceAbs, move.targetAbs);
    if (refs.length) {
      tripleSlashFixes.set(move.targetAbs, refs);
    }

    if (options.dryRun) {
      
      continue;
    }

    sourceFile.move(move.targetAbs, { overwrite: false });
  }

  if (options.dryRun) {
    writeReport(moveRows, options);
    
    return;
  }

  await project.save();

  for (const [targetAbs, refs] of tripleSlashFixes.entries()) {
    applyTripleSlashFixes(targetAbs, refs);
  }

  if (options.shims) {
    for (const move of moveRows) {
      if (!fs.existsSync(move.targetAbs)) {
        throw new Error(`Move target not found after save: ${move.target}`);
      }
      if (!fs.existsSync(move.sourceAbs)) {
        createCompatibilityShim(project, move);
      }
    }
  }

  writeReport(moveRows, options);
  
  
  
  
  
  
}

main().catch((error) => {
  
  process.exit(1);
});
