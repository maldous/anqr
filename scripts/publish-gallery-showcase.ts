#!/usr/bin/env node

/**
 * Publish gallery showcase assets from rendered artifact directories to public/gallery/.
 *
 * Default source preference:
 *   1) reports/gallery-artifacts/remote
 *   2) reports/gallery-artifacts/local
 *   3) reports/gallery-artifacts/browser
 *
 * Env:
 *   GALLERY_PUBLISH_SOURCES  Comma-separated source order (remote,local,browser)
 *   GALLERY_STRICT_PUBLISH   1 => fail when any item image is missing (default: 1)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gallerySections } from '../src/data/gallery-items';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'reports', 'gallery-artifacts');
const PUBLIC_GALLERY_DIR = path.join(ROOT, 'public', 'gallery');

const sourceOrder = (process.env.GALLERY_PUBLISH_SOURCES || 'remote,local,browser')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const strictPublish = process.env.GALLERY_STRICT_PUBLISH !== '0';

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function clearPublishedImages(dir: string): Promise<void> {
  if (!(await exists(dir))) return;
  const files = await fs.readdir(dir);
  await Promise.all(
    files
      .filter((f) => /\.(png|gif|webp|jpg|jpeg|json)$/i.test(f))
      .map((f) => fs.rm(path.join(dir, f), { force: true })),
  );
}

async function copyFirstExisting(
  candidates: string[],
): Promise<{ sourcePath: string; sourceMode: string } | null> {
  for (const candidate of candidates) {
    const [mode, ...rest] = candidate.split(':');
    const rel = rest.join(':');
    const sourcePath = path.join(ARTIFACTS_DIR, mode, rel);
    if (await exists(sourcePath)) {
      return { sourcePath, sourceMode: mode };
    }
  }
  return null;
}

async function main(): Promise<void> {
  const items = gallerySections.flatMap((section) =>
    section.items.map((item) => ({
      sectionId: section.id,
      sectionTitle: section.title,
      ...item,
    })),
  );

  const copyPlan: Array<{
    id: string;
    category: string;
    outputFile: string;
    sourceMode: string;
    sourcePath: string;
    isAnimated: boolean;
  }> = [];

  const published: Array<{
    id: string;
    category: string;
    file: string;
    sourceMode: string;
    sourcePath: string;
    isAnimated: boolean;
  }> = [];
  const missing: Array<{ id: string; category: string; expectedFile: string }> = [];

  for (const item of items) {
    const ext = item.isAnimated ? 'gif' : 'png';
    const outputFile = `${item.id}.${ext}`;
    const candidates: string[] = [];
    for (const mode of sourceOrder) {
      candidates.push(`${mode}:${outputFile}`);
      // static fallbacks (rare response-format differences)
      if (!item.isAnimated) {
        candidates.push(`${mode}:${item.id}.webp`);
        candidates.push(`${mode}:${item.id}.jpg`);
        candidates.push(`${mode}:${item.id}.jpeg`);
      }
    }

    const copied = await copyFirstExisting(candidates);
    if (!copied) {
      missing.push({ id: item.id, category: item.category, expectedFile: outputFile });
      continue;
    }

    copyPlan.push({
      id: item.id,
      category: item.category,
      outputFile,
      sourceMode: copied.sourceMode,
      sourcePath: copied.sourcePath,
      isAnimated: !!item.isAnimated,
    });
  }

  if (strictPublish && missing.length > 0) {
    console.log('\n=== Gallery Showcase Publish (aborted) ===\n');
    console.log(`Items:   ${items.length}`);
    console.log(`Missing: ${missing.length}`);
    console.log('Strict mode is enabled. Existing public/gallery artifacts were left unchanged.\n');
    console.log('Missing items (first 20):');
    for (const miss of missing.slice(0, 20)) {
      console.log(`  - ${miss.id} (${miss.category}) -> ${miss.expectedFile}`);
    }
    process.exitCode = 1;
    return;
  }

  await ensureDir(PUBLIC_GALLERY_DIR);
  await clearPublishedImages(PUBLIC_GALLERY_DIR);

  for (const entry of copyPlan) {
    const outputPath = path.join(PUBLIC_GALLERY_DIR, entry.outputFile);
    await fs.copyFile(entry.sourcePath, outputPath);
    published.push({
      id: entry.id,
      category: entry.category,
      file: entry.outputFile,
      sourceMode: entry.sourceMode,
      sourcePath: path.relative(ROOT, entry.sourcePath),
      isAnimated: entry.isAnimated,
    });
  }

  const manifest = {
    version: '3.0',
    generatedAt: new Date().toISOString(),
    sourceOrder,
    totalItems: items.length,
    publishedCount: published.length,
    missingCount: missing.length,
    published,
    missing,
  };

  const manifestPath = path.join(PUBLIC_GALLERY_DIR, 'showcase-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('\n=== Gallery Showcase Publish ===\n');
  console.log(`Items:      ${items.length}`);
  console.log(`Published:  ${published.length}`);
  console.log(`Missing:    ${missing.length}`);
  console.log(`Output dir: ${PUBLIC_GALLERY_DIR}`);
  console.log(`Manifest:   ${manifestPath}\n`);

  if (missing.length > 0) {
    console.log('Missing items (first 20):');
    for (const miss of missing.slice(0, 20)) {
      console.log(`  - ${miss.id} (${miss.category}) -> ${miss.expectedFile}`);
    }
    if (strictPublish) {
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error('[publish-gallery-showcase] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
