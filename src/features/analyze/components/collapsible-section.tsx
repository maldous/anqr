import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const CollapsibleSection = ({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
  testId,
}: Readonly<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
  testId?: string;
}>) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg overflow-hidden" data-testid={testId}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-3 bg-muted/50 rounded-md shadow-sm hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
          <span className="font-medium text-sm">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        />
      </button>
      {isOpen && (
        <div className="px-3 pb-3 pt-3 mt-1 bg-card rounded-md shadow-sm border">{children}</div>
      )}
    </div>
  );
};
