#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_ROOTS = ['src', 'index.html'];
const OUTPUT = path.join(ROOT, 'tests/ids.txt');

const SECTION_ORDER = [
  ['app', 'App Shell & Navigation'],
  ['payload', 'Payload Section'],
  ['qr', 'QR Encoding Section'],
  ['render', 'Render Section'],
  ['overlay', 'Overlay Section'],
  ['animation', 'Animation Section'],
  ['output', 'Output Section'],
  ['watermark', 'Watermark Section'],
  ['metadata', 'Metadata Section'],
  ['share', 'Share Section'],
  ['safety', 'Safety Section'],
  ['analyze', 'Analyze Section'],
  ['tier', 'Tier Controls'],
  ['selectitem', 'Select Option IDs'],
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

function collectIds() {
  const ids = new Map();
  const templates = new Map();

  function addId(id, file) {
    if (!ids.has(id)) ids.set(id, new Set());
    ids.get(id).add(file.replace(`${ROOT}/`, ''));
  }

  function addTemplate(template, file) {
    if (!templates.has(template)) templates.set(template, new Set());
    templates.get(template).add(file.replace(`${ROOT}/`, ''));
  }

  for (const root of SRC_ROOTS) {
    if (!fs.existsSync(root)) continue;
    const files = walkFiles(root);
    for (const file of files) {
      if (!/\.(tsx|ts|jsx|js|html)$/.test(file) && !file.endsWith('index.html')) continue;
      const text = fs.readFileSync(file, 'utf8');
      const regex = /data-testid\s*=\s*(?:"([^"]+)"|'([^']+)')/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const id = match[1] || match[2];
        addId(id, file);
      }

      const dynamicRegex = /DynamicTestId\.resolve\(\s*(?:"([^"]+)"|'([^']+)')/g;
      while ((match = dynamicRegex.exec(text)) !== null) {
        const id = match[1] || match[2];
        if (!id) continue;
        addId(id, file);
      }

      const dynamicTemplateRegex = /DynamicTestId\.resolve\(\s*`([^`$]*)\$\{[^}]+\}([^`]*)`/g;
      while ((match = dynamicTemplateRegex.exec(text)) !== null) {
        const prefix = match[1] || '';
        const suffix = match[2] || '';
        const template = `${prefix}{param}${suffix}`;
        addTemplate(template, file);
      }

      const selectItemRegex = /<SelectItem\s+[^>]*value=(?:"([^"]+)"|'([^']+)')[^>]*>/g;
      while ((match = selectItemRegex.exec(text)) !== null) {
        const value = match[1] || match[2];
        if (!value) continue;
        const normalized = value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .replace(/--+/g, '-');
        if (!normalized) continue;
        const id = `select-item-option-${normalized}`;
        addId(id, file);
      }

      if (file.endsWith('OverlaySection.tsx')) {
        const modeValueRegex = /value:\s*'([^']+)'/g;
        while ((match = modeValueRegex.exec(text)) !== null) {
          const value = match[1];
          if (!value) continue;
          const normalized = value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/--+/g, '-');
          if (!normalized) continue;
          const id = `select-item-option-${normalized}`;
          addId(id, file);
        }
      }
    }
  }
  return { ids, templates };
}

function bucketForId(id) {
  if (id === 'qr-preview' || id === 'sidebar' || id === 'sidebar-scroll' || id === 'export-button')
    return 'app';
  if (id.startsWith('accordion-')) return 'app';
  if (id.startsWith('payload-')) return 'payload';
  if (id.startsWith('qr-')) return 'qr';
  if (id.startsWith('render-')) return 'render';
  if (id.startsWith('overlay-')) return 'overlay';
  if (id.startsWith('animation-')) return 'animation';
  if (id.startsWith('output-')) return 'output';
  if (id.startsWith('watermark-')) return 'watermark';
  if (id.startsWith('metadata-')) return 'metadata';
  if (id.startsWith('share-')) return 'share';
  if (id.startsWith('safety-')) return 'safety';
  if (id.startsWith('analyze-')) return 'analyze';
  if (id.startsWith('tier-')) return 'tier';
  if (id.startsWith('select-item-option-')) return 'selectitem';
  return 'app';
}

function main() {
  const { ids, templates } = collectIds();
  const buckets = new Map();
  for (const [key] of SECTION_ORDER) buckets.set(key, []);
  for (const [id, files] of ids.entries()) {
    const bucket = bucketForId(id);
    buckets.get(bucket)?.push({ id, files: [...files].sort() });
  }
  for (const [, items] of buckets.entries()) {
    items.sort((a, b) => a.id.localeCompare(b.id));
  }

  const lines = [];
  lines.push('1) Canonical Managed data-testid Inventory');
  lines.push(`- Total managed IDs: ${ids.size}`);
  lines.push(
    '- Source: auto-generated from DynamicTestId + literal fallback scan of `src/**` and `index.html`'
  );
  lines.push(
    '- Rule: when adding/removing IDs, regenerate this file with `node scripts/generate-test-ids.js`'
  );
  lines.push('');

  let sectionIndex = 2;
  for (const [key, title] of SECTION_ORDER) {
    const items = buckets.get(key) || [];
    if (items.length === 0) continue;
    lines.push(`${sectionIndex}) ${title}`);
    for (const item of items) {
      lines.push(`- ${item.id}`);
      lines.push(`  source: ${item.files.join(', ')}`);
    }
    lines.push('');
    sectionIndex += 1;
  }

  lines.push(`${sectionIndex}) Coverage Usage Rules`);
  lines.push(
    '- This file is the complete explicit ID inventory for coverage and permutation auditing.'
  );
  lines.push('- Every test selector should map to an explicit ID listed in this file.');
  lines.push(
    '- `tests/types.txt` categories must map to at least one corresponding ID group from this file.'
  );
  lines.push('');

  if (templates.size > 0) {
    const templateItems = [...templates.entries()]
      .map(([template, files]) => ({ template, files: [...files].sort() }))
      .sort((a, b) => a.template.localeCompare(b.template));
    lines.push(`${sectionIndex + 1}) Parameterized Dynamic ID Templates`);
    lines.push('- These IDs are generated per item/index/state at runtime and must remain unique.');
    for (const item of templateItems) {
      lines.push(`- ${item.template}`);
      lines.push(`  source: ${item.files.join(', ')}`);
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, lines.join('\n'));
  console.log(`Generated ${path.relative(ROOT, OUTPUT)} with ${ids.size} managed IDs.`);
}

main();
