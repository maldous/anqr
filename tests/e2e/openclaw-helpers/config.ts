export const SYMPHONY_BASE_URL = "http://127.0.0.1:4319";
export const SYMPHONY_EXECUTOR_URL = "http://127.0.0.1:4321";
export const SYMPHONY_API_KEY = "local-symphony";

export const openclawConfig = {
  primaryModel: "symphony-bridge/symphony/main",
  fallbackModels: [
    "symphony-bridge/symphony/codex",
    "symphony-bridge/symphony/codebuff",
    "symphony-bridge/symphony/codebuff-bridge",
    "symphony-bridge/symphony/groq",
    "symphony-bridge/symphony/mistral",
    "symphony-bridge/symphony/gemini",
    "symphony-bridge/symphony/gemini-lite",
    "symphony-bridge/symphony/openrouter",
    "symphony-bridge/symphony/sambanova",
    "symphony-bridge/symphony/cerebras",
    "symphony-bridge/symphony/ollama-local",
    "symphony-bridge/symphony/text",
    "ollama/qwen2.5-coder:0.5b",
    "ollama/qwen2.5-coder:3b-instruct",
    "ollama/qwen3-coder-next:latest",
    "codebuff-bridge/codebuff/base",
  ],
};
