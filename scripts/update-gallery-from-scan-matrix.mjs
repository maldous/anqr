#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MATRIX_PATH = path.join(ROOT, 'reports', 'gallery-scan-matrix.json');
const GALLERY_DIR = path.join(ROOT, 'public', 'gallery');
const MANIFEST_PATH = path.join(GALLERY_DIR, 'scan-showcase-manifest.json');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(MATRIX_PATH))) {
    throw new Error(
      `Missing matrix report at ${MATRIX_PATH}. Run tests/unit/gallery-scan-matrix.spec.ts first.`
    );
  }

  const matrix = JSON.parse(await fs.readFile(MATRIX_PATH, 'utf8'));
  const candidates = Array.isArray(matrix.galleryCandidates) ? matrix.galleryCandidates : [];
  await fs.mkdir(GALLERY_DIR, { recursive: true });

  const copied = [];
  for (const candidate of candidates) {
    const scenarioId = candidate.scenarioId;
    const src = path.join(ROOT, candidate.artifactPath);
    if (!(await exists(src))) continue;
    const isAnimated = candidate.isAnimated ?? matrix.fixtures?.find(f => f.id === candidate.selectedFixtureId)?.isAnimated ?? false;
    const ext = isAnimated ? 'gif' : 'png';
    const dstFile = `scan-${scenarioId}.${ext}`;
    const dst = path.join(GALLERY_DIR, dstFile);
    await fs.copyFile(src, dst);
    copied.push({
      scenarioId,
      selectedFixtureId: candidate.selectedFixtureId,
      isAnimated: candidate.isAnimated ?? false,
      heroPriority: candidate.heroPriority ?? 0,
      galleryEligible: candidate.galleryEligible ?? false,
      sourceArtifact: candidate.artifactPath,
      galleryFile: dstFile,
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceReport: 'reports/gallery-scan-matrix.json',
    copiedCount: copied.length,
    tierA: matrix.tierA ?? null,
    tierB: matrix.tierB ?? null,
    items: copied,
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`Copied ${copied.length} scan-validated showcase images to public/gallery.`);
  console.log(`Wrote ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
