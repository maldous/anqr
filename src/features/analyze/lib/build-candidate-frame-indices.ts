export function buildCandidateFrameIndices(
  cachedFramesLength: number,
  currentIdx: number
): number[] {
  const candidateIndices: number[] = [];

  const pushUnique = (idx: number) => {
    const clamped = Math.max(0, Math.min(cachedFramesLength - 1, Math.floor(idx)));
    if (!candidateIndices.includes(clamped)) {
      candidateIndices.push(clamped);
    }
  };

  pushUnique(currentIdx);
  pushUnique(Math.floor(cachedFramesLength * 0.25));
  pushUnique(Math.floor(cachedFramesLength * 0.5));
  pushUnique(Math.floor(cachedFramesLength * 0.75));
  pushUnique(cachedFramesLength - 1);

  return candidateIndices;
}
