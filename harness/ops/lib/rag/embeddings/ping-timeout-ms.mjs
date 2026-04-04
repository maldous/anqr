import { toPositiveInt } from "./to-positive-int.mjs";

export const PING_TIMEOUT_MS = toPositiveInt(process.env.RAG_OLLAMA_PING_TIMEOUT_MS, 3_000);
