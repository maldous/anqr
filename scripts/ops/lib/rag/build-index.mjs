#!/usr/bin/env node

/**
 * build-index.mjs — Build the ANQR RAG vector index
 *
 * Design goals:
 *   - discover tracked files via `git ls-files -z`
 *   - prefer high-signal code/config/docs over generated and translation noise
 *   - skip mirrored duplicates, oversized files, and obvious non-source artefacts
 *   - prune stale index/meta state before incremental work begins
 *   - batch disk flushes so a long unattended run does not lose all progress
 */

import { execFileSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { basename, extname, resolve, sep } from "node:path";
import { createLogger } from "../logger.mjs";
import { isOllamaAvailable } from "./embeddings.mjs";
import { clearIndex, flushIndex, getIndexStats, indexFile, pruneIndex } from "./vector-store.mjs";

const { logInfo, logWarn, logError } = createLogger("rag-build-index");

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
const SAVE_INTERVAL = toPositiveInt(process.env.RAG_BUILD_SAVE_INTERVAL, 25);
const PROGRESS_EVERY = toPositiveInt(process.env.RAG_BUILD_PROGRESS_EVERY, 200);
const MAX_FILE_BYTES = toPositiveInt(process.env.RAG_BUILD_MAX_FILE_BYTES, 256 * 1024);
const INCLUDE_I18N = isTruthy(process.env.RAG_BUILD_INCLUDE_I18N);
const VERBOSE = isTruthy(process.env.RAG_BUILD_VERBOSE) || process.argv.includes("--verbose");

const SUPPORTED_EXTENSIONS = new Set([
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
]);

const SUPPORTED_BASENAMES = new Set([
  "Makefile",
  "Dockerfile",
  "Gemfile",
  "Podfile",
  "Procfile",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".npmrc",
  ".nvmrc",
  ".prettierignore",
  ".prettierrc",
]);

const JSON_EXCLUDED_NAMES = new Set([
  "google-services.json",
  "Contents.json",
  "age_rating.json",
  "progress.json",
  "linear-history-export.json",
  "package-lock.json",
]);

const EXCLUDED_PATH_PATTERNS = [
  /(^|\/)node_modules\//i,
  /(^|\/)coverage\//i,
  /(^|\/)dist\//i,
  /(^|\/)build\//i,
  /(^|\/)reports\//i,
  /(^|\/)__snapshots__\//i,
  /(^|\/)\.yarn\//i,
  /(^|\/)\.git\//i,
  /(^|\/)public\/gallery\/.*manifest\.json$/i,
  /(^|\/)apps\/web\/src\/content\/generated\//i,
  /(^|\/)migration\/templates\//i,
  /(^|\/)[^/]+\.generated\.[^./]+$/i,
];

const I18N_EXCLUDED_PATH_PATTERNS = [
  /(^|\/)apps\/web\/src\/i18n\/locales\/.*\.json$/i,
  /(^|\/)apps\/web\/src\/i18n\/static\//i,
];

const MIRROR_PREFERENCES = [{ from: "android/", to: "apps/android/" }];

const PRIORITY_RULES = [
  [/^scripts\/ops\//i, 0],
  [/^packages\//i, 1],
  [/^apps\/(?:api|mobile|web)\/src\//i, 2],
  [/^apps\/web\//i, 3],
  [/^apps\/api\//i, 3],
  [/^apps\/mobile\//i, 3],
  [/^apps\/android\//i, 4],
  [/^apps\/ios\//i, 4],
  [/^docs\/harness\//i, 5],
  [/^docs\//i, 6],
  [/^[^./]+(?:\.md)?$/i, 7],
];

function isTruthy(value) {
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePath(filePath) {
  return String(filePath).split(sep).join("/");
}

function getPriority(relPath) {
  for (const [pattern, priority] of PRIORITY_RULES) {
    if (pattern.test(relPath)) return priority;
  }
  return 50;
}

function isSupportedEnvName(name) {
  return /^\.env(?:\..+)?$/i.test(name);
}

function shouldSkipMirroredPath(relPath, trackedSet) {
  for (const { from, to } of MIRROR_PREFERENCES) {
    if (!relPath.startsWith(from)) continue;
    const mirrored = `${to}${relPath.slice(from.length)}`;
    if (trackedSet.has(mirrored)) return true;
  }
  return false;
}

function shouldIncludeJson(relPath) {
  const name = basename(relPath);
  if (JSON_EXCLUDED_NAMES.has(name)) return false;
  if (!INCLUDE_I18N && I18N_EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath)))
    return false;
  return true;
}

function classifyFile(relPath, trackedSet) {
  if (shouldSkipMirroredPath(relPath, trackedSet))
    return { include: false, reason: "mirrored_duplicate" };
  if (EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath)))
    return { include: false, reason: "excluded_path" };
  if (!INCLUDE_I18N && I18N_EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relPath))) {
    return { include: false, reason: "i18n_noise" };
  }

  const name = basename(relPath);
  if (SUPPORTED_BASENAMES.has(name) || isSupportedEnvName(name)) {
    return { include: true, reason: "supported_basename" };
  }

  const ext = extname(relPath).toLowerCase();
  if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) {
    return { include: false, reason: "unsupported_extension" };
  }

  if (ext === ".json" && !shouldIncludeJson(relPath)) {
    return { include: false, reason: "excluded_json" };
  }

  return { include: true, reason: "supported_extension" };
}

function discoverTrackedFiles() {
  const raw = execFileSync("git", ["ls-files", "-z"], {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });

  return raw
    .split("\0")
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizePath);
}

async function buildCandidateList() {
  const trackedFiles = discoverTrackedFiles();
  const trackedSet = new Set(trackedFiles);
  const included = [];
  const statsByReason = new Map();
  let missingCount = 0;

  for (const relPath of trackedFiles) {
    const decision = classifyFile(relPath, trackedSet);
    if (!decision.include) {
      statsByReason.set(decision.reason, (statsByReason.get(decision.reason) || 0) + 1);
      if (VERBOSE && decision.reason !== "unsupported_extension") {
        logWarn(`Skipping ${relPath} (${decision.reason})`);
      }
      continue;
    }

    const absPath = resolve(PROJECT_ROOT, relPath);
    let size;
    try {
      size = (await stat(absPath)).size;
    } catch (err) {
      if (err?.code !== "ENOENT") {
        logWarn(`Failed to stat ${relPath}: ${err?.message || err}`);
      }
      missingCount += 1;
      continue;
    }

    if (size > MAX_FILE_BYTES) {
      statsByReason.set("oversized", (statsByReason.get("oversized") || 0) + 1);
      if (VERBOSE) {
        logWarn(`Skipping ${relPath} (${size} bytes > ${MAX_FILE_BYTES})`);
      }
      continue;
    }

    included.push({ relPath, absPath, size, priority: getPriority(relPath) });
  }

  included.sort((a, b) => a.priority - b.priority || a.relPath.localeCompare(b.relPath));
  return { trackedFiles, included, statsByReason, missingCount };
}

function logSkipSummary(statsByReason) {
  const sorted = Array.from(statsByReason.entries()).sort((a, b) => b[1] - a[1]);
  for (const [reason, count] of sorted) {
    if (reason === "unsupported_extension") continue;
    logInfo(`   ${reason}: ${count}`);
  }
}

async function main() {
  const startTime = Date.now();
  const shouldClear = process.argv.includes("--clear");

  logInfo("========================================");
  logInfo("RAG Index Builder — Starting");
  logInfo("========================================");
  logInfo(`📍 Project root: ${PROJECT_ROOT}`);

  const ollamaOk = await isOllamaAvailable({ force: true });
  if (!ollamaOk) {
    logError("Ollama is not available. Cannot build RAG index.");
    logError(
      `Ensure Ollama is running at ${process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434"}`,
    );
    process.exit(1);
  }
  logInfo("✅ Ollama is available");

  if (shouldClear) {
    logInfo("🗑️  Clearing existing index...");
    await clearIndex();
  }

  const discovery = await buildCandidateList();
  const eligibleAbsPaths = new Set(discovery.included.map((file) => file.absPath));

  logInfo(`📂 Tracked files: ${discovery.trackedFiles.length}`);
  logInfo(`📄 Eligible files: ${discovery.included.length}`);
  if (discovery.missingCount > 0) {
    logInfo(`❓ Missing tracked files: ${discovery.missingCount}`);
  }
  if (discovery.statsByReason.size > 0) {
    logInfo("🧾 Skipped by reason:");
    logSkipSummary(discovery.statsByReason);
  }

  const pruneResult = shouldClear
    ? { prunedEntries: 0, prunedMeta: 0 }
    : await pruneIndex(eligibleAbsPaths);
  if (pruneResult.prunedEntries > 0 || pruneResult.prunedMeta > 0) {
    logInfo(
      `🧹 Pruned stale index state: ${pruneResult.prunedEntries} entries, ${pruneResult.prunedMeta} file metadata records`,
    );
  }

  const beforeStats = await getIndexStats();
  logInfo(
    `📊 Existing index: ${beforeStats.totalEntries} entries, ${beforeStats.totalFiles} files`,
  );

  let totalIndexed = 0;
  let totalChunks = 0;
  let dirtyCount = 0;
  let processed = 0;
  let failures = 0;

  for (const file of discovery.included) {
    processed += 1;
    try {
      const result = await indexFile(file.absPath, {
        skipSave: true,
        skipHealthCheck: true,
      });
      if (result.indexed) {
        totalIndexed += 1;
        dirtyCount += 1;
      }
      totalChunks += result.chunks || 0;
    } catch (err) {
      failures += 1;
      if (!String(err?.message || err).includes("ENOENT")) {
        logWarn(`⚠️ ${file.relPath}: ${err?.message || err}`);
      }
    }

    if (dirtyCount >= SAVE_INTERVAL) {
      await flushIndex();
      dirtyCount = 0;
    }

    if (processed % PROGRESS_EVERY === 0) {
      logInfo(
        `📈 Progress: ${processed}/${discovery.included.length} files processed, ${totalIndexed} indexed, ${failures} failures`,
      );
    }
  }

  if (dirtyCount > 0) {
    await flushIndex();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const finalStats = await getIndexStats();

  logInfo("========================================");
  logInfo("RAG Index Builder — Complete");
  logInfo("========================================");
  logInfo(`⏱️  Duration: ${elapsed}s`);
  logInfo(`📁 Tracked files scanned: ${discovery.trackedFiles.length}`);
  logInfo(`📄 Eligible files processed: ${discovery.included.length}`);
  logInfo(`📝 Files indexed this run: ${totalIndexed}`);
  logInfo(`🧩 Chunks touched this run: ${totalChunks}`);
  logInfo(`⚠️  Failures: ${failures}`);
  logInfo(
    `📊 Index size: ${finalStats.totalEntries} entries, ${(finalStats.indexSizeBytes / 1024).toFixed(1)} KB on disk`,
  );
  logInfo(`📂 Files in index: ${finalStats.totalFiles}`);

  if (finalStats.types && Object.keys(finalStats.types).length > 0) {
    logInfo("📋 Chunk types:");
    for (const [type, count] of Object.entries(finalStats.types).sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      logInfo(`   ${type}: ${count}`);
    }
  }

  logInfo("========================================");
}

main().catch((err) => {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
});
