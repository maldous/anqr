export function escapeProviderProbeMarkdownCell(text) {
  return String(text || '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}
