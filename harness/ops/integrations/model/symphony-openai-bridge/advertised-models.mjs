import { OPENROUTER_PROVIDER_NAMES } from "./openrouter-provider-names.mjs";

export const ADVERTISED_MODELS = [
  { id: "symphony/main", ownedBy: "symphony-bridge" },
  { id: "symphony/text", ownedBy: "symphony-bridge" },
  { id: "symphony/codex", ownedBy: "codex", allowedNames: ["codex"] },
  {
    id: "symphony/codebuff",
    ownedBy: "codebuff",
    allowedNames: ["codebuff-paid", "codebuff-free"],
  },
  {
    id: "symphony/codebuff-paid",
    ownedBy: "codebuff-paid",
    allowedNames: ["codebuff-paid"],
  },
  {
    id: "symphony/codebuff-free",
    ownedBy: "codebuff-free",
    allowedNames: ["codebuff-free"],
  },
  { id: "symphony/groq", ownedBy: "groq", allowedNames: ["groq"] },
  { id: "symphony/mistral", ownedBy: "mistral", allowedNames: ["mistral"] },
  { id: "symphony/gemini", ownedBy: "gemini", allowedNames: ["gemini"] },
  { id: "symphony/gemini-lite", ownedBy: "gemini-lite", allowedNames: ["gemini-lite"] },
  { id: "symphony/openrouter", ownedBy: "openrouter", allowedNames: OPENROUTER_PROVIDER_NAMES },
  { id: "symphony/sambanova", ownedBy: "sambanova", allowedNames: ["sambanova"] },
  // cerebras removed — 8B model below minimum coding capability threshold
  {
    id: "symphony/github-models",
    ownedBy: "github-models",
    allowedNames: ["github-models"],
  },
  { id: "symphony/huggingface", ownedBy: "huggingface", allowedNames: ["huggingface"] },
  { id: "symphony/fireworks", ownedBy: "fireworks", allowedNames: ["fireworks"] },
  { id: "symphony/together", ownedBy: "together", allowedNames: ["together"] },
  // ollama 3b/0.5b removed — below 14B minimum coding capability threshold
  // ollama-qwen3-coder-next removed — no corresponding static provider after ollama cleanup
  { id: "symphony/deepseek", ownedBy: "deepseek", allowedNames: ["deepseek"] },
];
