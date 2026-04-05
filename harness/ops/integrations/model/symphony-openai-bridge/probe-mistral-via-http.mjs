export async function probeMistralViaHttp(providerDef, apiKey) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: providerDef.model,
      messages: [
        {
          role: "user",
          content: "Use the add tool to add 2 and 2. Then reply with only the numeric answer.",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "add",
            description: "Add two integers",
            parameters: {
              type: "object",
              properties: { a: { type: "integer" }, b: { type: "integer" } },
              required: ["a", "b"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: "auto",
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`Mistral HTTP ${response.status}: ${JSON.stringify(payload)}`);
  const toolCalls = payload?.choices?.[0]?.message?.tool_calls || [];
  return { toolCalls, text: payload?.choices?.[0]?.message?.content || "" };
}
