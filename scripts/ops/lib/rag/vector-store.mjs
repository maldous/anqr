/**
 * vector-store.mjs — File-based vector store for RAG pipeline
 *
 * Stores chunked and embedded code/document vectors on disk as JSON.
 * Supports incremental indexing (skip unchanged files), cosine-similarity
 * search, and atomic writes for crash safety.
 *
 * Index location: reports/rag-index/  (gitignored)
 *
 * Each index entry contains:
 *   - filePath, chunk content, embedding vector
 *   - lastModified timestamp (for change detection)
 *   - chunk metadata (startLine, endLine, type)
 *
 * Usage:
 *   import { indexFile, indexDirectory, search, getIndexStats } from './vector-store.mjs';
 *   await indexDirectory('src/');
 *   const results = await search('authentication middleware', 5);
 */

import { readFile, writeFile, rename, unlink, mkdir, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createLogger } from "../logger.mjs";
import { chunkFile, collectFiles } from "./chunker.mjs";
import { generateEmbedding, generateEmbeddings, cosineSimilarity, isOllamaAvailable } from "./embeddings.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-vector-store");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Directory where the index is persisted */
const INDEX_DIR = resolve("reports/rag-index");

/** Main index file */
const INDEX_FILE = join(INDEX_DIR, "index.json");

/** Metadata file tracking per-file modification times */
const META_FILE = join(INDEX_DIR, "meta.json");

// ---------------------------------------------------------------------------
// In-memory state
// ---------------------------------------------------------------------------

/**
 * @typedef {object} IndexEntry
 * @property {string} id - Unique chunk ID
 * @property {string} filePath - Source file path
 * @property {string} content - Chunk text content
 * @property {number[]} embedding - Embedding vector
 * @property {number} startLine - Start line in source file
 * @property {number} endLine - End line in source file
 * @property {string} type - Chunk type (function|class|section|paragraph|block)
 * @property {number} lastModified - File mtime epoch ms when indexed
 */

/** @type {IndexEntry[] | null} */
let indexCache = null;

/**
 * Per-file metadata: filePath → { lastModified, chunkCount }
 * @type {Map<string, { lastModified: number, chunkCount: number }> | null}
 */
let metaCache = null;

/** Whether the index has been loaded from disk at least once */
let indexLoaded = false;

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Ensure the index directory exists
 */
async function ensureIndexDir() {
  try {
    await mkdir(INDEX_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") {
      logError(`Failed to create index directory: ${err.message}`);
      throw err;
    }
  }
}

/**
 * Atomically write JSON data to a file (write to temp, then rename).
 * This prevents partial/corrupt writes on crash.
 *
 * @param {string} targetPath - Final file path
 * @param {*} data - JSON-serializable data
 */
async function atomicWriteJSON(targetPath, data) {
  const tmpPath = `${targetPath}.${randomUUID()}.tmp`;
  try {
    const json = JSON.stringify(data);
    await writeFile(tmpPath, json, "utf-8");
    await rename(tmpPath, targetPath);
    logDebug(`Wrote ${targetPath} (${(json.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    // Clean up temp file on failure
    try {
      await unlink(tmpPath);
    } catch {
      // Temp file may not exist; ignore
    }
    throw err;
  }
}

/**
 * Load the index from disk into memory (lazy, only on first access).
 */
async function loadIndex() {
  if (indexLoaded) return;

  try {
    const raw = await readFile(INDEX_FILE, "utf-8");
    indexCache = JSON.parse(raw);
    logInfo(`Loaded index: ${indexCache.length} entries`);
  } catch (err) {
    if (err.code === "ENOENT") {
      logDebug("No existing index found, starting fresh");
      indexCache = [];
    } else {
      logError(`Failed to load index: ${err.message}`);
      indexCache = [];
    }
  }

  try {
    const raw = await readFile(META_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    metaCache = new Map(Object.entries(parsed));
    logDebug(`Loaded metadata for ${metaCache.size} files`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      logWarn(`Failed to load metadata: ${err.message}`);
    }
    metaCache = new Map();
  }

  indexLoaded = true;
}

/**
 * Persist the current in-memory index and metadata to disk.
 */
async function saveIndex() {
  await ensureIndexDir();

  try {
    await atomicWriteJSON(INDEX_FILE, indexCache || []);

    const metaObj = Object.fromEntries(metaCache || new Map());
    await atomicWriteJSON(META_FILE, metaObj);

    logInfo(`Index saved: ${(indexCache || []).length} entries, ${(metaCache || new Map()).size} files`);
  } catch (err) {
    logError(`Failed to save index: ${err.message}`);
    throw err;
  }
}

/**
 * Get the modification time of a file (epoch ms).
 * @param {string} filePath - File path
 * @returns {Promise<number>} mtime in milliseconds
 */
async function getFileMtime(filePath) {
  try {
    const s = await stat(resolve(filePath));
    return s.mtimeMs;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Index a single file: chunk it, generate embeddings, and store in the index.
 *
 * Skips re-indexing if the file's mtime hasn't changed since last index.
 *
 * @param {string} filePath - Path to the file to index
 * @param {object} [options] - Options passed through to the chunker
 * @returns {Promise<{ indexed: boolean, chunks: number }>} Result summary
 */
export async function indexFile(filePath, options = {}) {
  await loadIndex();

  const resolvedPath = resolve(filePath);
  const mtime = await getFileMtime(resolvedPath);

  // Check if file has changed since last index
  const existing = metaCache.get(resolvedPath);
  if (existing && existing.lastModified >= mtime) {
    logDebug(`Skipping unchanged file: ${filePath}`);
    return { indexed: false, chunks: existing.chunkCount };
  }

  // Check Ollama availability before doing work
  const available = await isOllamaAvailable();
  if (!available) {
    logWarn(`Ollama unavailable — cannot index ${filePath}`);
    return { indexed: false, chunks: 0 };
  }

  logInfo(`Indexing file: ${filePath}`);

  // Remove old entries for this file
  indexCache = indexCache.filter((entry) => resolve(entry.filePath) !== resolvedPath);

  // Chunk the file
  const chunks = await chunkFile(filePath, options);
  if (chunks.length === 0) {
    logDebug(`No chunks produced for ${filePath}`);
    metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: 0 });
    await saveIndex();
    return { indexed: true, chunks: 0 };
  }

  // Generate embeddings for all chunks
  const texts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(texts);

  // Build index entries (skip chunks that failed to embed)
  let addedCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (embeddings[i] === null) {
      logWarn(`Skipping chunk ${i} of ${filePath} — embedding failed`);
      continue;
    }

    indexCache.push({
      id: chunks[i].id,
      filePath: chunks[i].filePath,
      content: chunks[i].content,
      embedding: embeddings[i],
      startLine: chunks[i].startLine,
      endLine: chunks[i].endLine,
      type: chunks[i].type,
      lastModified: mtime,
    });
    addedCount++;
  }

  // Update metadata
  metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: addedCount });

  // Persist
  await saveIndex();

  logInfo(`Indexed ${filePath}: ${addedCount} chunks embedded`);
  return { indexed: true, chunks: addedCount };
}

/** Supported extensions for indexing (mirrors chunker defaults) */
const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".json"];

/** Save to disk every N files to bound memory and prevent data loss */
const SAVE_INTERVAL = 10;

/**
 * Index all supported files in a directory (recursively).
 *
 * Processes files one at a time to avoid holding all chunks in memory.
 * Files that haven't changed since last index are skipped.
 * The index is persisted to disk every {@link SAVE_INTERVAL} files.
 *
 * @param {string} dirPath - Directory to index
 * @param {object} [options] - Options passed through to the chunker
 * @returns {Promise<{ totalFiles: number, indexedFiles: number, totalChunks: number }>}
 */
export async function indexDirectory(dirPath, options = {}) {
  await loadIndex();

  const available = await isOllamaAvailable();
  if (!available) {
    logError("Ollama unavailable — cannot index directory");
    return { totalFiles: 0, indexedFiles: 0, totalChunks: 0 };
  }

  logInfo(`Indexing directory: ${dirPath}`);

  const files = await collectFiles(resolve(dirPath), SUPPORTED_EXTENSIONS);
  logInfo(`Found ${files.length} supported files`);

  let indexedFiles = 0;
  let totalChunks = 0;
  let dirtyCount = 0;

  for (const filePath of files) {
    const resolvedPath = resolve(filePath);
    const mtime = await getFileMtime(resolvedPath);

    const existing = metaCache.get(resolvedPath);
    if (existing && existing.lastModified >= mtime) {
      logDebug(`Skipping unchanged: ${filePath}`);
      totalChunks += existing.chunkCount;
      continue;
    }

    // Remove old entries for this file
    indexCache = indexCache.filter((entry) => resolve(entry.filePath) !== resolvedPath);

    // Chunk just this one file
    const chunks = await chunkFile(filePath, options);
    if (chunks.length === 0) {
      metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: 0 });
      dirtyCount++;
      continue;
    }

    // Generate embeddings for this file's chunks only
    const texts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(texts);

    let addedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      if (embeddings[i] === null) continue;

      indexCache.push({
        id: chunks[i].id,
        filePath: chunks[i].filePath,
        content: chunks[i].content,
        embedding: embeddings[i],
        startLine: chunks[i].startLine,
        endLine: chunks[i].endLine,
        type: chunks[i].type,
        lastModified: mtime,
      });
      addedCount++;
    }

    metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: addedCount });
    totalChunks += addedCount;
    indexedFiles++;
    dirtyCount++;

    // Persist periodically to bound memory and avoid data loss
    if (dirtyCount >= SAVE_INTERVAL) {
      await saveIndex();
      dirtyCount = 0;
    }
  }

  // Final persist
  if (dirtyCount > 0) {
    await saveIndex();
  }

  logInfo(`Directory indexing complete: ${indexedFiles}/${files.length} files indexed, ${totalChunks} total chunks`);
  return { totalFiles: files.length, indexedFiles, totalChunks };
}

/**
 * Search the index for chunks most similar to a query string.
 *
 * Embeds the query using Ollama, then ranks all index entries by cosine
 * similarity and returns the top-K results.
 *
 * @param {string} query - Natural language or code search query
 * @param {number} [topK=5] - Number of results to return
 * @returns {Promise<Array<{ score: number, filePath: string, content: string, startLine: number, endLine: number, type: string }>>}
 */
export async function search(query, topK = 5) {
  await loadIndex();

  if (!indexCache || indexCache.length === 0) {
    logWarn("Search called on empty index");
    return [];
  }

  // Embed the query
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    logError("Failed to embed search query — is Ollama running?");
    return [];
  }

  // Score every entry
  const scored = [];
  for (const entry of indexCache) {
    if (!entry.embedding) continue;

    try {
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      scored.push({
        score,
        filePath: entry.filePath,
        content: entry.content,
        startLine: entry.startLine,
        endLine: entry.endLine,
        type: entry.type,
      });
    } catch (err) {
      logDebug(`Similarity computation failed for ${entry.id}: ${err.message}`);
    }
  }

  // Sort by descending similarity
  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, topK);
  logInfo(`Search for "${query.slice(0, 60)}…": ${results.length} results (top score: ${results[0]?.score?.toFixed(4) || "N/A"})`);

  return results;
}

/**
 * Return statistics about the current index.
 *
 * @returns {Promise<{ totalEntries: number, totalFiles: number, indexSizeBytes: number, types: Record<string, number> }>}
 */
export async function getIndexStats() {
  await loadIndex();

  const entries = indexCache || [];
  const files = new Set(entries.map((e) => e.filePath));

  // Count chunk types
  const types = {};
  for (const entry of entries) {
    types[entry.type] = (types[entry.type] || 0) + 1;
  }

  // Estimate on-disk size
  let indexSizeBytes = 0;
  try {
    const s = await stat(INDEX_FILE);
    indexSizeBytes = s.size;
  } catch {
    // Index file may not exist yet
  }

  return {
    totalEntries: entries.length,
    totalFiles: files.size,
    indexSizeBytes,
    types,
  };
}

/**
 * Remove all stored embeddings and metadata.
 *
 * @returns {Promise<void>}
 */
export async function clearIndex() {
  logInfo("Clearing RAG index");

  indexCache = [];
  metaCache = new Map();
  indexLoaded = true;

  try {
    await ensureIndexDir();
    await atomicWriteJSON(INDEX_FILE, []);
    await atomicWriteJSON(META_FILE, {});
    logInfo("Index cleared");
  } catch (err) {
    logError(`Failed to clear index: ${err.message}`);
    throw err;
  }
}

/**
 * Check if the index has been built and contains entries.
 * Synchronous check — returns false if the index hasn't been loaded yet.
 *
 * @returns {boolean} true if the index has been loaded and has at least one entry
 */
export function isIndexReady() {
  if (!indexLoaded) return false;
  return (indexCache || []).length > 0;
}
