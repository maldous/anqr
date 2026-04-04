// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:266

import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeGeminiModels(apiKey, model) {
  const res = await probeWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
  );
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}
