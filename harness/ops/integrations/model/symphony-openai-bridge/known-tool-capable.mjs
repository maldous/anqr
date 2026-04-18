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
  "cerebras", // dynamic: may be excluded at runtime by RAW_TOOL_JSON_TEXT detection
  "sambanova",
  "together",
]);
