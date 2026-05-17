export function escapeProviderProbeMarkdownCell(text) {
  return String(text || "")
    .replaceAll("|", String.raw`\|`)
    .replaceAll("\n", " ");
}
