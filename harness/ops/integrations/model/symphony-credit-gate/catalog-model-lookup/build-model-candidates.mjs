export function buildModelCandidates(entry) {
  const model = String(entry?.model || "")
    .trim()
    .toLowerCase();
  const candidates = new Set([model]);
  if (model.includes(":free")) candidates.add(model.replace(/:free$/i, ""));
  if (entry?.name === "github-models") candidates.add(`openai/${model}`);
  if (entry?.name === "sambanova") candidates.add(model.replaceAll("-", " "));
  return [...candidates].filter(Boolean);
}
