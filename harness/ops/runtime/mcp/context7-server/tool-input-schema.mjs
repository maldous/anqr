function readSchema(tool) {
  if (!tool || typeof tool !== "object") return {};
  const candidate = tool.inputSchema || tool.parameters || tool.schema || {};
  if (candidate && typeof candidate === "object") return candidate;
  return {};
}

export function getToolPropertyNames(tool) {
  const schema = readSchema(tool);
  const properties = schema.properties || schema.input?.properties || {};
  return new Set(Object.keys(properties || {}));
}

export function supportsToolProperty(tool, propertyName) {
  return getToolPropertyNames(tool).has(propertyName);
}
