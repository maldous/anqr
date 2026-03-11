import { Project, Node, SourceFile } from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

type SplitManifest = {
  sourceFile: string;
  description?: string;
  groups: Array<{
    targetFile: string;
    symbols: string[];
    notes?: string;
  }>;
};

const ROOT = process.cwd();

function parseArgs(argv: string[]): { manifestPath: string } {
  let manifestPath = '';
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--manifest' && argv[i + 1]) {
      manifestPath = argv[i + 1];
      i += 1;
    }
  }
  if (!manifestPath) {
    throw new Error(
      'Usage: tsx tools/refactor/extract-symbol-groups.ts --manifest manifests/symbol-splits/<file>.json'
    );
  }
  return { manifestPath };
}

function findTopLevelDeclarationText(sf: SourceFile, symbolName: string): string | null {
  for (const stmt of sf.getStatements()) {
    if (Node.isFunctionDeclaration(stmt) && stmt.getName() === symbolName) return stmt.getText();
    if (Node.isClassDeclaration(stmt) && stmt.getName() === symbolName) return stmt.getText();
    if (Node.isInterfaceDeclaration(stmt) && stmt.getName() === symbolName) return stmt.getText();
    if (Node.isTypeAliasDeclaration(stmt) && stmt.getName() === symbolName) return stmt.getText();
    if (Node.isEnumDeclaration(stmt) && stmt.getName() === symbolName) return stmt.getText();

    if (Node.isVariableStatement(stmt)) {
      const matchingDecl = stmt.getDeclarations().find((d) => d.getName() === symbolName);
      if (matchingDecl) {
        if (stmt.getDeclarations().length === 1) return stmt.getText();
        return `/* MANUAL EXTRACTION REQUIRED: ${symbolName} was declared in a multi-declaration variable statement. */\n${matchingDecl.getText()};`;
      }
    }
  }

  return null;
}

async function main(): Promise<void> {
  const { manifestPath } = parseArgs(process.argv.slice(2));
  const manifestAbs = path.resolve(ROOT, manifestPath);
  if (!fs.existsSync(manifestAbs)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestAbs, 'utf8')) as SplitManifest;
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
  });

  const sourceAbs = path.resolve(ROOT, manifest.sourceFile);
  const sourceFile = project.getSourceFile(sourceAbs);
  if (!sourceFile) {
    throw new Error(`Source file not found in project: ${manifest.sourceFile}`);
  }

  for (const group of manifest.groups) {
    const targetAbs = path.resolve(ROOT, group.targetFile);
    const targetDir = path.dirname(targetAbs);
    fs.mkdirSync(targetDir, { recursive: true });

    let targetFile = project.getSourceFile(targetAbs);
    if (!targetFile) {
      targetFile = project.createSourceFile(targetAbs, '', { overwrite: false });
      targetFile.insertText(
        0,
        `/*\n` +
          ` * Generated scaffold from split manifest.\n` +
          ` * Source: ${manifest.sourceFile}\n` +
          ` * Notes: ${group.notes ?? 'n/a'}\n` +
          ` */\n\n`
      );
    }

    for (const symbol of group.symbols) {
      const existingText = targetFile.getFullText();
      if (existingText.includes(symbol)) {
        continue;
      }

      const declarationText = findTopLevelDeclarationText(sourceFile, symbol);
      const textToWrite =
        declarationText ?? `/* TODO: symbol not found during scaffold generation: ${symbol} */`;

      if (!targetFile.getFullText().endsWith('\n')) {
        targetFile.insertText(targetFile.getFullWidth(), '\n');
      }
      targetFile.insertText(targetFile.getFullWidth(), `${textToWrite}\n\n`);
    }
  }

  await project.save();
}

main().catch((error) => {
  process.exit(1);
});
