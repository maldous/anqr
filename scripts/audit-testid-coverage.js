#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_ROOTS = ['src', 'index.html'];
const TEST_ROOT = 'tests';

const INTERACTIVE_SUFFIX = /(input|textarea|switch|slider|select|trigger|button|tab|option)$/;
const DIRECT_TEST_REF_PATTERNS = [
  /getByTestId\(\s*(?:"([^"]+)"|'([^']+)')/g,
  /\[data-testid=(?:"([^"]+)"|'([^']+)')\]/g,
  /data-testid\s*[:=]\s*(?:"([^"]+)"|'([^']+)')/g,
];

const INDIRECT_COVERAGE_PREFIX_TO_SECTION = {
  'payload-': 'Payload',
  'overlay-': 'Overlay',
  'qr-': 'QR Encoding',
  'render-': 'Render',
  'animation-': 'Animation',
  'output-': 'Output',
  'watermark-': 'Watermark',
  'share-': 'Share',
  'safety-': 'Safety',
};

const ALWAYS_INDIRECT = [
  /^accordion-/,
  /^tier-tab-/,
  /^tier-option-/,
  /^analyze-/,
  /^qr-preview$/,
  /^sidebar-scroll$/,
];

function walkFiles(start) {
  const out = [];
  const stat = fs.statSync(start);
  if (stat.isFile()) return [start];
  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const full = path.join(start, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function collectSourceTestIds() {
  const ids = new Map();
  let literalCount = 0;
  const files = [];
  for (const root of SRC_ROOTS) {
    if (!fs.existsSync(root)) continue;
    files.push(...walkFiles(root));
  }

  for (const file of files) {
    if (!/\.(tsx|ts|jsx|js|html)$/.test(file) && !file.endsWith('index.html')) continue;
    const text = fs.readFileSync(file, 'utf8');
    const regex = /data-testid\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      literalCount += 1;
      const id = match[1] || match[2];
      if (!ids.has(id)) ids.set(id, []);
      ids.get(id).push(file);
    }

    const dynamicRegex = /DynamicTestId\.resolve\(\s*(?:"([^"]+)"|'([^']+)')/g;
    while ((match = dynamicRegex.exec(text)) !== null) {
      const id = match[1] || match[2];
      if (!id) continue;
      if (!ids.has(id)) ids.set(id, []);
      ids.get(id).push(file);
    }
  }
  return { ids, literalCount };
}

function collectTestRefs() {
  const refs = new Map();
  const files = walkFiles(TEST_ROOT).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of DIRECT_TEST_REF_PATTERNS) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const id = match[1] || match[2];
        if (!id || id.includes('${')) continue;
        if (!refs.has(id)) refs.set(id, []);
        refs.get(id).push(file);
      }
    }
  }
  return refs;
}

function readSettingsRegistry() {
  const file = path.join(ROOT, 'tests/helpers/settings-registry.ts');
  const text = fs.readFileSync(file, 'utf8');
  const sectionRegex = /section:\s*'([^']+)'/g;
  const sections = new Set();
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    sections.add(match[1]);
  }
  return sections;
}

function hasIndirectCoverage(id, registrySections) {
  if (ALWAYS_INDIRECT.some((pattern) => pattern.test(id))) return true;

  for (const [prefix, section] of Object.entries(INDIRECT_COVERAGE_PREFIX_TO_SECTION)) {
    if (id.startsWith(prefix)) return registrySections.has(section);
  }

  return false;
}

function main() {
  const { ids: sourceIds, literalCount } = collectSourceTestIds();
  const testRefs = collectTestRefs();
  const registrySections = readSettingsRegistry();

  const all = [...sourceIds.keys()].sort();
  const uncoveredInteractive = [];
  const uncoveredNonInteractive = [];

  for (const id of all) {
    const direct = testRefs.has(id);
    const indirect = hasIndirectCoverage(id, registrySections);
    if (direct || indirect) continue;

    if (INTERACTIVE_SUFFIX.test(id)) uncoveredInteractive.push(id);
    else uncoveredNonInteractive.push(id);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sourceTestIds: all.length,
    directTestRefs: testRefs.size,
    uncoveredInteractive,
    uncoveredNonInteractive,
  };

  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, 'reports/testid-coverage.json'),
    JSON.stringify(report, null, 2)
  );

  const md = [
    '# data-testid Coverage Audit',
    '',
    `- Source IDs: ${report.sourceTestIds}`,
    `- Directly referenced in tests: ${report.directTestRefs}`,
    `- Uncovered interactive IDs: ${uncoveredInteractive.length}`,
    `- Uncovered non-interactive IDs: ${uncoveredNonInteractive.length}`,
    '',
  ];

  if (uncoveredInteractive.length > 0) {
    md.push('## Uncovered Interactive IDs', '');
    for (const id of uncoveredInteractive) md.push(`- \`${id}\``);
    md.push('');
  }

  if (uncoveredNonInteractive.length > 0) {
    md.push('## Uncovered Non-interactive IDs', '');
    for (const id of uncoveredNonInteractive) md.push(`- \`${id}\``);
    md.push('');
  }

  fs.writeFileSync(path.join(ROOT, 'reports/testid-coverage.md'), md.join('\n'));

  if (literalCount > 0) {
    console.error(
      `Found ${literalCount} literal data-testid assignments in source. DynamicTestId is required.`
    );
    process.exit(1);
  }

  if (uncoveredInteractive.length > 0) {
    console.error(`Found ${uncoveredInteractive.length} uncovered interactive data-testid values.`);
    process.exit(1);
  }
  console.log('data-testid audit passed.');
}

main();
