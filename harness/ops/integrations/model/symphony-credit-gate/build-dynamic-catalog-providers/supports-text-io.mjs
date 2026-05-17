import { resolveModalities } from "./resolve-modalities.mjs";

export function supportsTextIO(raw) {
  const inputModalities = resolveModalities(raw, "input");
  const outputModalities = resolveModalities(raw, "output");
  const acceptsText = inputModalities.length === 0 || inputModalities.includes("text");
  const outputsText = outputModalities.length === 0 || outputModalities.includes("text");
  return acceptsText && outputsText;
}
