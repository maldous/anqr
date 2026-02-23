#!/usr/bin/env node

/**
 * Analyze visual similarity across generated gallery artifacts.
 *
 * Defaults:
 *   Input dir: reports/gallery-artifacts/local
 *   Output JSON: reports/gallery-artifacts/local/visual-similarity-report.json
 *   Output MD: reports/gallery-artifacts/local/visual-similarity-report.md
 *
 * Env:
 *   GALLERY_VIS_DIR               Override input directory
 *   GALLERY_VIS_THRESHOLD_BITS    pHash hamming distance threshold (default: 6)
 *   GALLERY_VIS_SAMPLE_MAX        Max files to analyze (default: all)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DIR = path.join(ROOT, 'reports', 'gallery-artifacts', 'local');
const INPUT_DIR = path.resolve(process.env.GALLERY_VIS_DIR || DEFAULT_DIR);
const DIST_THRESHOLD = Math.max(
  0,
  Number.parseInt(process.env.GALLERY_VIS_THRESHOLD_BITS || '6', 10)
);
const SAMPLE_MAX = Math.max(0, Number.parseInt(process.env.GALLERY_VIS_SAMPLE_MAX || '0', 10));

const IMAGE_EXT_RE = /\.(png|gif|webp|jpg|jpeg)$/i;

function createDctCosTable(n) {
  const table = Array.from({ length: n }, () => new Float64Array(n));
  for (let u = 0; u < n; u++) {
    for (let x = 0; x < n; x++) {
      table[u][x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n));
    }
  }
  return table;
}

const DCT_N = 32;
const PHASH_N = 8;
const DCT_COS = createDctCosTable(DCT_N);

function dct2(input) {
  const n = input.length;
  const temp = Array.from({ length: n }, () => new Float64Array(n));
  const out = Array.from({ length: n }, () => new Float64Array(n));

  for (let u = 0; u < n; u++) {
    const au = u === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n);
    for (let y = 0; y < n; y++) {
      let sum = 0;
      for (let x = 0; x < n; x++) {
        sum += input[x][y] * DCT_COS[u][x];
      }
      temp[u][y] = au * sum;
    }
  }

  for (let u = 0; u < n; u++) {
    for (let v = 0; v < n; v++) {
      const av = v === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n);
      let sum = 0;
      for (let y = 0; y < n; y++) {
        sum += temp[u][y] * DCT_COS[v][y];
      }
      out[u][v] = av * sum;
    }
  }

  return out;
}

function computePhashFromCanvas(canvas) {
  const n = DCT_N;
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, n, n).data;

  const gray = Array.from({ length: n }, () => new Float64Array(n));
  let idx = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = data[idx++];
      const g = data[idx++];
      const b = data[idx++];
      idx++; // alpha
      gray[x][y] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }

  const coeffs = dct2(gray);
  const low = [];
  for (let y = 0; y < PHASH_N; y++) {
    for (let x = 0; x < PHASH_N; x++) {
      if (x === 0 && y === 0) continue;
      low.push(coeffs[x][y]);
    }
  }

  const sorted = [...low].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  let bits = 0n;
  let bitIndex = 0n;
  for (let y = 0; y < PHASH_N; y++) {
    for (let x = 0; x < PHASH_N; x++) {
      if (x === 0 && y === 0) continue;
      if (coeffs[x][y] > median) bits |= 1n << bitIndex;
      bitIndex++;
    }
  }

  // Make it 64-bit by appending a deterministic final bit from DC sign.
  if (coeffs[0][0] > 0) bits |= 1n << 63n;
  return bits;
}

function popcountBigInt(v) {
  let x = v;
  let c = 0;
  while (x) {
    x &= x - 1n;
    c++;
  }
  return c;
}

function hammingDistance(a, b) {
  return popcountBigInt(a ^ b);
}

function bigIntHex64(v) {
  return v.toString(16).padStart(16, '0');
}

class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else {
      this.parent[rb] = ra;
      this.rank[ra]++;
    }
  }
}

function getCategory(filename) {
  const m = filename.match(/^([a-z]+)__/);
  if (m) return m[1];
  const dash = filename.indexOf('-');
  if (dash > 0) return filename.slice(0, dash);
  return 'unknown';
}

async function buildFeatures(filePath, filename) {
  const img = await loadImage(filePath);
  const canvas = createCanvas(DCT_N, DCT_N);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, DCT_N, DCT_N);
  const phash = computePhashFromCanvas(canvas);

  return {
    filename,
    category: getCategory(filename),
    ext: path.extname(filename).toLowerCase().slice(1),
    phashHex: bigIntHex64(phash),
    phashBits: phash,
  };
}

async function main() {
  const allNames = (await fs.readdir(INPUT_DIR))
    .filter((name) => IMAGE_EXT_RE.test(name))
    .sort((a, b) => a.localeCompare(b));

  const names = SAMPLE_MAX > 0 ? allNames.slice(0, SAMPLE_MAX) : allNames;
  if (names.length === 0) {
    throw new Error(`No image artifacts found in ${INPUT_DIR}`);
  }

  console.log(`Analyzing ${names.length} images from ${INPUT_DIR}`);
  console.log(`Similarity threshold: <= ${DIST_THRESHOLD} bits\n`);

  const features = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const filePath = path.join(INPUT_DIR, name);
    try {
      const f = await buildFeatures(filePath, name);
      features.push(f);
    } catch (err) {
      console.warn(`  [WARN] failed to hash ${name}: ${err.message}`);
    }

    if ((i + 1) % 100 === 0 || i + 1 === names.length) {
      console.log(`  hashed ${i + 1}/${names.length}`);
    }
  }

  const n = features.length;
  const dsu = new DSU(n);
  let _edgeCount = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      // Keep clustering within same category for practical swap decisions.
      if (features[i].category !== features[j].category) continue;
      const d = hammingDistance(features[i].phashBits, features[j].phashBits);
      if (d <= DIST_THRESHOLD) {
        dsu.union(i, j);
        _edgeCount++;
      }
    }
  }

  const clustersByRoot = new Map();
  for (let i = 0; i < n; i++) {
    const root = dsu.find(i);
    const arr = clustersByRoot.get(root) || [];
    arr.push(features[i]);
    clustersByRoot.set(root, arr);
  }

  const clusters = [...clustersByRoot.values()]
    .filter((c) => c.length > 1)
    .sort((a, b) => b.length - a.length)
    .map((items) => ({
      size: items.length,
      category: items[0].category,
      files: items.map((x) => x.filename),
      phashes: items.map((x) => x.phashHex),
    }));

  const clusterMemberCount = clusters.reduce((sum, c) => sum + c.size, 0);
  const uniqueStandaloneCount = n - clusterMemberCount;

  const summary = {
    generatedAt: new Date().toISOString(),
    inputDir: INPUT_DIR,
    thresholdBits: DIST_THRESHOLD,
    totalFiles: n,
    similarClusters: clusters.length,
    clusteredFiles: clusterMemberCount,
    standaloneFiles: uniqueStandaloneCount,
    categoryStats: Object.fromEntries(
      [...new Set(features.map((f) => f.category))].sort().map((cat) => {
        const catFiles = features.filter((f) => f.category === cat);
        const catClustered = clusters
          .filter((c) => c.category === cat)
          .reduce((sum, c) => sum + c.size, 0);
        return [
          cat,
          {
            total: catFiles.length,
            clustered: catClustered,
            standalone: catFiles.length - catClustered,
            clusters: clusters.filter((c) => c.category === cat).length,
          },
        ];
      })
    ),
  };

  const report = {
    summary,
    clusters,
  };

  const jsonPath = path.join(INPUT_DIR, 'visual-similarity-report.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const mdLines = [
    '# Gallery Visual Similarity Report',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Input dir: \`${summary.inputDir}\``,
    `- Threshold: <= ${summary.thresholdBits} pHash bits`,
    `- Total files: ${summary.totalFiles}`,
    `- Similar clusters: ${summary.similarClusters}`,
    `- Clustered files: ${summary.clusteredFiles}`,
    `- Standalone files: ${summary.standaloneFiles}`,
    '',
    '## By Category',
    '',
    '| Category | Total | Clustered | Standalone | Clusters |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...Object.entries(summary.categoryStats).map(
      ([cat, s]) => `| ${cat} | ${s.total} | ${s.clustered} | ${s.standalone} | ${s.clusters} |`
    ),
    '',
    '## Largest Similarity Clusters',
    '',
  ];

  if (clusters.length === 0) {
    mdLines.push('No similar clusters found at the selected threshold.');
  } else {
    const top = clusters.slice(0, 40);
    for (const [idx, cluster] of top.entries()) {
      mdLines.push(`### ${idx + 1}. ${cluster.category} (size ${cluster.size})`);
      mdLines.push('');
      for (const file of cluster.files) {
        mdLines.push(`- ${file}`);
      }
      mdLines.push('');
    }
  }

  const mdPath = path.join(INPUT_DIR, 'visual-similarity-report.md');
  await fs.writeFile(mdPath, `${mdLines.join('\n')}\n`);

  console.log('\nDone.');
  console.log(`JSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}`);
  console.log(
    `\nSummary: ${summary.totalFiles} files, ${summary.similarClusters} similar clusters, ${summary.standaloneFiles} standalone`
  );
}

main().catch((err) => {
  console.error('[analyze-gallery-visual-similarity] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
