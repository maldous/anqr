export function responsesToolsToChatTools(tools) {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;

  return tools
    .filter((t) => t.type === "function")
    .map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.parameters || { type: "object", properties: {} },
        ...(t.strict === undefined ? {} : { strict: t.strict }),
      },
    }));
}
