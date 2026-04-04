export function pushCandidate(candidates, id, hint = "") {
  const value = String(id || "").trim();
  if (!value.startsWith("/")) return;
  candidates.push({ id: value, hint: String(hint || "").trim() });
}
