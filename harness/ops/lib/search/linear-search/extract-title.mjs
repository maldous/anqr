export function extractTitle(content) {
  const match = content.match(/^#\s+([A-Z]+-\d+):\s+(.+)$/m);
  return match ? match[2] : "(no title)";
}
