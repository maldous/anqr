/**
 * linear-search.mjs — Search Linear issues via semantic similarity
 *
 * Provides searchLinearIssues() for querying the Linear RAG index.
 * Returns top-K results with issue metadata and excerpts.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createLogger } from "../logger.mjs";
import { generateEmbedding, cosineSimilarity } from "../rag/embeddings.mjs";

const { logDebug, logInfo, logWarn, logError } = createLogger("linear-search");

function detectProjectRoot() {
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
const LINEAR_INDEX_DIR = resolve(PROJECT_ROOT, "reports/rag-index-linear");
const LINEAR_INDEX_FILE = resolve(LINEAR_INDEX_DIR, "index.json");

/** @type {Array<any> | null} */
let linearIndexCache = null;

/**
 * Load the Linear RAG index from disk
 * @returns {Promise<Array>}
 */
async function loadLinearIndex() {
  if (linearIndexCache) {
    return linearIndexCache;
  }

  if (!existsSync(LINEAR_INDEX_FILE)) {
    logWarn(`Linear index not found at ${LINEAR_INDEX_FILE}`);
    return [];
  }

  try {
    const raw = await readFile(LINEAR_INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    linearIndexCache = Array.isArray(parsed) ? parsed : [];
    logInfo(`Loaded Linear index: ${linearIndexCache.length} entries`);
    return linearIndexCache;
  } catch (err) {
    logError(`Failed to load Linear index: ${err?.message || err}`);
    return [];
  }
}

/**
 * Extract title from issue content chunk
 * @param {string} content
 * @returns {string}
 */
function extractTitle(content) {
  const match = content.match(/^#\s+([A-Z]+-\d+):\s+(.+)$/m);
  return match ? match[2] : "(no title)";
}

/**
 * Search Linear issues by semantic similarity
 * @param {string} query - Search query
 * @param {number} [topK=5] - Maximum results to return
 * @returns {Promise<Array<{identifier: string, title: string, state: string, priority: string|number, score: number, excerpt: string}>>}
 */
export async function searchLinearIssues(query, topK = 5) {
  if (!query || typeof query !== "string" || !query.trim()) {
    logWarn("searchLinearIssues called with empty query");
    return [];
  }

  const index = await loadLinearIndex();
  if (index.length === 0) {
    logWarn("Linear index is empty — no results");
    return [];
  }

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    logError("Failed to embed query — is Ollama running?");
    return [];
  }

  // Score all entries by cosine similarity
  const scored = [];
  for (const entry of index) {
    if (!Array.isArray(entry.embedding) || entry.embedding.length === 0) {
      continue;
    }

    try {
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      scored.push({
        identifier: entry.metadata?.identifier || entry.id || "unknown",
        title: extractTitle(entry.content),
        state: entry.metadata?.state || "Unknown",
        priority: entry.metadata?.priority || "None",
        score,
        excerpt: entry.content.slice(0, 300),
        content: entry.content,
      });
    } catch (err) {
      logDebug(`Similarity computation failed for ${entry.id}: ${err?.message || err}`);
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top-K results
  const limit = Math.max(1, Math.min(topK, scored.length));
  const results = scored.slice(0, limit);

  logInfo(
    `Search for "${query.slice(0, 60)}": ${results.length} results (top score: ${results[0]?.score?.toFixed(4) || "N/A"})`,
  );

  return results;
}

/**
 * Check if Linear index is ready
 * @returns {boolean}
 */
export function isLinearIndexReady() {
  if (linearIndexCache && linearIndexCache.length > 0) {
    return true;
  }
  return existsSync(LINEAR_INDEX_FILE);
}
