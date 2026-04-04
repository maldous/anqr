export function renderCodeBlock(value) {
  const text = String(value || "").trim();
  return text ? `\`\`\`\n${text}\n\`\`\`` : "";
}
