import { List, X } from "lucide-react";

export function TableOfContentsPanelHeader({
  className,
  onClose,
  title,
}: Readonly<{
  className: string;
  onClose: () => void;
  title: string;
}>) {
  return (
    <div className={className}>
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <List className="h-4 w-4" />
        ANQR
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title={title}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
