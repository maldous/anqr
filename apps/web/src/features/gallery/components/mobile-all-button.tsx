import { Grid3x3 } from "lucide-react";

export function MobileAllButton({
  isActive,
  onClick,
  title,
}: Readonly<{ isActive: boolean; onClick: () => void; title: string }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      title={title}
    >
      <Grid3x3 className="w-3 h-3" />
    </button>
  );
}
