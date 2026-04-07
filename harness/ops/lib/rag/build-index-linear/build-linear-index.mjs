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

  const ollamaOk = await isOllamaAvailable({ force: true });
  if (!ollamaOk) {
    const base = process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434";
    logError("Ollama is not available. Cannot build Linear RAG index.");
    logError(`Ensure Ollama is running at ${base}`);
    throw new Error(`Ollama unavailable at ${base}`);
  }
  logInfo("✅ Ollama is available");

  async function loadIssuesWithStartupGrace() {
    const deadline = Date.now() + 15_000;
    let lastError = null;

    while (Date.now() < deadline) {
      try {
        const raw = await readFile(EXPORT_PATH, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw lastError || new Error(`Linear export unavailable at ${EXPORT_PATH}`);
  }

  let issues;
  try {
    issues = await loadIssuesWithStartupGrace();
    logInfo(`📊 Loaded ${issues.length} issues from export`);
  } catch (err) {
    logError(`Failed to read export file: ${err?.message || err}`);
    logError(`Expected path: ${EXPORT_PATH}`);
    throw new Error(`Linear export unavailable at ${EXPORT_PATH}`);
  }

  if (!Array.isArray(issues) || issues.length === 0) {
    logWarn("No issues found in export — writing empty Linear index");
    issues = [];
  }

  logInfo("🔨 Chunking issues...");
  const chunks = chunkLinearIssues(issues);
  logInfo(`✅ Created ${chunks.length} chunks`);

  logInfo("🧠 Generating embeddings...");
  const embeddings =
    chunks.length > 0
      ? await generateEmbeddings(
          chunks.map((chunk) => chunk.content),
          {
            maxConcurrency: LINEAR_EMBEDDING_CONCURRENCY,
          },
        )
      : [];

  const successCount = embeddings.filter((e) => Array.isArray(e) && e.length > 0).length;
  logInfo(`✅ Generated ${successCount}/${chunks.length} embeddings`);

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

  return {
    issuesProcessed: issues.length,
    chunkCount: chunks.length,
    embeddingCount: successCount,
    elapsedSeconds: Number(elapsed),
    indexDir: INDEX_DIR,
  };
}
