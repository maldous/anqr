export const formatDecoderErrors = (errorsCorrected: number | null) => {
  if (errorsCorrected === null)
    return <span className="text-muted-foreground">0 (clean decode)</span>;
  if (errorsCorrected === 0)
    return <span className="text-green-600 dark:text-green-400">0 (no errors)</span>;
  return <span className="text-amber-600 dark:text-amber-400">{errorsCorrected}</span>;
};
