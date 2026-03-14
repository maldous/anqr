export const capacityBadgeClass = (percentage: number): string => {
  if (percentage > 90) return 'bg-red-500/10 text-red-700 dark:text-red-400';
  if (percentage > 70) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-green-500/10 text-green-700 dark:text-green-400';
};
