// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:225

export function findPreferredBreak(text, startOffset, candidateEnd, hardEnd) {
  if (candidateEnd >= hardEnd) return hardEnd;

  const minimum = startOffset + Math.floor((candidateEnd - startOffset) * 0.55);
  const newlineBreak = text.lastIndexOf("\n", candidateEnd);
  if (newlineBreak >= minimum) return newlineBreak + 1;

  const sentenceBreak = Math.max(
    text.lastIndexOf("\n\n", candidateEnd),
    text.lastIndexOf(". ", candidateEnd),
    text.lastIndexOf("; ", candidateEnd),
  );
  if (sentenceBreak >= minimum) return sentenceBreak + 1;

  const spaceBreak = text.lastIndexOf(" ", candidateEnd);
  if (spaceBreak >= minimum) return spaceBreak + 1;

  return candidateEnd;
}
