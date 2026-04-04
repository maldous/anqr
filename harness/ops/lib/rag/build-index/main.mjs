// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:265

import { isOllamaAvailable } from "../embeddings.mjs";
import { clearIndex, flushIndex, getIndexStats, indexFile, pruneIndex } from "../vector-store.mjs";

import { PROGRESS_EVERY } from "./progress-every.mjs";
import { PROJECT_ROOT } from "./project-root.mjs";
import { SAVE_INTERVAL } from "./save-interval.mjs";
import { buildCandidateList } from "./build-candidate-list.mjs";
import { logSkipSummary } from "./log-skip-summary.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function main() {
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
