import { OPENROUTER_PROVIDER_NAMES } from "./openrouter-provider-names.mjs";

export const ADVERTISED_MODELS = [
  {
    id: "symphony/main",
    ownedBy: "symphony-bridge",
  },
  {
    id: "symphony/text",
    ownedBy: "symphony-bridge",
  },
  {
    id: "symphony/codex",
    ownedBy: "codex",
    allowedNames: ["codex"],
  },
  {
    id: "symphony/codebuff",
    ownedBy: "codebuff",
    allowedNames: ["codebuff"],
  },
  {
    id: "symphony/groq",
    ownedBy: "groq",
    allowedNames: ["groq"],
  },
  {
    id: "symphony/mistral",
    ownedBy: "mistral",
    allowedNames: ["mistral"],
  },
  {
    id: "symphony/gemini",
    ownedBy: "gemini",
    allowedNames: ["gemini"],
  },
  {
    id: "symphony/gemini-lite",
    ownedBy: "gemini-lite",
    allowedNames: ["gemini-lite"],
  },
  {
    id: "symphony/openrouter",
    ownedBy: "openrouter",
    allowedNames: OPENROUTER_PROVIDER_NAMES,
  },
  {
    id: "symphony/sambanova",
    ownedBy: "sambanova",
    allowedNames: ["sambanova"],
  },
  {
    id: "symphony/cerebras",
    ownedBy: "cerebras",
    allowedNames: ["cerebras"],
  },
  {
    id: "symphony/ollama-local",
    ownedBy: "ollama-local",
    allowedNames: ["ollama-qwen2.5-coder-3b", "ollama-qwen2.5-coder-0.5b"],
  },
  {
    id: "symphony/ollama-qwen2.5-coder-3b",
    ownedBy: "ollama-qwen2.5-coder-3b",
    allowedNames: ["ollama-qwen2.5-coder-3b"],
  },
  {
    id: "symphony/ollama-qwen2.5-coder-0.5b",
    ownedBy: "ollama-qwen2.5-coder-0.5b",
    allowedNames: ["ollama-qwen2.5-coder-0.5b"],
  },
  {
    id: "symphony/ollama-qwen3-coder-next",
    ownedBy: "ollama-local",
    allowedNames: ["ollama-local"],
  },
];
