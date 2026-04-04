// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:27

import { toPositiveInt } from "./to-positive-int.mjs";

export const FAILURE_COOLDOWN_MS = toPositiveInt(
  process.env.RAG_OLLAMA_FAILURE_COOLDOWN_MS,
  10_000,
);
