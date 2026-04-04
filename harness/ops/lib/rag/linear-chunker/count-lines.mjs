export function countLines(text) {
  if (!text) return 1;
  return String(text).split("\n").length;
}
