export function lineIndexToOffset(lineStarts, lineIndex, textLength) {
  if (lineIndex <= 0) return 0;
  if (lineIndex >= lineStarts.length) return textLength;
  return lineStarts[lineIndex];
}
