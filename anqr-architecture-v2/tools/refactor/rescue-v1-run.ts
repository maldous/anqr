import { Project, SyntaxKind } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

type ManifestRow = {
  source: string;
  action: 'move' | 'split' | 'delete' | 'review';
  target?: string | null;
};

type CliOptions = {
  manifestPath: string;
  dryRun: boolean;
};

type MoveRow = {
  source: string;
  target: string;
  sourceAbs: string;
  targetAbs: string;
};

const ROOT = process.cwd();
const REVERT_MOVES = new Set(['src/i18n/index.ts', 'src/modules/animation/parsing.ts']);

function normalize(p: string): string {
  return p.replace(/\\/g, '/');
}

function parseArgs(argv: string[]): CliOptions {
  let manifestPath = 'manifests/file-move-manifest.full.json';
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

function toAliasCandidatesForIndex(filePath: string): string[] {
  const rel = normalize(path.relative(ROOT, filePath));
  if (!rel.startsWith('src/') || !/\/index\.[^.]+$/.test(rel)) return [];
  const noExt = stripExtension(rel);
  return [`@/${noExt.slice('src/'.length, -'/index'.length)}`];
}

function toPosixRelative(fromDir: string, toFile: string): string {
  const rel = normalize(path.relative(fromDir, toFile));
  const withoutExt = stripExtension(rel);
  return withoutExt.startsWith('.') ? withoutExt : `./${withoutExt}`;
}

function targetHasDefaultExport(project: Project, targetAbs: string): boolean {
  const sf = project.getSourceFile(targetAbs);
  if (!sf) return false;
  return sf.getDefaultExportSymbol() != null || sf.getExportAssignments().length > 0;
}

function createCompatibilityShim(project: Project, sourceAbs: string, targetAbs: string): void {
  if (!/\.(ts|tsx|js|jsx)$/.test(sourceAbs)) return;
  ensureParentDir(sourceAbs);
  const spec = toPosixRelative(path.dirname(sourceAbs), targetAbs);
  const hasDefault = targetHasDefaultExport(project, targetAbs);
  const lines = [`export * from '${spec}';`];
  if (hasDefault) {
    lines.push(`export { default } from '${spec}';`);
  }
  lines.push('');
  fs.writeFileSync(sourceAbs, lines.join('\n'), 'utf8');
}

function reverseWrongIndexPrefixRewrites(
  project: Project,
  moveRows: MoveRow[],
  dryRun: boolean
): void {
  const mappings = moveRows
    .map((row) => ({
      oldAliases: toAliasCandidatesForIndex(row.sourceAbs),
      newAliases: toAliasCandidatesForIndex(row.targetAbs),
    }))
    .filter((entry) => entry.oldAliases.length && entry.newAliases.length)
    .flatMap((entry) =>
      entry.oldAliases.map((oldAlias, i) => ({
        oldAlias,
        newAlias: entry.newAliases[i] ?? entry.newAliases[0],
      }))
    );

  if (!mappings.length) return;

  for (const sf of project.getSourceFiles()) {
    let textChanged = false;

    for (const importDecl of sf.getImportDeclarations()) {
      const oldValue = importDecl.getModuleSpecifierValue();
      let newValue = oldValue;
      for (const mapping of mappings) {
        if (newValue.startsWith(`${mapping.newAlias}/`)) {
          newValue = `${mapping.oldAlias}${newValue.slice(mapping.newAlias.length)}`;
        }
      }
      if (newValue !== oldValue) {
        textChanged = true;
        if (!dryRun) importDecl.setModuleSpecifier(newValue);
      }
    }

    for (const exportDecl of sf.getExportDeclarations()) {
      const oldValue = exportDecl.getModuleSpecifierValue();
      if (!oldValue) continue;
      let newValue = oldValue;
      for (const mapping of mappings) {
        if (newValue.startsWith(`${mapping.newAlias}/`)) {
          newValue = `${mapping.oldAlias}${newValue.slice(mapping.newAlias.length)}`;
        }
      }
      if (newValue !== oldValue) {
        textChanged = true;
        if (!dryRun) exportDecl.setModuleSpecifier(newValue);
      }
    }

    const literals = sf.getDescendantsOfKind(SyntaxKind.StringLiteral);
    for (const lit of literals) {
      const parent = lit.getParent();
      if (parent?.getKind() !== SyntaxKind.CallExpression) continue;
      const callText = parent.getText();
      if (!callText.startsWith('import(')) continue;
      const oldValue = lit.getLiteralText();
      let newValue = oldValue;
      for (const mapping of mappings) {
        if (newValue.startsWith(`${mapping.newAlias}/`)) {
          newValue = `${mapping.oldAlias}${newValue.slice(mapping.newAlias.length)}`;
        }
      }
      if (newValue !== oldValue) {
        textChanged = true;
        if (!dryRun) lit.replaceWithText(`'${newValue}'`);
      }
    }

    if (dryRun && textChanged) {
    }
  }
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

  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
  });

  const revertRows = moveRows.filter((row) => REVERT_MOVES.has(row.source));
  const shimRows = moveRows.filter((row) => !REVERT_MOVES.has(row.source));

  for (const row of revertRows) {
    if (!fs.existsSync(row.targetAbs)) continue;
    if (options.dryRun) {
      continue;
    }
    ensureParentDir(row.sourceAbs);
    const sf = project.getSourceFile(row.targetAbs);
    if (!sf) throw new Error(`Could not load moved file for revert: ${row.target}`);
    sf.move(row.sourceAbs, { overwrite: true });
  }

  if (!options.dryRun) {
    await project.save();
  }

  reverseWrongIndexPrefixRewrites(project, moveRows, options.dryRun);

  if (!options.dryRun) {
    await project.save();
  }

  for (const row of shimRows) {
    if (!fs.existsSync(row.targetAbs)) continue;
    if (fs.existsSync(row.sourceAbs)) continue;
    if (options.dryRun) {
      continue;
    }
    createCompatibilityShim(project, row.sourceAbs, row.targetAbs);
  }

  if (!options.dryRun) {
  } else {
  }
}

main().catch((error) => {
  process.exit(1);
});
