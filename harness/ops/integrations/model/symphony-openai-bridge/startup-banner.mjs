// Extracted from runtime.mjs: startup banner with RAG stats, Context7 status, tools list.

import { getSearchStats as getHybridSearchStats } from "../../../lib/search/hybrid-search.mjs";
import { getLinearIndexStats } from "../../../lib/search/linear-search.mjs";
import { PORT } from "./port.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { API_KEY } from "./api-key.mjs";
import { CONTEXT7_HTTP_BASE } from "./context7-http-base.mjs";
import { tools } from "./tools.mjs";
import { logInfo } from "./logger.mjs";

export async function logStartupBanner({ summary, enabled }) {
  function normalizeContext7Status(status) {
    const normalized = String(status || "unreachable").toLowerCase();
    if (normalized === "ok" || normalized === "healthy" || normalized === "ready") return "ok";
    if (normalized === "degraded" || normalized === "warming" || normalized === "starting") {
      return "warming";
    }
    return normalized;
  }

  const ragStats = getHybridSearchStats();
  const linearStats = getLinearIndexStats();
  let context7StartupStatus = "unreachable";
  try {
    const res = await fetch(`${CONTEXT7_HTTP_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      context7StartupStatus = normalizeContext7Status(data.status || "ok");
    }
  } catch {
    // best effort only; detailed startup probe below already handles fallback messaging
  }

  logInfo(`========================================`);
  logInfo(`Symphony OpenAI Bridge Starting`);
  logInfo(`========================================`);
  logInfo(`Listening: http://127.0.0.1:${PORT}/v1`);
  logInfo(`Model: ${MODEL_ID}`);
  logInfo(`Auth token: Bearer ${API_KEY.slice(0, 10)}...`);
  logInfo(`Streaming: enabled`);
  logInfo(`Auto-fallback: enabled (credit-gate)`);
  logInfo(`Context7: ${context7StartupStatus} via ${CONTEXT7_HTTP_BASE}`);
  logInfo(
    `Hybrid RAG: indexed=${ragStats.indexed} docs=${ragStats.documentCount} builtAt=${ragStats.builtAt || "n/a"} embeddings=${ragStats.embeddingsAvailable} vectorStore=${ragStats.vectorStoreReady}`,
  );
  logInfo(
    `Linear RAG: ready=${linearStats.ready} entries=${linearStats.entries ?? 0} builtAt=${linearStats.builtAt || "n/a"}`,
  );
  logInfo(
    `Retrieval warmup: bm25=${summary.bm25} | vector=${summary.vector} | linear=${summary.linear} | enabled=${enabled}`,
  );
  logInfo(`Tools available: ${Object.keys(tools).join(", ")}`);
  logInfo(`========================================`);
}
