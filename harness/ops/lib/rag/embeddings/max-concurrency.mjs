import { toPositiveInt } from "./to-positive-int.mjs";

export const MAX_CONCURRENCY = toPositiveInt(process.env.RAG_EMBEDDING_MAX_CONCURRENCY, 2);
