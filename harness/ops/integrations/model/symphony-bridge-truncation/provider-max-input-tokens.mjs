export const PROVIDER_MAX_INPUT_TOKENS = {
  // --- Paid / managed providers ---
  codex: 100_000, // GPT-5 Codex, 200K context
  codebuff: 200_000, // managed internally by SDK
  "codebuff-bridge": 200_000, // managed internally

  // --- Direct free-cloud providers ---
  groq: 6_000, // llama-3.3-70b: 12K TPM free tier (shared input+output+tools)
  mistral: 24_000, // mistral-small-latest: 32K context
  gemini: 200_000, // gemini-2.5-flash: 1M context
  "gemini-lite": 200_000, // gemini-2.5-flash-lite: 1M context
  sambanova: 24_000, // Llama-3.3-70B: 128K context, conservative
  cerebras: 4_000, // llama3.1-8b: 8K context, very aggressive limit for free tier stability
  "github-models": 8_000, // gpt-4.1-mini: 8K max request body

  // --- OpenRouter FREE models (context varies by underlying model) ---
  "openrouter-nemotron-super": 24_000, // 120B, 128K context
  "openrouter-free": 16_000, // auto-routed, varies
  "openrouter-nemotron-nano-30b": 16_000, // 30B, 128K context
  "openrouter-qwen3-next-80b": 24_000, // 80B, 128K context
  "openrouter-step3-5-flash": 12_000, // step-3.5-flash (conservative - model has tight limits)
  "openrouter-trinity-mini": 8_000, // small model
  "openrouter-nemotron-nano-9b": 16_000, // 9B, 128K context
  "openrouter-minimax-m2.5": 24_000, // minimax, 1M context
  "openrouter-qwen3-coder": 24_000, // qwen3-coder, 128K
  "openrouter-lfm-2.5-thinking": 8_000, // 1.2B param, 32K context
  "openrouter-lfm-2.5-instruct": 8_000, // 1.2B param, 32K context
  "openrouter-nemotron-nano-12b-vl": 16_000, // 12B, 128K context
  "openrouter-trinity-large": 16_000, // medium model
  "openrouter-mistral-small-3.1": 24_000, // 24B, 32K context
  "openrouter-llama-3.3-70b": 24_000, // 70B, 128K context
  "openrouter-qwen3-4b": 8_000, // 4B, 32K context
  "openrouter-gpt-oss-120b": 24_000, // 120B
  "openrouter-gpt-oss-20b": 16_000, // 20B
  "openrouter-llama-3.2-3b": 8_000, // 3B, 128K context but tiny
  "openrouter-dolphin-mistral": 24_000, // 24B, 32K context
  "openrouter-gemma-3-27b": 24_000, // 27B, 128K context
  "openrouter-glm-4.5-air": 24_000, // glm-4.5-air, 128K
  "openrouter-gemma-3n-e2b": 8_000, // small model
  "openrouter-gemma-3-4b": 8_000, // 4B, 128K context
  "openrouter-gemma-3n-e4b": 8_000, // small model
  "openrouter-gemma-3-12b": 16_000, // 12B, 128K context
  "openrouter-hermes-3-405b": 24_000, // 405B, 128K context

  // --- Local safety-net providers ---
  "ollama-qwen2.5-coder-3b": 24_000, // qwen2.5-coder:3b-instruct ~32K
  "ollama-qwen2.5-coder-0.5b": 16_000, // qwen2.5-coder:0.5b ~32K
};
