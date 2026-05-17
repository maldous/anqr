import { normalizeText } from "./normalize-text.mjs";

export function tokenize(value) {
  return normalizeText(value)
    .replaceAll(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}
