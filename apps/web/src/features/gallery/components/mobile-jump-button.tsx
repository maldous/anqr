import { DynamicIcon } from "./gallery-icon-registry";

export function MobileJumpButton({
  icon,
  label,
  isActive,
  onClick,
}: Readonly<{ icon: string; label: string; isActive: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      title={label}
    >
      <DynamicIcon name={icon} className="w-3 h-3" />
    </button>
  );
}
