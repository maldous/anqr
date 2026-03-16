import type { ComponentType, MouseEventHandler } from "react";
import { HeaderMobileNavLinkBody } from "./header-mobile-nav-link-body";

export function HeaderMobileNavCompactLink({
  external = false,
  href,
  IconComponent,
  iubendaEmbed = false,
  isActive,
  label,
  onClick,
  pageTitle,
}: Readonly<{
  external?: boolean;
  href: string;
  IconComponent: ComponentType<{ className?: string }>;
  iubendaEmbed?: boolean;
  isActive: boolean;
  label: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
  pageTitle: string;
}>) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-md transition-colors shadow-sm ${
        isActive
          ? "text-foreground bg-muted font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }${iubendaEmbed ? " iubenda-noiframe iubenda-embed" : ""}`}
      title={pageTitle}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={external ? `${label} (opens in new tab)` : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      <HeaderMobileNavLinkBody compact IconComponent={IconComponent} label={label} />
    </a>
  );
}
