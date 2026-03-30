/**
 * linear-search.mjs — Search Linear issues via semantic similarity
 *
 * Provides searchLinearIssues() for querying the Linear RAG index.
 * Returns top-K results with issue metadata and excerpts.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
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

/** @type {{ entries: Array<any>, mtimeMs: number } | null} */
let linearIndexCache = null;

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function extractTitle(content) {
  const match = content.match(/^#\s+([A-Z]+-\d+):\s+(.+)$/m);
  return match ? match[2] : "(no title)";
}

function buildSearchEntry(entry) {
  const title = extractTitle(entry.content);
  const state = entry.metadata?.state || "Unknown";
  const priority = entry.metadata?.priority || "None";
  const updatedAt = entry.metadata?.updatedAt || null;
  const searchableText = [
    entry.metadata?.identifier || "",
    title,
    state,
    priority,
    entry.content,
  ].join("\n");

  return {
    ...entry,
    title,
    state,
    priority,
    updatedAt,
    excerpt: entry.content.slice(0, 300),
    searchTokens: tokenize(searchableText),
    searchableText: normalizeText(searchableText),
  };
}

/**
 * Load the Linear RAG index from disk
 * @returns {Promise<Array>}
 */
async function loadLinearIndex() {
  if (!existsSync(LINEAR_INDEX_FILE)) {
    logWarn(`Linear index not found at ${LINEAR_INDEX_FILE}`);
    return [];
  }

  try {
    const stat = statSync(LINEAR_INDEX_FILE);
    if (linearIndexCache && linearIndexCache.mtimeMs === stat.mtimeMs) {
      return linearIndexCache.entries;
    }

    const raw = await readFile(LINEAR_INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed.map(buildSearchEntry) : [];
    linearIndexCache = { entries, mtimeMs: stat.mtimeMs };
    logInfo(`Loaded Linear index: ${entries.length} entries`);
    return entries;
  } catch (err) {
    logError(`Failed to load Linear index: ${err?.message || err}`);
    return [];
  }
}

function computeLexicalScore(queryTokens, entry) {
  if (queryTokens.length === 0) return 0;
  const tokenSet = new Set(entry.searchTokens);
  let matched = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) matched += 1;
  }

  const coverage = matched / queryTokens.length;
  const phraseBoost = entry.searchableText.includes(queryTokens.join(" ")) ? 0.25 : 0;
  return coverage + phraseBoost;
}

function computeRecencyBonus(updatedAt) {
  if (!updatedAt) return 0;
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0;
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  if (ageDays <= 7) return 0.08;
  if (ageDays <= 30) return 0.04;
  return 0;
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

  const queryTokens = tokenize(query);
  const lexicalRanked = index
    .map((entry) => ({
      entry,
      lexicalScore: computeLexicalScore(queryTokens, entry),
    }))
    .filter(({ lexicalScore }) => lexicalScore > 0)
    .sort((a, b) => b.lexicalScore - a.lexicalScore);

  const candidateLimit = lexicalRanked.length > 0 ? Math.min(25, lexicalRanked.length) : index.length;
  const candidates =
    lexicalRanked.length > 0
      ? lexicalRanked.slice(0, candidateLimit)
      : index.slice(0, Math.min(50, index.length)).map((entry) => ({ entry, lexicalScore: 0 }));

  // Generate embedding for the query. Fall back to lexical ranking if Ollama is unavailable.
  const queryEmbedding = await generateEmbedding(query);
  const semanticAvailable = Array.isArray(queryEmbedding) && queryEmbedding.length > 0;
  if (!semanticAvailable) {
    logWarn("Linear query embedding unavailable — falling back to lexical ranking");
  }

  const scored = [];
  for (const { entry, lexicalScore } of candidates) {
    try {
      const semanticScore =
        semanticAvailable && Array.isArray(entry.embedding) && entry.embedding.length > 0
          ? cosineSimilarity(queryEmbedding, entry.embedding)
          : 0;
      const score = semanticAvailable
        ? semanticScore * 0.75 + lexicalScore * 0.2 + computeRecencyBonus(entry.updatedAt)
        : lexicalScore + computeRecencyBonus(entry.updatedAt);
      scored.push({
        identifier: entry.metadata?.identifier || entry.id || "unknown",
        title: entry.title,
        state: entry.state,
        priority: entry.priority,
        score,
        excerpt: entry.excerpt,
        content: entry.content,
        updatedAt: entry.updatedAt,
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
  if (linearIndexCache && linearIndexCache.entries.length > 0) {
    return true;
  }
  return existsSync(LINEAR_INDEX_FILE);
}

export async function warmLinearIndex() {
  return loadLinearIndex();
}

export function getLinearIndexStats() {
  if (!existsSync(LINEAR_INDEX_FILE)) {
    return { ready: false, entries: 0 };
  }

  try {
    const stat = statSync(LINEAR_INDEX_FILE);
    return {
      ready: true,
      entries: linearIndexCache?.entries?.length || null,
      builtAt: new Date(stat.mtimeMs).toISOString(),
      path: LINEAR_INDEX_FILE,
    };
  } catch (err) {
    return { ready: false, error: err?.message || String(err) };
  }
}
