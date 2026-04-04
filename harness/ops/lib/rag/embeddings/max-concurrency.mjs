// Generated from ../../../../scripts/ops/lib/rag/embeddings.mjs:25

import { toPositiveInt } from "./to-positive-int.mjs";

export const MAX_CONCURRENCY = toPositiveInt(process.env.RAG_EMBEDDING_MAX_CONCURRENCY, 2);
