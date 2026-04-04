export const OLLAMA_BASE = String(process.env.OLLAMA_API_BASE || "http://127.0.0.1:11434").replace(
  /\/+$/,
  "",
);
