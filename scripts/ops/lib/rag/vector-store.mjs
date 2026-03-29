/**
 * vector-store.mjs — File-based vector store for the RAG pipeline
 *
 * Improvements over the baseline:
 *   - project root detection is git-aware instead of cwd-fragile
 *   - stored file paths are repo-relative where possible for cleaner retrieval
 *   - pruning is part of the public API so builders do not hand-edit index files
 *   - Ollama health checks can be skipped when already proven for a batch run
 *   - lazy readiness check works before the in-memory cache has been loaded
 */

import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, relative, resolve } from "node:path";
import { createLogger } from "../logger.mjs";
import { chunkFile, collectFiles } from "./chunker.mjs";
import {
  cosineSimilarity,
  generateEmbedding,
  generateEmbeddings,
  isOllamaAvailable,
} from "./embeddings.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("rag-vector-store");

function detectProjectRoot() {
  if (process.env.RAG_PROJECT_ROOT) {
    return resolve(process.env.RAG_PROJECT_ROOT);
  }

  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return resolve(process.cwd());
  }
}

const PROJECT_ROOT = detectProjectRoot();
const INDEX_DIR = resolve(PROJECT_ROOT, "reports/rag-index");
const INDEX_FILE = join(INDEX_DIR, "index.json");
const META_FILE = join(INDEX_DIR, "meta.json");
const DEFAULT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".md",
  ".mdx",
  ".json",
  ".css",
  ".html",
  ".yml",
  ".yaml",
  ".sh",
  ".py",
  ".service",
  ".timer",
  ".java",
  ".kt",
  ".swift",
  ".gradle",
  ".properties",
  ".xml",
  ".plist",
  ".pbxproj",
  ".xcconfig",
];
const DIRECTORY_SAVE_INTERVAL = 10;

/** @type {Array<any> | null} */
let indexCache = null;
/** @type {Map<string, { lastModified: number, chunkCount: number }> | null} */
let metaCache = null;
let indexLoaded = false;
let indexDirty = false;

function normalizePathString(value) {
  return String(value || "").replaceAll(/\\/g, "/");
}

function toResolvedPath(filePath) {
  const value = String(filePath || "");
  return normalizePathString(isAbsolute(value) ? resolve(value) : resolve(PROJECT_ROOT, value));
}

function toStoredPath(filePath) {
  const resolvedPath = toResolvedPath(filePath);
  const rel = normalizePathString(relative(PROJECT_ROOT, resolvedPath));
  if (rel && !rel.startsWith("../") && rel !== "..") return rel;
  return resolvedPath;
}

function sanitizeMetaRecord(value) {
  const lastModified = Number(value?.lastModified || 0);
  const chunkCount = Number(value?.chunkCount || 0);
  return {
    lastModified: Number.isFinite(lastModified) && lastModified >= 0 ? lastModified : 0,
    chunkCount: Number.isFinite(chunkCount) && chunkCount >= 0 ? chunkCount : 0,
  };
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    typeof entry.filePath === "string" &&
    typeof entry.content === "string" &&
    Array.isArray(entry.embedding) &&
    Number.isFinite(entry.startLine) &&
    Number.isFinite(entry.endLine) &&
    typeof entry.type === "string"
  );
}

async function ensureIndexDir() {
  await mkdir(INDEX_DIR, { recursive: true });
}

async function atomicWriteJSON(targetPath, data) {
  const tmpPath = `${targetPath}.${randomUUID()}.tmp`;
  try {
    const json = JSON.stringify(data);
    await writeFile(tmpPath, json, "utf-8");
    await rename(tmpPath, targetPath);
    logDebug(`Wrote ${targetPath} (${(json.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    try {
      await unlink(tmpPath);
    } catch {
      // ignore tmp cleanup failure
    }
    throw err;
  }
}

async function loadIndex() {
  if (indexLoaded) return;

  try {
    const raw = await readFile(INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    indexCache = Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
    logInfo(`Loaded index: ${indexCache.length} entries`);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      logWarn(`Failed to load index: ${err?.message || err}`);
    }
    indexCache = [];
  }

  try {
    const raw = await readFile(META_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const entries = Object.entries(parsed || {}).map(([filePath, value]) => [
      toResolvedPath(filePath),
      sanitizeMetaRecord(value),
    ]);
    metaCache = new Map(entries);
    logDebug(`Loaded metadata for ${metaCache.size} files`);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      logWarn(`Failed to load metadata: ${err?.message || err}`);
    }
    metaCache = new Map();
  }

  indexLoaded = true;
  indexDirty = false;
}

function markDirty() {
  indexDirty = true;
}

async function saveIndex() {
  await ensureIndexDir();
  await loadIndex();

  if (!indexDirty) {
    return;
  }

  const indexToWrite = indexCache || [];
  const metaToWrite = Object.fromEntries(
    Array.from(metaCache || new Map())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([filePath, value]) => [filePath, sanitizeMetaRecord(value)]),
  );

  await atomicWriteJSON(INDEX_FILE, indexToWrite);
  await atomicWriteJSON(META_FILE, metaToWrite);
  indexDirty = false;
  logInfo(`Index saved: ${indexToWrite.length} entries, ${Object.keys(metaToWrite).length} files`);
}

async function getFileMtime(filePath) {
  try {
    const fileStat = await stat(toResolvedPath(filePath));
    return fileStat.mtimeMs;
  } catch {
    return 0;
  }
}

function removeEntriesForResolvedPath(resolvedPath) {
  const before = (indexCache || []).length;
  indexCache = (indexCache || []).filter(
    (entry) => toResolvedPath(entry.filePath) !== resolvedPath,
  );
  if (indexCache.length !== before) {
    markDirty();
  }
}

export async function indexFile(filePath, options = {}) {
  await loadIndex();

  const { skipSave = false, skipHealthCheck = false, ...chunkOptions } = options;
  const resolvedPath = toResolvedPath(filePath);
  const storedPath = toStoredPath(resolvedPath);
  const mtime = await getFileMtime(resolvedPath);

  const existing = metaCache.get(resolvedPath);
  if (existing && existing.lastModified >= mtime) {
    logDebug(`Skipping unchanged file: ${storedPath}`);
    return { indexed: false, chunks: existing.chunkCount };
  }

  if (!skipHealthCheck) {
    const available = await isOllamaAvailable();
    if (!available) {
      logWarn(`Ollama unavailable — cannot index ${storedPath}`);
      return { indexed: false, chunks: 0 };
    }
  }

  removeEntriesForResolvedPath(resolvedPath);

  const chunks = await chunkFile(resolvedPath, chunkOptions);
  if (chunks.length === 0) {
    metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: 0 });
    markDirty();
    if (!skipSave) await saveIndex();
    return { indexed: true, chunks: 0 };
  }

  const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.content));
  let addedCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const embedding = embeddings[i];
    if (!Array.isArray(embedding) || embedding.length === 0) {
      logWarn(`Skipping chunk ${i} of ${storedPath} — embedding failed`);
      continue;
    }

    indexCache.push({
      id: chunks[i].id,
      filePath: storedPath,
      content: chunks[i].content,
      embedding,
      startLine: chunks[i].startLine,
      endLine: chunks[i].endLine,
      type: chunks[i].type,
      lastModified: mtime,
    });
    addedCount += 1;
  }

  metaCache.set(resolvedPath, { lastModified: mtime, chunkCount: addedCount });
  markDirty();

  if (!skipSave) await saveIndex();

  logInfo(`Indexed ${storedPath}: ${addedCount} chunks embedded`);
  return { indexed: true, chunks: addedCount };
}

export async function flushIndex() {
  await saveIndex();
}

export async function pruneIndex(eligibleFilePaths) {
  await loadIndex();

  const eligibleResolved = new Set(
    Array.from(eligibleFilePaths || []).map((filePath) => toResolvedPath(filePath)),
  );
  const previousEntryCount = (indexCache || []).length;
  const previousMetaCount = (metaCache || new Map()).size;

  indexCache = (indexCache || []).filter((entry) =>
    eligibleResolved.has(toResolvedPath(entry.filePath)),
  );
  metaCache = new Map(
    Array.from(metaCache || new Map()).filter(([filePath]) =>
      eligibleResolved.has(toResolvedPath(filePath)),
    ),
  );

  const prunedEntries = previousEntryCount - indexCache.length;
  const prunedMeta = previousMetaCount - metaCache.size;

  if (prunedEntries > 0 || prunedMeta > 0) {
    markDirty();
    await saveIndex();
  }

  return { prunedEntries, prunedMeta };
}

export async function indexDirectory(dirPath, options = {}) {
  await loadIndex();

  const available = await isOllamaAvailable();
  if (!available) {
    logError("Ollama unavailable — cannot index directory");
    return { totalFiles: 0, indexedFiles: 0, totalChunks: 0 };
  }

  const files = await collectFiles(resolve(dirPath), options.extensions || DEFAULT_EXTENSIONS);
  logInfo(`Indexing directory: ${dirPath}`);
  logInfo(`Found ${files.length} supported files`);

  let indexedFiles = 0;
  let totalChunks = 0;
  let dirtySinceSave = 0;

  for (const filePath of files) {
    const result = await indexFile(filePath, {
      ...options,
      skipSave: true,
      skipHealthCheck: true,
    });
    if (result.indexed) {
      indexedFiles += 1;
      dirtySinceSave += 1;
    }
    totalChunks += result.chunks || 0;

    if (dirtySinceSave >= DIRECTORY_SAVE_INTERVAL) {
      await saveIndex();
      dirtySinceSave = 0;
    }
  }

  if (dirtySinceSave > 0) {
    await saveIndex();
  }

  logInfo(
    `Directory indexing complete: ${indexedFiles}/${files.length} files indexed, ${totalChunks} total chunks`,
  );
  return { totalFiles: files.length, indexedFiles, totalChunks };
}

export async function search(query, topK = 5, options = {}) {
  await loadIndex();

  if (!query || !String(query).trim()) {
    return [];
  }
  if (!indexCache || indexCache.length === 0) {
    logWarn("Search called on empty index");
    return [];
  }

  const queryEmbedding = await generateEmbedding(String(query));
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    logError("Failed to embed search query — is Ollama running?");
    return [];
  }

  const limit = Math.max(1, Number(topK) || 5);
  const perFileLimit =
    Number.isFinite(options.perFileLimit) && options.perFileLimit > 0
      ? Math.floor(options.perFileLimit)
      : Number.POSITIVE_INFINITY;

  const scored = [];
  for (const entry of indexCache) {
    if (!Array.isArray(entry.embedding) || entry.embedding.length === 0) continue;
    try {
      scored.push({
        score: cosineSimilarity(queryEmbedding, entry.embedding),
        filePath: entry.filePath,
        content: entry.content,
        startLine: entry.startLine,
        endLine: entry.endLine,
        type: entry.type,
      });
    } catch (err) {
      logDebug(`Similarity computation failed for ${entry.id}: ${err?.message || err}`);
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = [];
  const countsByFile = new Map();
  for (const item of scored) {
    const count = countsByFile.get(item.filePath) || 0;
    if (count >= perFileLimit) continue;
    results.push(item);
    countsByFile.set(item.filePath, count + 1);
    if (results.length >= limit) break;
  }

  logInfo(
    `Search for "${String(query).slice(0, 60)}": ${results.length} results (top score: ${results[0]?.score?.toFixed(4) || "N/A"})`,
  );
  return results;
}

export async function getIndexStats() {
  await loadIndex();

  const entries = indexCache || [];
  const files = new Set(entries.map((entry) => entry.filePath));
  const types = {};

  for (const entry of entries) {
    types[entry.type] = (types[entry.type] || 0) + 1;
  }

  let indexSizeBytes = 0;
  try {
    indexSizeBytes = (await stat(INDEX_FILE)).size;
  } catch {
    // ignore missing index file
  }

  return {
    totalEntries: entries.length,
    totalFiles: files.size,
    indexSizeBytes,
    types,
  };
}

export async function clearIndex() {
  await loadIndex();

  indexCache = [];
  metaCache = new Map();
  markDirty();
  await saveIndex();
  logInfo("Index cleared");
}

export function isIndexReady() {
  if (indexLoaded) {
    return (indexCache || []).length > 0;
  }

  try {
    if (!existsSync(INDEX_FILE)) return false;
    return statSync(INDEX_FILE).size > 2;
  } catch {
    return false;
  }
}
