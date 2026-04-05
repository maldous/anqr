import { probeGenerateTextDetailed } from "./probe-generate-text-detailed.mjs";

export async function probeGeminiModels(apiKey, model) {
  const result = await probeGenerateTextDetailed(
    { name: "gemini", model, envVar: "GEMINI_TOKEN" },
    apiKey,
  );
  return result.available;
}
