// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:26

import { toPositiveInt } from "./to-positive-int.mjs";

export const HEALTH_CACHE_TTL_MS = toPositiveInt(process.env.RAG_OLLAMA_HEALTH_CACHE_TTL_MS, 5_000);
