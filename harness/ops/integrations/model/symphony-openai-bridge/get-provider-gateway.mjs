// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:4010

import { OPENROUTER_PROVIDER_NAME_SET } from "./openrouter-provider-name-set.mjs";

export function getProviderGateway(name) {
  if (OPENROUTER_PROVIDER_NAME_SET.has(name)) return "openrouter";
  if (name === "gemini" || name === "gemini-lite") return "gemini";
  if (name.startsWith("ollama")) return "ollama";
  return name;
}
