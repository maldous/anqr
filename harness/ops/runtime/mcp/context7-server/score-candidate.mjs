import { normalizeValue } from "./normalize-value.mjs";

export function scoreCandidate(candidate, preferredText) {
  if (!candidate || !candidate.id) return -1;
  if (!preferredText) return 0;

  const preferred = normalizeValue(preferredText);
  const hint = normalizeValue(candidate.hint || "");
  const id = normalizeValue(candidate.id);

  if (id === preferred || hint === preferred) return 100;
  if (id.endsWith(`/${preferred}`)) return 90;
  if (hint.includes(preferred)) return 80;
  if (id.includes(preferred)) return 70;
  return 0;
}
