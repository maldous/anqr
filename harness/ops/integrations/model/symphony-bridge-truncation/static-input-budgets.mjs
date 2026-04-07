// ── Internal / local providers: pre-computed input budgets ──────────────
// These providers have no /v1/models catalog discovery and their values
// are already calibrated as input budgets. Used directly without conversion.
export const STATIC_INPUT_BUDGETS = {
  codex: 100_000,
  codebuff: 200_000,
  "codebuff-bridge": 200_000,

  // qwen2.5-coder:3b-instruct
  "ollama-qwen2.5-coder-3b": 32_768,

  // qwen2.5-coder:0.5b
  "ollama-qwen2.5-coder-0.5b": 32_768,

  // OpenRouter fallback (dynamic discovery preferred)
  "openrouter-free": 24_000,
};
