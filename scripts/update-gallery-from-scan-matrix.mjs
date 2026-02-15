#!/usr/bin/env node

// Copies scan-validated Tier A artifacts from reports/gallery-artifacts/tier-a/
// to public/gallery/ with filenames matching gallery item IDs.
//
// Tier A artifact naming: tier-a__{scenario-id}__{fixture-id}.{ext}
// Gallery item naming:    {scenario-id}-{fixture-id}.{ext}
//
// This script is the source of truth for overlay gallery images.
// Non-overlay images (plain, content-types, styles, colors) are generated
// by generate-gallery.mjs via Puppeteer.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TIER_A_DIR = path.join(ROOT, 'reports', 'gallery-artifacts', 'tier-a');
const GALLERY_DIR = path.join(ROOT, 'public', 'gallery');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(TIER_A_DIR))) {
    throw new Error(
      `Missing Tier A artifacts at ${TIER_A_DIR}. Run make test:gallery:matrix first.`
    );
  }

  await fs.mkdir(GALLERY_DIR, { recursive: true });

  const files = await fs.readdir(TIER_A_DIR);
  const tierAFiles = files.filter((f) => f.startsWith('tier-a__'));

  // Non-overlay scenarios produce identical output for all fixtures.
  // Only copy the first fixture (tsunami) and name it without the fixture suffix.
  const NON_OVERLAY_SCENARIOS = new Set(['render-gradient-linear', 'render-frame-sticker']);

  const copied = [];
  const skipped = [];

  for (const filename of tierAFiles) {
    // Parse: tier-a__{scenario}__{fixture}.{ext}
    const match = filename.match(/^tier-a__(.+)__(.+)\.(png|gif)$/);
    if (!match) {
      skipped.push({ filename, reason: 'unrecognized naming pattern' });
      continue;
    }

    const [, scenarioId, fixtureId, ext] = match;

    // For non-overlay scenarios, only copy the tsunami fixture (canonical)
    // and name it without the fixture suffix to match gallery item ID
    if (NON_OVERLAY_SCENARIOS.has(scenarioId)) {
      if (fixtureId !== 'tsunami') {
        skipped.push({ filename, reason: 'non-overlay duplicate (tsunami is canonical)' });
        continue;
      }
      const galleryFilename = `${scenarioId}.${ext}`;
      const src = path.join(TIER_A_DIR, filename);
      const dst = path.join(GALLERY_DIR, galleryFilename);
      await fs.copyFile(src, dst);
      const stat = await fs.stat(dst);
      copied.push({ scenarioId, fixtureId: 'canonical', sourceFile: filename, galleryFile: galleryFilename, bytes: stat.size });
      continue;
    }

    const galleryFilename = `${scenarioId}-${fixtureId}.${ext}`;

    const src = path.join(TIER_A_DIR, filename);
    const dst = path.join(GALLERY_DIR, galleryFilename);

    await fs.copyFile(src, dst);
    const stat = await fs.stat(dst);

    copied.push({
      scenarioId,
      fixtureId,
      sourceFile: filename,
      galleryFile: galleryFilename,
      bytes: stat.size,
    });
  }

  // Summary
  console.log(`\nCopied ${copied.length} Tier A artifacts to public/gallery/`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} files:`);
    for (const s of skipped) {
      console.log(`  ${s.filename}: ${s.reason}`);
    }
  }

  // Group by scenario for display
  const byScenario = new Map();
  for (const item of copied) {
    if (!byScenario.has(item.scenarioId)) byScenario.set(item.scenarioId, []);
    byScenario.get(item.scenarioId).push(item.fixtureId);
  }

  console.log(`\nScenarios (${byScenario.size}):`);
  for (const [scenario, fixtures] of byScenario) {
    console.log(`  ${scenario}: ${fixtures.join(', ')}`);
  }

  console.log('\nDone!\n');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
