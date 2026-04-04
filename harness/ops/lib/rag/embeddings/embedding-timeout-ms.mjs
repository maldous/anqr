// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:23

import { toPositiveInt } from "./to-positive-int.mjs";

export const EMBEDDING_TIMEOUT_MS = toPositiveInt(process.env.RAG_EMBEDDING_TIMEOUT_MS, 15_000);
