export const ColorSwatch = ({
  color,
  label,
}: Readonly<{
  color: string;
  label: string;
}>) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border shadow-md"
        style={{ backgroundColor: color }}
        title={color}
      />
      <div className="text-xs">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground font-mono">{color}</div>
      </div>
    </div>
  );
};
