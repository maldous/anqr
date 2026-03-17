export const formatRsErrorCorrection = (errorsCorrected: number | null) => {
  if (errorsCorrected === null) return <span className="text-muted-foreground">Not available</span>;
  if (errorsCorrected > 0) {
    return (
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {errorsCorrected} error{errorsCorrected === 1 ? "" : "s"} recovered
      </span>
    );
  }
  return <span className="text-green-600 dark:text-green-400">No errors detected</span>;
};
