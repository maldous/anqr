// ── External providers: raw context windows ─────────────────────────────
// Used ONLY when dynamic catalog discovery is unavailable.
// The dynamic system (buildDynamicCatalogLimits) fetches real context windows
// from each provider's /v1/models endpoint and overrides these at runtime.
//
// These are published model context windows — converted to safe input budgets
// via toInputBudget() (60% of published) in buildProviderMaxInputTokens.
export const STATIC_CONTEXT_WINDOWS = {
  // llama-3.3-70b-versatile
  groq: 131_072,

  // mistral-small-latest
  mistral: 128_000,

  // gemini-2.5-flash
  gemini: 1_048_576,

  // gemini-2.5-flash-lite
  "gemini-lite": 1_048_576,

  // Meta-Llama-3.3-70B-Instruct
  sambanova: 128_000,

  // llama3.1-8b (free tier = 8k, paid tiers = 32k)
  cerebras: 8_192,

  // gpt-4.1-mini
  "github-models": 1_047_576,

  // openai/gpt-oss-20b
  huggingface: 131_072,

  // accounts/fireworks/models/deepseek-v3p1
  fireworks: 163_840,

  // openai/gpt-oss-20b
  together: 131_072,
};
