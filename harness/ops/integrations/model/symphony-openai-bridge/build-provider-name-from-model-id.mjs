export function buildProviderNameFromModelId(modelId) {
  return `openrouter-${String(modelId || "unknown")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(?:^-+|-+$)/g, "")}`;
}
