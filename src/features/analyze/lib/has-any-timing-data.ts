export const hasAnyTimingData = (timings: Record<string, number | null | undefined>): boolean => {
  return (
    [
      timings.decodeMs,
      timings.totalAnalysisMs,
      timings.encodeMs,
      timings.renderMs,
      timings.exportMs,
    ] as const
  ).some((value) => value !== null && value !== undefined);
};
