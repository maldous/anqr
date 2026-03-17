export const WCAGBadge = ({
  ratio,
  size = "md",
}: Readonly<{
  ratio: number;
  size?: "sm" | "md" | "lg";
}>) => {
  const meetsAAA = ratio >= 7;
  const meetsAA = ratio >= 4.5;
  const meetsAALarge = ratio >= 3;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-md font-bold ${sizeClasses[size]} ${(() => {
          if (meetsAAA) return "bg-green-500 text-white";
          if (meetsAA) return "bg-green-400 text-white";
          if (meetsAALarge) return "bg-amber-500 text-white";
          return "bg-red-500 text-white";
        })()}`}
      >
        {(() => {
          if (meetsAAA) return "AAA";
          if (meetsAA) return "AA";
          if (meetsAALarge) return "AA-L";
          return "Fail";
        })()}
      </span>
      <span className={`text-muted-foreground ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
        {ratio.toFixed(1)}:1
      </span>
    </div>
  );
};
