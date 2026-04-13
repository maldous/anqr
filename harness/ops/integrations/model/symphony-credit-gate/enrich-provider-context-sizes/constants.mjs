export const CONTEXT_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const FETCH_TIMEOUT_MS = 15_000;

export const KNOWN_CONTEXT_SIZES = {
  codex: 200000,
  "codebuff-paid": 128000,
  "codebuff-free": 128000,
  gemini: 1048576,
  "gemini-lite": 1048576,
  "ollama-qwen2.5-coder-3b": 32768,
  "ollama-qwen2.5-coder-0.5b": 32768,
};

export const API_FIELD_PATTERNS = [
  "context_length",
  "contextLength",
  "max_context_length",
  "maxModelLength",
  "max_tokens",
  "input_token_limit",
  "context_window",
];
