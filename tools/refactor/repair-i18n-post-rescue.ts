import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function abs(p: string): string {
  return path.resolve(ROOT, p);
}

function ensureDirFor(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeIfChanged(filePath: string, content: string): void {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing === content) return;
  }
  ensureDirFor(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
}

function patchI18nIndex(): void {
  const filePath = abs('src/i18n/index.ts');
  if (!fs.existsSync(filePath)) {
    throw new Error('Expected src/i18n/index.ts to exist');
  }

  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  text = text.replace(/(['"])\.\.\/\.\.\/i18n\/locales\//g, '$1./locales/');
  text = text.replace(/(['"])\.\.\/\.\.\/i18n\/static\//g, '$1./static/');
  text = text.replace(/(['"])\.\/locales\/en-GB\1/g, '$1./locales/en-GB.json$1');

  if (text !== original) {
    fs.writeFileSync(filePath, text, 'utf8');
    
  } else {
    
  }
}

function ensureAppI18nShim(): void {
  const shimPath = abs('src/app/i18n/index.ts');
  const shim = [
    "export * from '../../i18n';",
    "export { default } from '../../i18n';",
    '',
  ].join('\n');
  writeIfChanged(shimPath, shim);
  
}

function main(): void {
  patchI18nIndex();
  ensureAppI18nShim();
  
}

main();
