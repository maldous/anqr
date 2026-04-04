// Generated from ../../../../scripts/ops/lib/rag/build-index-linear.mjs:89

import { generateEmbeddings, isOllamaAvailable } from "../embeddings.mjs";
import { readFile } from "node:fs/promises";
import { chunkLinearIssues } from "../linear-chunker.mjs";

import { EXPORT_PATH } from "./export-path.mjs";
import { INDEX_DIR } from "./index-dir.mjs";
import { LINEAR_EMBEDDING_CONCURRENCY } from "./linear-embedding-concurrency.mjs";
import { PROJECT_ROOT } from "./project-root.mjs";
import { saveIndex } from "./save-index.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function buildLinearIndex() {
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
  const embeddings = await generateEmbeddings(
    chunks.map((chunk) => chunk.content),
    {
      maxConcurrency: LINEAR_EMBEDDING_CONCURRENCY,
    },
  );

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
