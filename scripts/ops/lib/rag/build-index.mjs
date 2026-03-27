#!/usr/bin/env node

/**
 * build-index.mjs — Build the RAG vector index for the ANQR project
 *
 * Indexes all git-tracked files in the repository using the RAG pipeline
 * (chunker → Ollama embeddings → vector store). Uses `git ls-files` to
 * discover files, which naturally excludes everything in .gitignore.
 *
 * Designed to be run as a one-shot script or periodically via systemd timer.
 *
 * Usage:
 *   node scripts/ops/lib/rag/build-index.mjs
 *   node scripts/ops/lib/rag/build-index.mjs --clear   # Clear and rebuild from scratch
 *
 * Environment:
 *   OLLAMA_API_BASE  — Ollama API base URL (default: http://127.0.0.1:11434)
 */

import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { createLogger } from "../logger.mjs";
import { indexFile, flushIndex, getIndexStats, clearIndex, isIndexReady } from "./vector-store.mjs";
import { isOllamaAvailable } from "./embeddings.mjs";

const { logInfo, logWarn, logError } = createLogger("rag-build-index");

const PROJECT_ROOT = resolve(process.cwd());

/** File extensions the chunker can meaningfully process */
const SUPPORTED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".md",
  ".json",
  ".css", ".html",
  ".yml", ".yaml",
  ".sh", ".py",
  ".service", ".timer",
]);

/** Flush to disk every N indexed files to prevent data loss */
const SAVE_INTERVAL = 25;

/**
 * Discover all git-tracked files with supported extensions.
 * Uses `git ls-files` so .gitignore'd files are automatically excluded.
 *
 * @returns {string[]} Array of relative file paths
 */
function discoverFiles() {
  const raw = execSync("git ls-files", {
    cwd: PROJECT_ROOT,
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length === 0) return false;
      const dotIdx = line.lastIndexOf(".");
      if (dotIdx === -1) return false;
      const ext = line.slice(dotIdx).toLowerCase();
      return SUPPORTED_EXTENSIONS.has(ext);
    });
}

async function main() {
  const startTime = Date.now();
  const shouldClear = process.argv.includes("--clear");

  logInfo("========================================");
  logInfo("RAG Index Builder — Starting (full repo)");
  logInfo("========================================");

  // Check Ollama availability
  const ollamaOk = await isOllamaAvailable();
  if (!ollamaOk) {
    logError("Ollama is not available. Cannot build RAG index.");
    logError("Ensure Ollama is running at " + (process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434"));
    process.exit(1);
  }
  logInfo("✅ Ollama is available");

  // Clear index if requested
  if (shouldClear) {
    logInfo("🗑️  Clearing existing index...");
    await clearIndex();
    logInfo("Index cleared");
  }

  // Show existing index stats
  if (isIndexReady()) {
    const stats = await getIndexStats();
    logInfo(`📊 Existing index: ${stats.totalEntries} entries, ${stats.totalFiles} files`);
  } else {
    logInfo("📊 No existing index found — building from scratch");
  }

  // Discover all tracked files with supported extensions
  const allFiles = discoverFiles();
  logInfo(`📂 Discovered ${allFiles.length} tracked files with supported extensions`);

  let totalFiles = allFiles.length;
  let totalIndexed = 0;
  let totalChunks = 0;
  let dirtyCount = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const file = allFiles[i];
    const filePath = resolve(PROJECT_ROOT, file);

    try {
      const result = await indexFile(filePath, { skipSave: true });
      if (result.indexed) {
        totalIndexed++;
        totalChunks += result.chunks;
        dirtyCount++;
      } else if (result.chunks > 0) {
        totalChunks += result.chunks;
      }
    } catch (err) {
      if (!err.message?.includes("ENOENT")) {
        logWarn(`   ⚠️ ${file}: ${err.message}`);
      }
    }

    // Flush to disk periodically to prevent data loss
    if (dirtyCount >= SAVE_INTERVAL) {
      await flushIndex();
      dirtyCount = 0;
    }

    // Progress log every 200 files
    if ((i + 1) % 200 === 0) {
      logInfo(`   📈 Progress: ${i + 1}/${allFiles.length} files processed, ${totalIndexed} indexed`);
    }
  }

  // Final flush
  if (dirtyCount > 0) {
    await flushIndex();
  }

  // Final stats
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const finalStats = await getIndexStats();

  logInfo("\n========================================");
  logInfo("RAG Index Builder — Complete");
  logInfo("========================================");
  logInfo(`⏱️  Duration: ${elapsed}s`);
  logInfo(`📁 Files scanned: ${totalFiles}`);
  logInfo(`📝 Files indexed: ${totalIndexed}`);
  logInfo(`🧩 Total chunks: ${totalChunks}`);
  logInfo(`📊 Index size: ${finalStats.totalEntries} entries, ${(finalStats.indexSizeBytes / 1024).toFixed(1)} KB on disk`);
  logInfo(`📂 Files in index: ${finalStats.totalFiles}`);

  if (finalStats.types && Object.keys(finalStats.types).length > 0) {
    logInfo("📋 Chunk types:");
    for (const [type, count] of Object.entries(finalStats.types)) {
      logInfo(`   ${type}: ${count}`);
    }
  }

  logInfo("========================================");
}

main().catch((err) => {
  logError(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
