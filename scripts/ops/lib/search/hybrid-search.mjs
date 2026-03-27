/**
 * Hybrid Search — combines BM25 keyword search with embedding-based semantic search
 *
 * Uses Reciprocal Rank Fusion (RRF) to merge ranked result lists from two
 * complementary retrieval strategies:
 *   1. BM25 via MiniSearch  – fast, exact keyword matching
 *   2. Embedding similarity  – semantic / conceptual matching (optional, via Ollama)
 *
 * Gracefully degrades:
 *   hybrid → bm25-only → basic substring search
 *
 * Usage:
 *   import { searchFiles } from '../search/hybrid-search.mjs';
 *   const { files, count, method } = await searchFiles('auth middleware');
 */

import MiniSearch from 'minisearch';
import { readFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import { createLogger } from '../logger.mjs';

// Optional peer modules – may not exist yet; we handle import failures gracefully.
let generateEmbedding, cosineSimilarity, isOllamaAvailable;
let vectorSearch, isIndexReady;

try {
  ({ generateEmbedding, cosineSimilarity, isOllamaAvailable } = await import(
    '../rag/embeddings.mjs'
  ));
} catch {
  // embeddings module not available – will fall back to BM25-only
}

try {
  ({ search: vectorSearch, isIndexReady } = await import(
    '../rag/vector-store.mjs'
  ));
} catch {
  // vector-store module not available – will fall back to BM25-only
}

const { logDebug, logInfo, logWarn, logError } = createLogger('hybrid-search');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Standard RRF constant (k) — controls how quickly rank influence decays. */
const RRF_K = 60;

/** File extensions to index when scanning a project. */
const INDEXABLE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md',
]);

/** Directories to skip when scanning. */
const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'coverage', 'dist', 'build',
]);

/** Maximum file size (bytes) we will read and index. */
const MAX_FILE_BYTES = 512 * 1024; // 512 KB

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** @type {MiniSearch | null} */
let miniSearchIndex = null;

/** Fingerprint of the file set used to build the current index. */
let indexFingerprint = '';

/** Total number of documents in the current index. */
let indexedDocCount = 0;

/** Timestamp (ms) when the index was last built. */
let indexBuiltAt = 0;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a lightweight fingerprint for a list of file paths so we can
 * detect whether the index needs to be rebuilt.
 *
 * @param {Array<{path: string}>} files
 * @returns {string}
 */
function computeFingerprint(files) {
  // Sort for deterministic output; join paths + count is cheap and sufficient.
  const sorted = files.map((f) => f.path).sort();
  return `${sorted.length}:${sorted[0] ?? ''}:${sorted[sorted.length - 1] ?? ''}`;
}

/**
 * Extract a short snippet around the first occurrence of any query term.
 *
 * @param {string} content  Full document content
 * @param {string} query    Search query
 * @param {number} [radius=120] Characters to show around the match
 * @returns {string}
 */
function extractSnippet(content, query, radius = 120) {
  if (!content || !query) return '';

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const lower = content.toLowerCase();
  let bestIdx = -1;

  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      bestIdx = idx;
      break;
    }
  }

  if (bestIdx === -1) {
    // No match found — return the opening of the file.
    return content.slice(0, radius * 2).trim();
  }

  const start = Math.max(0, bestIdx - radius);
  const end = Math.min(content.length, bestIdx + radius);
  let snippet = content.slice(start, end).trim();

  if (start > 0) snippet = '…' + snippet;
  if (end < content.length) snippet = snippet + '…';

  return snippet;
}

/**
 * Check whether the embeddings subsystem is actually usable right now.
 *
 * @returns {Promise<boolean>}
 */
async function embeddingsAvailable() {
  try {
    if (!generateEmbedding || !cosineSimilarity) return false;
    if (isOllamaAvailable && !(await isOllamaAvailable())) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check whether the vector store is ready.
 *
 * @returns {boolean}
 */
function vectorStoreReady() {
  try {
    return typeof isIndexReady === 'function' && isIndexReady();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// BM25 Index (MiniSearch)
// ---------------------------------------------------------------------------

/**
 * Build (or rebuild) a BM25 index from an array of file descriptors.
 *
 * @param {Array<{path: string, content: string}>} files
 *   Each entry must have at least `path` and `content`.
 * @returns {MiniSearch}
 */
export function createHybridSearchIndex(files) {
  logInfo(`Building BM25 index over ${files.length} files`);

  const index = new MiniSearch({
    fields: ['path', 'content', 'filename'],
    storeFields: ['path', 'content'],
    searchOptions: {
      boost: { filename: 3, path: 2, content: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  const docs = files.map((f, i) => ({
    id: i + 1,
    path: f.path,
    content: f.content,
    filename: basename(f.path),
  }));

  index.addAll(docs);

  // Cache the index at module level.
  miniSearchIndex = index;
  indexFingerprint = computeFingerprint(files);
  indexedDocCount = docs.length;
  indexBuiltAt = Date.now();

  logInfo(`BM25 index ready — ${docs.length} documents indexed`);

  return index;
}

// ---------------------------------------------------------------------------
// Reciprocal Rank Fusion
// ---------------------------------------------------------------------------

/**
 * Merge two ranked result lists using Reciprocal Rank Fusion.
 *
 * @param {Array<{path: string, [key: string]: any}>} bm25Results
 * @param {Array<{path: string, [key: string]: any}>} embeddingResults
 * @param {number} bm25Weight   Weight for BM25 scores  (0–1)
 * @param {number} embeddingWeight Weight for embedding scores (0–1)
 * @returns {Array<{path: string, score: number, bm25Score: number, embeddingScore: number}>}
 */
function reciprocalRankFusion(
  bm25Results,
  embeddingResults,
  bm25Weight,
  embeddingWeight,
) {
  /** @type {Map<string, {bm25Score: number, embeddingScore: number, data: object}>} */
  const merged = new Map();

  // Score each BM25 result by its rank.
  for (let rank = 0; rank < bm25Results.length; rank++) {
    const r = bm25Results[rank];
    const rrfScore = 1 / (RRF_K + rank + 1);
    const entry = merged.get(r.path) || {
      bm25Score: 0,
      embeddingScore: 0,
      data: r,
    };
    entry.bm25Score = rrfScore;
    merged.set(r.path, entry);
  }

  // Score each embedding result by its rank.
  for (let rank = 0; rank < embeddingResults.length; rank++) {
    const r = embeddingResults[rank];
    const rrfScore = 1 / (RRF_K + rank + 1);
    const entry = merged.get(r.path) || {
      bm25Score: 0,
      embeddingScore: 0,
      data: r,
    };
    entry.embeddingScore = rrfScore;
    if (!entry.data.content && r.content) entry.data = r;
    merged.set(r.path, entry);
  }

  // Combine weighted scores.
  const results = [];
  for (const [path, entry] of merged) {
    const score =
      entry.bm25Score * bm25Weight + entry.embeddingScore * embeddingWeight;
    results.push({
      path,
      score,
      bm25Score: entry.bm25Score,
      embeddingScore: entry.embeddingScore,
      content: entry.data.content,
    });
  }

  // Sort descending by combined score.
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ---------------------------------------------------------------------------
// Hybrid Search
// ---------------------------------------------------------------------------

/**
 * Perform a hybrid search combining BM25 keyword matching with optional
 * embedding-based semantic search.
 *
 * @param {string} query  The search query.
 * @param {object} [options]
 * @param {number} [options.topK=20]            Number of final results to return.
 * @param {number} [options.bm25Weight=0.5]     Weight for BM25 in RRF (0–1).
 * @param {number} [options.embeddingWeight=0.5] Weight for embeddings in RRF (0–1).
 * @param {boolean} [options.useEmbeddings=true] Whether to attempt embedding search.
 * @returns {Promise<Array<{path: string, score: number, bm25Score: number, embeddingScore: number, snippet: string}>>}
 */
export async function hybridSearch(query, options = {}) {
  const {
    topK = 20,
    bm25Weight = 0.5,
    embeddingWeight = 0.5,
    useEmbeddings = true,
  } = options;

  if (!query || typeof query !== 'string') {
    logWarn('hybridSearch called with empty or invalid query');
    return [];
  }

  // ---- Step 1: BM25 search via MiniSearch ----
  let bm25Results = [];

  if (miniSearchIndex) {
    try {
      const raw = miniSearchIndex.search(query, { limit: 50 });
      bm25Results = raw.map((hit) => ({
        path: hit.path ?? '',
        content: hit.content ?? '',
        score: hit.score,
      }));
      logDebug(`BM25 returned ${bm25Results.length} results for "${query}"`);
    } catch (err) {
      logError('BM25 search failed', { error: err.message });
    }
  } else {
    logWarn('BM25 index not built — skipping keyword search');
  }

  // ---- Step 2: Embedding / vector search (optional) ----
  let embeddingResults = [];

  if (useEmbeddings) {
    try {
      const canEmbed = await embeddingsAvailable();
      const vectorReady = vectorStoreReady();

      if (canEmbed && vectorReady && vectorSearch) {
        const raw = await vectorSearch(query, 50);
        embeddingResults = (raw ?? []).map((hit) => ({
          path: hit.path ?? hit.id ?? '',
          content: hit.content ?? '',
          score: hit.score ?? 0,
        }));
        logDebug(
          `Embedding search returned ${embeddingResults.length} results for "${query}"`,
        );
      } else if (canEmbed && generateEmbedding && bm25Results.length > 0) {
        // Fallback: re-rank BM25 results using cosine similarity when vector
        // store is not ready but embeddings are available.
        logDebug('Vector store not ready — re-ranking BM25 via embeddings');
        const queryEmbedding = await generateEmbedding(query);
        if (queryEmbedding) {
          const scored = [];
          for (const r of bm25Results.slice(0, 50)) {
            try {
              const docEmbedding = await generateEmbedding(
                r.content.slice(0, 2048),
              );
              if (docEmbedding) {
                const sim = cosineSimilarity(queryEmbedding, docEmbedding);
                scored.push({ ...r, score: sim });
              }
            } catch {
              // skip individual failures
            }
          }
          scored.sort((a, b) => b.score - a.score);
          embeddingResults = scored;
        }
      } else {
        logDebug('Embeddings unavailable — using BM25-only search');
      }
    } catch (err) {
      logWarn('Embedding search failed — falling back to BM25-only', {
        error: err.message,
      });
    }
  }

  // ---- Step 3: Reciprocal Rank Fusion ----
  let finalResults;

  if (embeddingResults.length > 0 && bm25Results.length > 0) {
    finalResults = reciprocalRankFusion(
      bm25Results,
      embeddingResults,
      bm25Weight,
      embeddingWeight,
    );
  } else if (bm25Results.length > 0) {
    // BM25-only — normalise scores to 0–1 range.
    const maxScore = bm25Results[0]?.score || 1;
    finalResults = bm25Results.map((r) => ({
      path: r.path,
      score: r.score / maxScore,
      bm25Score: r.score / maxScore,
      embeddingScore: 0,
      content: r.content,
    }));
  } else if (embeddingResults.length > 0) {
    finalResults = embeddingResults.map((r) => ({
      path: r.path,
      score: r.score,
      bm25Score: 0,
      embeddingScore: r.score,
      content: r.content,
    }));
  } else {
    return [];
  }

  // ---- Step 4: Return top-K with snippets ----
  return finalResults.slice(0, topK).map((r) => ({
    path: r.path,
    score: r.score,
    bm25Score: r.bm25Score,
    embeddingScore: r.embeddingScore,
    snippet: extractSnippet(r.content ?? '', query),
  }));
}

// ---------------------------------------------------------------------------
// High-level file search
// ---------------------------------------------------------------------------

/**
 * Recursively collect indexable files starting from `rootDir`.
 *
 * @param {string} rootDir
 * @returns {Promise<Array<{path: string, content: string}>>}
 */
async function collectProjectFiles(rootDir) {
  const files = [];

  /**
   * Recursively walk a directory.
   * @param {string} dir
   */
  async function walk(dir) {
    let entries;
    try {
      const { readdir } = await import('node:fs/promises');
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) {
          await walk(fullPath);
        }
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = extname(entry.name);
      if (!INDEXABLE_EXTENSIONS.has(ext)) continue;

      try {
        const content = await readFile(fullPath, 'utf-8');
        if (content.length > MAX_FILE_BYTES) continue; // skip very large files

        files.push({
          path: relative(rootDir, fullPath),
          content,
        });
      } catch {
        // skip files we cannot read
      }
    }
  }

  await walk(rootDir);
  return files;
}

/**
 * High-level search entry point.
 *
 * Builds the BM25 index on first call (or when files change) and performs
 * a hybrid search.  Falls back to basic substring matching if all else fails.
 *
 * @param {string} query
 * @param {object} [options]
 * @param {string} [options.rootDir]   Project root (defaults to `process.cwd()`).
 * @param {number} [options.topK=20]
 * @param {boolean} [options.useEmbeddings=true]
 * @returns {Promise<{files: string[], count: number, query: string, method: 'hybrid'|'bm25'|'basic'}>}
 */
export async function searchFiles(query, options = {}) {
  const {
    rootDir = process.cwd(),
    topK = 20,
    useEmbeddings = true,
  } = options;

  if (!query || typeof query !== 'string') {
    return { files: [], count: 0, query: query ?? '', method: 'basic' };
  }

  try {
    // ---- Collect files & build index if needed ----
    const projectFiles = await collectProjectFiles(rootDir);
    const fp = computeFingerprint(projectFiles);

    if (!miniSearchIndex || fp !== indexFingerprint) {
      createHybridSearchIndex(projectFiles);
    }

    // ---- Run hybrid search ----
    const results = await hybridSearch(query, { topK, useEmbeddings });

    if (results.length > 0) {
      const hasEmbeddings = results.some((r) => r.embeddingScore > 0);
      const method = hasEmbeddings ? 'hybrid' : 'bm25';
      return {
        files: results.map((r) => r.path),
        count: results.length,
        query,
        method,
      };
    }

    // ---- Fallback: basic substring search ----
    logDebug('No BM25/hybrid results — falling back to basic substring search');
    const lowerQuery = query.toLowerCase();
    const basicMatches = projectFiles
      .filter(
        (f) =>
          f.path.toLowerCase().includes(lowerQuery) ||
          f.content.toLowerCase().includes(lowerQuery),
      )
      .slice(0, topK)
      .map((f) => f.path);

    return {
      files: basicMatches,
      count: basicMatches.length,
      query,
      method: 'basic',
    };
  } catch (err) {
    logError('searchFiles failed', { error: err.message });
    return { files: [], count: 0, query, method: 'basic' };
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * Return statistics about the current search index.
 *
 * @returns {{
 *   indexed: boolean,
 *   documentCount: number,
 *   builtAt: string | null,
 *   embeddingsAvailable: boolean,
 *   vectorStoreReady: boolean,
 * }}
 */
export function getSearchStats() {
  return {
    indexed: miniSearchIndex !== null,
    documentCount: indexedDocCount,
    builtAt: indexBuiltAt ? new Date(indexBuiltAt).toISOString() : null,
    embeddingsAvailable: typeof generateEmbedding === 'function',
    vectorStoreReady: vectorStoreReady(),
  };
}
