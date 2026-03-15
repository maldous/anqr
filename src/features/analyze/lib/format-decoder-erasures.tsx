export const formatDecoderErasures = (erasures: number | null) => {
  if (erasures === null) return <span className="text-muted-foreground">N/A</span>;
  if (erasures === 0) return <span className="text-green-600 dark:text-green-400">0</span>;
  return erasures;
};
