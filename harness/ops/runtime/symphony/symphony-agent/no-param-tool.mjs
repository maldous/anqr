// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:117

export function noParamTool(name, description) {
  return {
    type: "function",
    function: { name, description, parameters: { type: "object", properties: {} } },
  };
}
