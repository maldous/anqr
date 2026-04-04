export const EMBEDDING_MODEL =
  process.env.RAG_EMBEDDING_MODEL ||
  process.env.OLLAMA_EMBEDDING_MODEL ||
  "qwen2.5-coder:3b-instruct";
