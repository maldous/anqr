#!/usr/bin/env node

/**
 * build-index-linear.mjs — Build Linear issues RAG index
 *
 * Reads Linear issues from exported JSON and generates embeddings
 * for semantic search integration with Symphony agents.
 */

import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createLogger } from "../logger.mjs";
import { chunkLinearIssues } from "./linear-chunker.mjs";
import { generateEmbeddings, isOllamaAvailable } from "./embeddings.mjs";

const { logInfo, logWarn, logError } = createLogger("rag-build-index-linear");

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
const EXPORT_PATH = resolve(PROJECT_ROOT, "reports/linear-export/issues-latest.json");
const INDEX_DIR = resolve(PROJECT_ROOT, "reports/rag-index-linear");
const _INDEX_FILE = resolve(INDEX_DIR, "index.json");
const _META_FILE = resolve(INDEX_DIR, "meta.json");
const LINEAR_EMBEDDING_CONCURRENCY = Number(process.env.LINEAR_RAG_EMBEDDING_CONCURRENCY || 3);

async function saveIndex(indexDir, data) {
  await mkdir(indexDir, { recursive: true });
  
  const { chunks, embeddings } = data;
  
  // Build index entries
  const indexEntries = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    
    if (!Array.isArray(embedding) || embedding.length === 0) {
      logWarn(`Skipping chunk ${chunk.id} — embedding failed`);
      continue;
    }
    
    indexEntries.push({
      id: chunk.id,
      filePath: chunk.filePath,
      content: chunk.content,
      embedding,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      type: chunk.type,
      metadata: chunk.metadata,
    });
  }
  
  // Write index file
  const indexPath = resolve(indexDir, "index.json");
  await writeFile(indexPath, JSON.stringify(indexEntries, null, 2), "utf-8");
  
  // Write metadata file
  const meta = {
    chunkCount: indexEntries.length,
    lastBuild: new Date().toISOString(),
    indexSizeBytes: JSON.stringify(indexEntries).length,
    source: "linear-export",
  };
  const metaPath = resolve(indexDir, "meta.json");
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf-8");
  
  logInfo(`Index saved: ${indexEntries.length} entries`);
  logInfo(`Index size: ${(meta.indexSizeBytes / 1024).toFixed(1)} KB`);
}

async function writeFile(path, content, encoding) {
  const { writeFile: fsWriteFile } = await import("node:fs/promises");
  await fsWriteFile(path, content, encoding);
}

async function buildLinearIndex() {
  const startTime = Date.now();
  
  logInfo("========================================");
  logInfo("Linear RAG Index Builder — Starting");
  logInfo("========================================");
  logInfo(`📍 Project root: ${PROJECT_ROOT}`);
  logInfo(`📄 Export path: ${EXPORT_PATH}`);
  logInfo(`📂 Index directory: ${INDEX_DIR}`);
  
  // Check Ollama availability
  const ollamaOk = await isOllamaAvailable({ force: true });
  if (!ollamaOk) {
    logError("Ollama is not available. Cannot build Linear RAG index.");
    logError(
      `Ensure Ollama is running at ${process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434"}`,
    );
    process.exit(1);
  }
  logInfo("✅ Ollama is available");
  
  // Read exported issues
  let issues;
  try {
    const raw = await readFile(EXPORT_PATH, "utf-8");
    issues = JSON.parse(raw);
    logInfo(`📊 Loaded ${issues.length} issues from export`);
  } catch (err) {
    logError(`Failed to read export file: ${err?.message || err}`);
    logError(`Expected path: ${EXPORT_PATH}`);
    logError("Run export script first: node scripts/ops/integrations/linear/export-issues.mjs");
    process.exit(1);
  }
  
  if (!Array.isArray(issues) || issues.length === 0) {
    logWarn("No issues found in export — index will be empty");
    issues = [];
  }
  
  // Chunk issues
  logInfo("🔨 Chunking issues...");
  const chunks = chunkLinearIssues(issues);
  logInfo(`✅ Created ${chunks.length} chunks (1 per issue)`);
  
  if (chunks.length === 0) {
    logWarn("No chunks created — exiting");
    process.exit(0);
  }
  
  // Generate embeddings
  logInfo("🧠 Generating embeddings...");
  const embeddings = await generateEmbeddings(chunks.map((chunk) => chunk.content), {
    maxConcurrency: LINEAR_EMBEDDING_CONCURRENCY,
  });
  
  const successCount = embeddings.filter((e) => Array.isArray(e) && e.length > 0).length;
  logInfo(`✅ Generated ${successCount}/${chunks.length} embeddings`);
  
  // Save index
  logInfo("💾 Saving index...");
  await saveIndex(INDEX_DIR, { chunks, embeddings });
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  logInfo("========================================");
  logInfo("Linear RAG Index Builder — Complete");
  logInfo("========================================");
  logInfo(`⏱️  Duration: ${elapsed}s`);
  logInfo(`📝 Issues processed: ${issues.length}`);
  logInfo(`🧩 Chunks created: ${chunks.length}`);
  logInfo(`✅ Embeddings generated: ${successCount}`);
  logInfo(`📂 Index location: ${INDEX_DIR}`);
  logInfo("========================================");
}

buildLinearIndex().catch((err) => {
  logError(`Fatal error: ${err?.message || err}`);
  console.error(err);
  process.exit(1);
});
