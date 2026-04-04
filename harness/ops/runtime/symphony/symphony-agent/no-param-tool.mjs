export function noParamTool(name, description) {
  return {
    type: "function",
    function: { name, description, parameters: { type: "object", properties: {} } },
  };
}
