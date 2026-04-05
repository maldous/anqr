import { probeGenerateTextDetailed } from "./probe-generate-text-detailed.mjs";

export async function probeGeminiDetailed(provider, apiKey) {
  return probeGenerateTextDetailed(provider, apiKey);
}
