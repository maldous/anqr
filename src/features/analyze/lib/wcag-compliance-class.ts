export const wcagComplianceClass = (ratio: number, threshold: number): string => {
  return ratio >= threshold
    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
    : 'bg-red-500/10 text-red-700 dark:text-red-400';
};
