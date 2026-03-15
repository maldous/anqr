import type { ComponentType } from 'react';

export function HeaderMobileNavLinkBody({
  compact = false,
  IconComponent,
  label,
}: Readonly<{
  compact?: boolean;
  IconComponent: ComponentType<{ className?: string }>;
  label: string;
}>) {
  return (
    <>
      <IconComponent className="w-5 h-5" aria-hidden="true" />
      <span className={compact ? 'text-[11px] leading-tight text-center' : 'text-sm'}>{label}</span>
    </>
  );
}
