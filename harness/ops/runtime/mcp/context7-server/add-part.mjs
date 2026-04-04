export function addPart(parts, value) {
  const text = String(value || "").trim();
  if (text) parts.push(text);
}
