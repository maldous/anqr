#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TEST_ROOT = path.join(ROOT, 'tests');
const SRC_ROOTS = [path.join(ROOT, 'src'), path.join(ROOT, 'index.html')];

const TEST_PATTERNS = [
  /getByTestId\(\s*(?:"([^"]+)"|'([^']+)')/g,
  /\[data-testid=(?:"([^"]+)"|'([^']+)')\]/g,
  /data-testid\s*[:=]\s*(?:"([^"]+)"|'([^']+)')/g,
];

const ALLOWED_DYNAMIC_PATTERNS = [
  /^accordion-[a-z0-9-]+$/,
  /^metadata-custom-kv-row-\d+$/,
  /^metadata-custom-key-input-\d+$/,
  /^metadata-custom-value-input-\d+$/,
  /^metadata-custom-remove-button-\d+$/,
  /^input-[a-z0-9-]+$/,
  /^textarea-[a-z0-9-]+$/,
  /^select-trigger-[a-z0-9-]+$/,
  /^switch-[a-z0-9-]+$/,
  /^slider-[a-z0-9-]+$/,
  /^slider-[a-z0-9-]+-(increment|decrement)$/,
  /^button-[a-z0-9-]+$/,
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

function collectSourceIds() {
  const ids = new Set();
  for (const root of SRC_ROOTS) {
    if (!fs.existsSync(root)) continue;
    const files = walkFiles(root);
    for (const file of files) {
      if (!/\.(tsx|ts|jsx|js|html)$/.test(file) && !file.endsWith('index.html')) continue;
      const text = fs.readFileSync(file, 'utf8');
      const regex = /data-testid\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        ids.add(match[1] || match[2]);
      }

      const dynamicRegex = /DynamicTestId\.resolve\(\s*(?:"([^"]+)"|'([^']+)')/g;
      while ((match = dynamicRegex.exec(text)) !== null) {
        const id = match[1] || match[2];
        if (id) ids.add(id);
      }

      const propRegex =
        /\b(?:testId|triggerTestId|pickerTestId|textTestId)\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
      while ((match = propRegex.exec(text)) !== null) {
        const id = match[1] || match[2];
        if (id) ids.add(id);
      }
    }
  }
  return ids;
}

function collectTestRefs() {
  const refs = new Map();
  const files = walkFiles(TEST_ROOT).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of TEST_PATTERNS) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const id = match[1] || match[2];
        if (!id || id.includes('${')) continue;
        if (id.includes('{') || id.includes('}')) continue;
        if (!refs.has(id)) refs.set(id, new Set());
        refs.get(id).add(path.relative(ROOT, file));
      }
    }
  }
  return refs;
}

function main() {
  const sourceIds = collectSourceIds();
  const testRefs = collectTestRefs();

  const unknown = [];
  for (const [id, files] of testRefs.entries()) {
    if (sourceIds.has(id)) continue;
    if (ALLOWED_DYNAMIC_PATTERNS.some((p) => p.test(id))) continue;
    unknown.push({ id, files: [...files].sort() });
  }

  if (unknown.length > 0) {
    console.error('Found unmanaged hardcoded data-testid references in tests:');
    for (const item of unknown) {
      console.error(`- ${item.id}`);
      for (const file of item.files) console.error(`  ${file}`);
    }
    process.exit(1);
  }

  console.log(
    'All test data-testid references are managed (explicit or approved dynamic pattern).'
  );
}

main();
