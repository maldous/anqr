export const KNOWN_TOOL_CAPABLE = new Set([
  "codex",
  "codebuff-paid",
  "codebuff-free",
  "groq",
  "mistral",
  "gemini",
  "gemini-lite",
  "github-models",
  "fireworks",
  // cerebras removed: emits raw JSON tool calls (see non-tool-capable-providers.mjs)
  "sambanova",
  "together",
]);
