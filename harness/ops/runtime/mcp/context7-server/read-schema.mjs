export function readSchema(tool) {
  if (!tool || typeof tool !== "object") return {};
  const candidate = tool.inputSchema || tool.parameters || tool.schema || {};
  if (candidate && typeof candidate === "object") return candidate;
  return {};
}
