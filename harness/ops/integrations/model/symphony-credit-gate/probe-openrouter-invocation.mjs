import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeOpenrouterInvocation(baseUrl, model, apiKey, timeoutMs) {
  const res = await probeWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with exactly: ok" }],
      max_tokens: 8,
    }),
    timeoutMs,
  });
  return !!res && res.ok;
}
