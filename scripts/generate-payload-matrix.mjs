#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const STORE_PATH = path.join(ROOT, 'src/store/qr-store.ts');
const SECTION_PATH = path.join(ROOT, 'src/components/sections/PayloadSection.tsx');
const TESTS_DIR = path.join(ROOT, 'tests/unit');
const REPORT_JSON = path.join(ROOT, 'reports/payload-verification-matrix.json');
const REPORT_MD = path.join(ROOT, 'reports/payload-verification-matrix.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function collectSpecFiles(dirPath) {
  const files = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSpecFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractPayloadKinds(storeSource) {
  const unionMatch = storeSource.match(
    /export type PayloadKind =([\s\S]*?)\n\s*\/\/ QR encoding types/
  );
  if (!unionMatch) {
    throw new Error('Could not locate PayloadKind union in src/store/qr-store.ts');
  }
  return [...unionMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function extractSwitchKinds(storeSource) {
  const switchMatch = storeSource.match(
    /switch \(payload\.kind\) \{([\s\S]*?)\n\s*default:\n\s*return applyTransforms\(payload\.text\);/
  );
  if (!switchMatch) {
    throw new Error('Could not locate payload.kind switch in src/store/qr-store.ts');
  }
  return new Set([...switchMatch[1].matchAll(/case '([^']+)':/g)].map((m) => m[1]));
}

function extractUIKinds(sectionSource) {
  return new Set([...sectionSource.matchAll(/value: '([^']+)' as PayloadKind/g)].map((m) => m[1]));
}

function extractTextDrivenKinds(sectionSource) {
  const blocks = sectionSource.matchAll(
    /if \(payload\.kind === '([^']+)'.*?\)\s*\{[\s\S]*?setPayloadText\(/g
  );
  return new Set([...blocks].map((m) => m[1]));
}

function countKindReferences(kind, filesToScan) {
  const matcher = new RegExp(`'${kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
  let count = 0;
  for (const filePath of filesToScan) {
    const source = read(filePath);
    const matches = source.match(matcher);
    count += matches ? matches.length : 0;
  }
  return count;
}

const storeSource = read(STORE_PATH);
const sectionSource = read(SECTION_PATH);
const testFiles = collectSpecFiles(TESTS_DIR);

const kinds = extractPayloadKinds(storeSource).sort();
const switchKinds = extractSwitchKinds(storeSource);
const uiKinds = extractUIKinds(sectionSource);
const textDrivenKinds = extractTextDrivenKinds(sectionSource);

const rows = kinds.map((kind) => {
  const selectorWired = uiKinds.has(kind);
  const generationPath = switchKinds.has(kind)
    ? 'store-switch'
    : textDrivenKinds.has(kind)
      ? 'ui-text-generator'
      : 'missing';
  const testReferences = countKindReferences(kind, testFiles);
  const status =
    selectorWired && generationPath !== 'missing' && testReferences > 0 ? 'PASS' : 'REVIEW';
  const note =
    generationPath === 'ui-text-generator'
      ? 'Generated in PayloadSection useEffect via setPayloadText.'
      : '';
  return {
    kind,
    selectorWired,
    generationPath,
    testReferences,
    status,
    note,
  };
});

const summary = {
  totalKinds: rows.length,
  pass: rows.filter((r) => r.status === 'PASS').length,
  review: rows.filter((r) => r.status === 'REVIEW').length,
  missingSelector: rows.filter((r) => !r.selectorWired).map((r) => r.kind),
  missingGeneration: rows.filter((r) => r.generationPath === 'missing').map((r) => r.kind),
  textDrivenKinds: rows.filter((r) => r.generationPath === 'ui-text-generator').map((r) => r.kind),
};

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  rows,
};

fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);

const markdown = [
  '# Payload Verification Matrix',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Summary',
  `- Total payload kinds: ${summary.totalKinds}`,
  `- PASS: ${summary.pass}`,
  `- REVIEW: ${summary.review}`,
  `- Text-driven kinds: ${summary.textDrivenKinds.join(', ') || 'none'}`,
  `- Missing selector wiring: ${summary.missingSelector.join(', ') || 'none'}`,
  `- Missing generation path: ${summary.missingGeneration.join(', ') || 'none'}`,
  '',
  '## Matrix',
  '| Kind | Selector | Generation Path | Test Refs | Status | Notes |',
  '| --- | --- | --- | ---: | --- | --- |',
  ...rows.map(
    (row) =>
      `| \`${row.kind}\` | ${row.selectorWired ? 'yes' : 'no'} | ${row.generationPath} | ${row.testReferences} | ${row.status} | ${row.note} |`
  ),
  '',
];

fs.writeFileSync(REPORT_MD, markdown.join('\n'));
console.log(
  `[payload-matrix] PASS=${summary.pass}/${summary.totalKinds}, REVIEW=${summary.review}, report=${path.relative(ROOT, REPORT_MD)}`
);
