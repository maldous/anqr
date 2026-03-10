#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const assetsDir = path.join(distDir, 'assets');
const reportJsonPath = path.join(root, 'reports', 'performance-budget.json');
const reportMdPath = path.join(root, 'reports', 'performance-budget.md');

function toKiB(bytes) {
  return bytes / 1024;
}

function readBudget(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function ensureBuildArtifacts() {
  if (!fs.existsSync(distDir)) {
    throw new Error('dist not found. Run `npm run build` first.');
  }
  if (!fs.existsSync(assetsDir)) {
    throw new Error('dist/assets not found. Run `npm run build` first.');
  }
}

function getEntryChunkFromHtml() {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error('dist/index.html not found. Run `npm run build` first.');
  }

  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const match = html.match(/<script[^>]*type="module"[^>]*src="\/assets\/([^"]+\.js)"/u);
  if (!match) {
    throw new Error('Could not find module entry script in dist/index.html.');
  }
  return match[1];
}

function parseChunkEdges(chunkSource) {
  const staticImports = new Set();
  const dynamicImports = new Set();

  const staticPattern = /from\s+["']\.\/([^"']+\.js)["']/gu;
  const bareStaticPattern = /import\s+["']\.\/([^"']+\.js)["']/gu;
  const dynamicPattern = /import\(\s*["']\.\/([^"']+\.js)["']\s*\)/gu;

  for (const match of chunkSource.matchAll(staticPattern)) {
    staticImports.add(match[1]);
  }
  for (const match of chunkSource.matchAll(bareStaticPattern)) {
    staticImports.add(match[1]);
  }
  for (const match of chunkSource.matchAll(dynamicPattern)) {
    dynamicImports.add(match[1]);
  }

  return {
    staticImports: [...staticImports],
    dynamicImports: [...dynamicImports],
  };
}

function buildGraph(jsFiles) {
  const graph = new Map();

  for (const file of jsFiles) {
    const source = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    graph.set(file, parseChunkEdges(source));
  }

  return graph;
}

function walkStaticDeps(graph, startFile, visited = new Set()) {
  if (!graph.has(startFile) || visited.has(startFile)) {
    return visited;
  }

  visited.add(startFile);
  for (const dep of graph.get(startFile).staticImports) {
    walkStaticDeps(graph, dep, visited);
  }
  return visited;
}

function findGalleryChunk(entryGraph, jsFiles) {
  const dynamicDeps = [...entryGraph.dynamicImports];

  const byName = dynamicDeps.find((name) => /gallery-/iu.test(name) || /Gallery-/u.test(name));
  if (byName) return byName;

  // Some builds route through an intermediate chunk where /gallery is no longer
  // a direct dynamic import from the entry chunk.
  const fallbackByFilename = jsFiles.find((name) => /(^|-)gallery-/iu.test(name));
  if (fallbackByFilename) return fallbackByFilename;

  throw new Error('Could not identify gallery route chunk from entry dynamic imports.');
}

function sumBytes(files) {
  let total = 0;
  for (const file of files) {
    total += fs.statSync(path.join(assetsDir, file)).size;
  }
  return total;
}

function buildMarkdown(report) {
  const lines = [
    '# Performance Budget Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Entry path (/) JS: ${toKiB(report.metrics.entryPathBytes).toFixed(1)} KiB (max ${report.budgets.entryPathMaxKiB} KiB)`,
    `- Gallery path (/gallery) JS: ${toKiB(report.metrics.galleryPathBytes).toFixed(1)} KiB (max ${report.budgets.galleryPathMaxKiB} KiB)`,
    '',
    '## Status',
    '',
    `- /: ${report.status.entryPath}`,
    `- /gallery: ${report.status.galleryPath}`,
    '',
    '## Chunks',
    '',
    `- / chunks (${report.metrics.entryPathChunks.length}): ${report.metrics.entryPathChunks.join(', ')}`,
    `- /gallery extra chunks (${report.metrics.galleryExtraChunks.length}): ${report.metrics.galleryExtraChunks.join(', ')}`,
  ];

  return `${lines.join('\n')}\n`;
}

function main() {
  ensureBuildArtifacts();

  const entryPathMaxKiB = readBudget('PERF_BUDGET_ENTRY_PATH_KIB', 2300);
  const galleryPathMaxKiB = readBudget('PERF_BUDGET_GALLERY_PATH_KIB', 2600);

  const jsFiles = fs
    .readdirSync(assetsDir)
    .filter((name) => name.endsWith('.js'))
    .sort();
  if (jsFiles.length === 0) {
    throw new Error('No JS chunks found in dist/assets.');
  }

  const graph = buildGraph(jsFiles);
  const entryFile = getEntryChunkFromHtml();
  const entryGraph = graph.get(entryFile);
  if (!entryGraph) {
    throw new Error(`Entry chunk ${entryFile} not found in dist/assets.`);
  }

  const entryChunkSet = walkStaticDeps(graph, entryFile);
  const galleryChunk = findGalleryChunk(entryGraph, jsFiles);
  const galleryChunkSet = walkStaticDeps(graph, galleryChunk);

  const entryPathChunks = [...entryChunkSet].sort();
  const galleryExtraChunks = [...galleryChunkSet].filter((file) => !entryChunkSet.has(file)).sort();
  const galleryPathChunks = [...new Set([...entryPathChunks, ...galleryExtraChunks])].sort();

  const entryPathBytes = sumBytes(entryPathChunks);
  const galleryPathBytes = sumBytes(galleryPathChunks);

  const entryPathStatus = toKiB(entryPathBytes) <= entryPathMaxKiB ? 'PASS' : 'FAIL';
  const galleryPathStatus = toKiB(galleryPathBytes) <= galleryPathMaxKiB ? 'PASS' : 'FAIL';

  const report = {
    generatedAt: new Date().toISOString(),
    budgets: {
      entryPathMaxKiB,
      galleryPathMaxKiB,
    },
    metrics: {
      entryChunk: entryFile,
      galleryChunk,
      jsChunkCount: jsFiles.length,
      entryPathBytes,
      galleryPathBytes,
      entryPathChunks,
      galleryExtraChunks,
      galleryPathChunks,
    },
    status: {
      entryPath: entryPathStatus,
      galleryPath: galleryPathStatus,
    },
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, buildMarkdown(report));

  console.log(
    '[perf-budget] /:',
    `${toKiB(entryPathBytes).toFixed(1)} KiB`,
    `(${entryPathStatus})`
  );
  console.log(
    '[perf-budget] /gallery:',
    `${toKiB(galleryPathBytes).toFixed(1)} KiB`,
    `(${galleryPathStatus})`
  );

  if (entryPathStatus === 'FAIL' || galleryPathStatus === 'FAIL') {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('[perf-budget] failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
