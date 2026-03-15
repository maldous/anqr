export const DetailRow = ({
  label,
  value,
  icon,
  className = '',
}: Readonly<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div className={`flex items-center justify-between py-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
};
