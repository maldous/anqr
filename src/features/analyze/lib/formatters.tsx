export const formatMilliseconds = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return 'N/A';
  return `${ms.toFixed(2)} ms`;
};

export const nowMs = (): number => {
  return typeof globalThis.performance?.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
};

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

export const wcagComplianceClass = (ratio: number, threshold: number): string => {
  return ratio >= threshold
    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
    : 'bg-red-500/10 text-red-700 dark:text-red-400';
};

export const capacityBadgeClass = (percentage: number): string => {
  if (percentage > 90) return 'bg-red-500/10 text-red-700 dark:text-red-400';
  if (percentage > 70) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-green-500/10 text-green-700 dark:text-green-400';
};

export const formatDecoderVersion = (version: number | null) => {
  if (version === null) return <span className="text-red-500">— (not detected)</span>;
  return `${version} (${version * 4 + 17}×${version * 4 + 17})`;
};

export const formatDecoderMaskPattern = (maskPattern: number | null) => {
  if (maskPattern === null) return <span className="text-amber-500">— (not detected)</span>;
  return `${maskPattern}`;
};

export const formatDecoderErrors = (errorsCorrected: number | null) => {
  if (errorsCorrected === null)
    return <span className="text-muted-foreground">0 (clean decode)</span>;
  if (errorsCorrected === 0)
    return <span className="text-green-600 dark:text-green-400">0 (no errors)</span>;
  return <span className="text-amber-600 dark:text-amber-400">{errorsCorrected}</span>;
};

export const formatDecoderErasures = (erasures: number | null) => {
  if (erasures === null) return <span className="text-muted-foreground">N/A</span>;
  if (erasures === 0) return <span className="text-green-600 dark:text-green-400">0</span>;
  return erasures;
};

export const formatDecoderNumBits = (numBits: number | null) => {
  if (numBits === null) return <span className="text-muted-foreground">N/A</span>;
  return `${numBits} bits`;
};

export const formatDecoderOrientation = (orientation: number | null) => {
  if (orientation !== null && orientation !== 0) return `${orientation}°`;
  return <span className="text-muted-foreground">Standard (0°)</span>;
};

export const formatRsErrorCorrection = (errorsCorrected: number | null) => {
  if (errorsCorrected === null) return <span className="text-muted-foreground">Not available</span>;
  if (errorsCorrected > 0) {
    return (
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {errorsCorrected} error{errorsCorrected === 1 ? '' : 's'} recovered
      </span>
    );
  }
  return <span className="text-green-600 dark:text-green-400">No errors detected</span>;
};
