// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:106

export function paramTool(name, description, properties, required) {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: { type: "object", properties, required },
    },
  };
}
