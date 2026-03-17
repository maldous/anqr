export const ProgressBar = ({
  value,
  max,
  label,
}: Readonly<{
  value: number;
  max: number;
  label?: string;
}>) => {
  const percentage = Math.min((value / max) * 100, 100);
  let colorClass: string;
  if (percentage > 90) colorClass = "bg-red-500";
  else if (percentage > 70) colorClass = "bg-amber-500";
  else colorClass = "bg-green-500";

  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value} used</span>
        <span>{max} max</span>
      </div>
    </div>
  );
};
