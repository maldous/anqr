#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IDS_FILE = path.join(ROOT, 'tests/ids.txt');
const TYPES_FILE = path.join(ROOT, 'tests/types.txt');
const OUT_FILE = path.join(ROOT, 'tests/required.txt');

const CATEGORY_LABELS = new Map();
for (const line of fs.readFileSync(TYPES_FILE, 'utf8').split('\n')) {
  const m = line.match(/^(\d+)\)\s+(.*)$/);
  if (m) CATEGORY_LABELS.set(Number(m[1]), m[2].trim());
}

const TEST_FILES = fs
  .readdirSync(path.join(ROOT, 'tests'), { recursive: true })
  .map((p) => path.join(ROOT, 'tests', p))
  .filter((p) => /\.(spec\.ts)$/.test(p))
  .map((p) => path.relative(ROOT, p));

const TEST_TEXT = new Map(TEST_FILES.map((f) => [f, fs.readFileSync(path.join(ROOT, f), 'utf8')]));

function parseIds() {
  const lines = fs.readFileSync(IDS_FILE, 'utf8').split('\n');
  let section = '';
  let sectionNumber = 0;
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const s = line.match(/^(\d+)\)\s+(.*)$/);
    if (s) {
      sectionNumber = Number(s[1]);
      section = s[2].trim();
      continue;
    }
    if (sectionNumber < 2) continue;
    if (line.startsWith('- ')) {
      const id = line.slice(2).trim();
      if (
        id.startsWith('Total managed IDs:') ||
        id.startsWith('Source:') ||
        id.startsWith('Rule:') ||
        section.includes('Coverage Usage Rules') ||
        section.includes('Parameterized Dynamic ID Templates') ||
        id.startsWith('This file is') ||
        id.startsWith('Every test selector')
      ) {
        continue;
      }
      const sourceLine = lines[i + 1]?.trim().startsWith('source:')
        ? lines[i + 1].trim().replace(/^source:\s*/, '')
        : '';
      entries.push({
        id,
        section,
        sources: sourceLine ? sourceLine.split(',').map((s) => s.trim()) : [],
      });
    }
  }
  return entries;
}

function inferDomain(entry) {
  const source = entry.sources.join(' ').toLowerCase();
  const id = entry.id.toLowerCase();
  const section = entry.section.toLowerCase();

  if (id.startsWith('payload-') || source.includes('payloadsection')) return 'payload';
  if (id.startsWith('overlay-') || source.includes('overlaysection')) return 'overlay';
  if (id.startsWith('qr-') || source.includes('qr-encoding-section')) return 'qr';
  if (id.startsWith('render-') || source.includes('rendersection')) return 'render';
  if (id.startsWith('animation-') || source.includes('animationsection')) return 'animation';
  if (id.startsWith('output-') || source.includes('outputsection')) return 'output';
  if (id.startsWith('watermark-') || source.includes('watermarksection')) return 'watermark';
  if (id.startsWith('metadata-') || source.includes('metadatasection')) return 'metadata';
  if (id.startsWith('share-') || source.includes('sharesection')) return 'share';
  if (id.startsWith('safety-') || source.includes('safetysection')) return 'safety';
  if (id.startsWith('analyze-') || source.includes('analyze.tsx')) return 'analyze';
  if (id.startsWith('tier-') || section.includes('tier')) return 'tier';
  if (id.startsWith('select-item-option-')) {
    if (source.includes('payloadsection')) return 'payload';
    if (source.includes('overlaysection')) return 'overlay';
    if (source.includes('outputsection')) return 'output';
    if (source.includes('animationsection')) return 'animation';
    if (source.includes('rendersection')) return 'render';
    if (source.includes('qr-encoding-section')) return 'qr';
    if (source.includes('watermarksection')) return 'watermark';
    if (source.includes('safetysection')) return 'safety';
    return 'app';
  }
  return 'app';
}

const REQUIRED_BY_DOMAIN = {
  payload: [2, 6, 7, 10, 13],
  overlay: [1, 6, 8, 10, 13],
  qr: [2, 6, 10, 13],
  render: [1, 5, 6, 10, 13],
  animation: [1, 5, 6, 8, 10, 13],
  output: [6, 9, 10, 13],
  watermark: [6, 8, 10, 13],
  metadata: [4, 6, 10, 13],
  share: [6, 10, 13],
  safety: [6, 10, 12, 13],
  analyze: [6, 10, 13],
  tier: [3, 6, 10, 13],
  app: [6, 10, 13],
};

const DEFAULT_EVIDENCE = {
  1: ['tests/basic/overlay.spec.ts', 'tests/advanced/render.spec.ts', 'tests/advanced/animation.spec.ts'],
  2: ['tests/basic/payload.spec.ts', 'tests/advanced/qr-encoding.spec.ts'],
  3: ['tests/advanced/output.spec.ts', 'tests/professional/safety.spec.ts'],
  4: ['tests/professional/metadata.spec.ts'],
  5: ['tests/basic/e2e-library-demo.spec.ts', 'tests/advanced/render.spec.ts'],
  6: ['tests/permutations/exhaustive.spec.ts'],
  7: ['tests/basic/payload.spec.ts', 'tests/advanced/output.spec.ts'],
  8: ['tests/basic/overlay.spec.ts', 'tests/professional/watermark.spec.ts', 'tests/advanced/animation.spec.ts'],
  9: ['tests/advanced/output.spec.ts'],
  10: ['tests/permutations/exhaustive.spec.ts'],
  11: ['tests/basic/e2e-library-demo.spec.ts'],
  12: ['tests/professional/safety.spec.ts'],
  13: ['tests/basic/testid-runtime-audit.spec.ts'],
};

const DOMAIN_EVIDENCE_HINTS = {
  payload: ['tests/basic/payload.spec.ts'],
  overlay: ['tests/basic/overlay.spec.ts'],
  qr: ['tests/advanced/qr-encoding.spec.ts'],
  render: ['tests/advanced/render.spec.ts'],
  animation: ['tests/advanced/animation.spec.ts'],
  output: ['tests/advanced/output.spec.ts'],
  watermark: ['tests/professional/watermark.spec.ts'],
  metadata: ['tests/professional/metadata.spec.ts'],
  share: ['tests/professional/share.spec.ts'],
  safety: ['tests/professional/safety.spec.ts'],
  analyze: ['tests/basic/testid-runtime-audit.spec.ts'],
  tier: ['tests/basic/testid-runtime-audit.spec.ts'],
  app: ['tests/basic/header.spec.ts'],
};

const INVENTORY_ONLY_EVIDENCE_FILES = new Set(['tests/unit/testid-inventory-explicit.spec.ts']);

function directEvidence(id, cat) {
  const matches = TEST_FILES.filter((f) => TEST_TEXT.get(f)?.includes(id));
  if (cat === 13) return matches;
  return matches.filter((f) => !INVENTORY_ONLY_EVIDENCE_FILES.has(f));
}

function pickEvidence(id, domain, cat) {
  const direct = directEvidence(id, cat);
  if (direct.length > 0) return { file: direct[0], basis: 'direct-id' };

  const hinted = (DOMAIN_EVIDENCE_HINTS[domain] || []).find((f) => fs.existsSync(path.join(ROOT, f)));
  if (hinted && (DEFAULT_EVIDENCE[cat] || []).includes(hinted)) return { file: hinted, basis: 'domain+type' };
  if (hinted) return { file: hinted, basis: 'domain' };

  const byType = (DEFAULT_EVIDENCE[cat] || []).find((f) => fs.existsSync(path.join(ROOT, f)));
  if (byType) return { file: byType, basis: 'type-default' };

  return { file: 'tests/permutations/exhaustive.spec.ts', basis: 'fallback' };
}

function main() {
  const entries = parseIds();
  const lines = [];
  lines.push('1) Required Test Matrix (Generated)');
  lines.push(`- Generated from: tests/ids.txt + tests/types.txt`);
  lines.push(`- Total IDs: ${entries.length}`);
  lines.push('- Rule: every requirement row must map to at least one concrete test file');
  lines.push('');

  for (const entry of entries) {
    const domain = inferDomain(entry);
    const required = REQUIRED_BY_DOMAIN[domain] || REQUIRED_BY_DOMAIN.app;
    lines.push(`ID: ${entry.id}`);
    lines.push(`- section: ${entry.section}`);
    if (entry.sources.length > 0) lines.push(`- source: ${entry.sources.join(', ')}`);
    lines.push(`- inferred-domain: ${domain}`);
    lines.push('- requirements:');
    for (const cat of required) {
      const label = CATEGORY_LABELS.get(cat) || `Category ${cat}`;
      const ev = pickEvidence(entry.id, domain, cat);
      lines.push(`  - T${cat} ${label} -> ${ev.file} [${ev.basis}]`);
    }
    lines.push('');
  }

  fs.writeFileSync(OUT_FILE, lines.join('\n'));
  console.log(`Generated ${path.relative(ROOT, OUT_FILE)} for ${entries.length} IDs.`);
}

main();
