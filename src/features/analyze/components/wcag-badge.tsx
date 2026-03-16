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
        className={`inline-flex items-center gap-1 rounded-md font-bold ${sizeClasses[size]} ${
          meetsAAA
            ? "bg-green-500 text-white"
            : meetsAA
              ? "bg-green-400 text-white"
              : meetsAALarge
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
        }`}
      >
        {meetsAAA ? "AAA" : meetsAA ? "AA" : meetsAALarge ? "AA-L" : "Fail"}
      </span>
      <span className={`text-muted-foreground ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
        {ratio.toFixed(1)}:1
      </span>
    </div>
  );
};
