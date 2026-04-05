export async function probeMistralToolCapabilityViaHttp(providerDef, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();
  try {
    const response = await fetch(
      `${providerDef.baseUrl || "https://api.mistral.ai/v1"}/chat/completions`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: providerDef.model,
          messages: [
            {
              role: "user",
              content:
                "Use the add tool to add 2 and 2. Reply with only the numeric answer after the tool result.",
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "add",
                description: "Add two numbers",
                parameters: {
                  type: "object",
                  properties: { a: { type: "number" }, b: { type: "number" } },
                  required: ["a", "b"],
                },
              },
            },
          ],
          tool_choice: "auto",
          max_tokens: 100,
        }),
      },
    );
    const text = await response.text();
    return { status: response.status, body: text };
  } finally {
    clearTimeout(timer);
  }
}
