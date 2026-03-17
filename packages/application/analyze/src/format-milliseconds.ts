export const formatMilliseconds = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "N/A";
  return `${ms.toFixed(2)} ms`;
};
