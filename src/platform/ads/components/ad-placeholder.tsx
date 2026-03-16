import type { AdPlaceholderProps } from "./ad-placeholder.types";

export function AdPlaceholder({
  slot,
  width = "100%",
  height = 90,
  className = "",
  format = "auto",
}: AdPlaceholderProps) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const isProduction = import.meta.env.PROD;
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true";

  // In production test mode, show a more polished placeholder
  if (isProduction && isTestMode) {
    return (
      <div
        className={`ad-placeholder bg-gradient-to-br from-muted/60 to-muted/30 border border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-1 ${className}`}
        style={{
          width: widthStyle,
          height: `${height}px`,
          minHeight: `${height}px`,
        }}
        data-ad-slot={slot}
        data-ad-format={format}
      >
        <span className="text-xs font-medium text-muted-foreground/70">Advertisement</span>
        <span className="text-[10px] text-muted-foreground/50">(Test Mode)</span>
      </div>
    );
  }

  // Development placeholder with slot name for debugging
  return (
    <div
      className={`ad-placeholder bg-muted/50 border border-dashed border-muted-foreground/40 rounded flex items-center justify-center text-xs text-muted-foreground ${className}`}
      style={{
        width: widthStyle,
        height: `${height}px`,
        minHeight: `${height}px`,
      }}
      data-ad-slot={slot}
      data-ad-format={format}
    >
      <span>Ad: {slot}</span>
    </div>
  );
}
