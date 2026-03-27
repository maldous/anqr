#!/usr/bin/env node

/**
 * build-index.mjs — Build the RAG vector index for the ANQR project
 *
 * Indexes key source directories using the RAG pipeline (chunker → embeddings → vector store).
 * Designed to be run as a one-shot script or periodically via systemd timer.
 *
 * Directories indexed (in priority order):
 *   1. scripts/ops/     — Harness code (bridges, runners, tools)
 *   2. docs/            — Project documentation
 *   3. Root *.md files  — Knowledge base (MEMORY.md, knowledge.md, etc.)
 *   4. netlify/         — API and MCP functions
 *   5. vite-config/     — Build configuration
 *
 * Usage:
 *   node scripts/ops/lib/rag/build-index.mjs
 *   node scripts/ops/lib/rag/build-index.mjs --clear   # Clear and rebuild from scratch
 *
 * Environment:
 *   OLLAMA_API_BASE  — Ollama API base URL (default: http://127.0.0.1:11434)
 */

import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { createLogger } from "../logger.mjs";
import { indexDirectory, indexFile, getIndexStats, clearIndex, isIndexReady } from "./vector-store.mjs";
import { isOllamaAvailable } from "./embeddings.mjs";

const { logInfo, logWarn, logError } = createLogger("rag-build-index");

const PROJECT_ROOT = resolve(process.cwd());

/** Directories to index, in priority order */
const INDEX_TARGETS = [
  "scripts/ops",
  "docs",
  "netlify",
  "vite-config",
];

/** Root-level files to index individually */
const ROOT_FILES = [
  "knowledge.md",
  "MEMORY.md",
  "CLAUDE.md",
  "CODEBUFF.md",
  "AGENTS.md",
  "IDENTITY.md",
  "SOUL.md",
  "TOOLS.md",
  "USER.md",
  "README.md",
  "plan.md",
  "MCP-MIGRATION.md",
  "HEARTBEAT.md",
];

async function main() {
  const startTime = Date.now();
  const shouldClear = process.argv.includes("--clear");

  logInfo("========================================");
  logInfo("RAG Index Builder — Starting");
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

  let totalFiles = 0;
  let totalIndexed = 0;
  let totalChunks = 0;

  // Index directories
  for (const dir of INDEX_TARGETS) {
    const dirPath = resolve(PROJECT_ROOT, dir);
    logInfo(`\n📁 Indexing directory: ${dir}`);

    try {
      const result = await indexDirectory(dirPath);
      totalFiles += result.totalFiles;
      totalIndexed += result.indexedFiles;
      totalChunks += result.totalChunks;
      logInfo(`   ✅ ${dir}: ${result.indexedFiles}/${result.totalFiles} files indexed, ${result.totalChunks} chunks`);
    } catch (err) {
      logWarn(`   ⚠️ Failed to index ${dir}: ${err.message}`);
    }
  }

  // Index root-level files
  logInfo("\n📄 Indexing root-level files...");
  for (const file of ROOT_FILES) {
    const filePath = resolve(PROJECT_ROOT, file);
    try {
      const result = await indexFile(filePath);
      if (result.indexed) {
        totalIndexed++;
        totalChunks += result.chunks;
        logInfo(`   ✅ ${file}: ${result.chunks} chunks`);
      } else if (result.chunks > 0) {
        logInfo(`   ⏭️  ${file}: unchanged (${result.chunks} chunks cached)`);
      }
      totalFiles++;
    } catch (err) {
      // File may not exist — that's OK
      if (err.message?.includes("ENOENT")) {
        logInfo(`   ⏭️  ${file}: not found, skipping`);
      } else {
        logWarn(`   ⚠️ ${file}: ${err.message}`);
      }
    }
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
