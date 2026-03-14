import { useTranslation } from 'react-i18next';
import type { HeaderPage } from './header-resolve-page';
import { NAV_LINKS } from './nav-links';

export function HeaderMobileNav({
  mobileMenuOpen,
  isMobileMenuClosing,
  resolvedPage,
  onNavigate,
  onClose,
  onCloseAnimationEnd,
}: Readonly<{
  mobileMenuOpen: boolean;
  isMobileMenuClosing: boolean;
  resolvedPage: HeaderPage;
  onNavigate?: (page: HeaderPage) => void;
  onClose: () => void;
  onCloseAnimationEnd: () => void;
}>) {
  const { t } = useTranslation();
  if (!mobileMenuOpen && !isMobileMenuClosing) return null;
  return (
    <div
      id="mobile-nav-menu"
      className={`lg:hidden border-t bg-card shadow-lg p-3 overflow-hidden origin-top ${isMobileMenuClosing ? 'animate-[slide-up_0.2s_ease-in_forwards]' : 'animate-[slide-down_0.2s_ease-out_forwards]'}`}
      onAnimationEnd={() => {
        if (isMobileMenuClosing) onCloseAnimationEnd();
      }}
      aria-label="Mobile navigation"
    >
      <nav className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-1.5">
          {NAV_LINKS.slice(0, 2).map((link) => {
            const IconComponent = link.icon;
            const isActive = link.page === resolvedPage;
            return (
              <a
                key={link.labelKey}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted hover:bg-primary/10 text-foreground font-medium'}`}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(link.page);
                  }
                  onClose();
                }}
                title={`Go to ${t(link.labelKey, link.defaultLabel)}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm">{t(link.labelKey, link.defaultLabel)}</span>
              </a>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {NAV_LINKS.slice(2).map((link) => {
            const IconComponent = link.icon;
            const isActive = link.page === resolvedPage;
            if (link.external) {
              return (
                <a
                  key={link.labelKey}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-md transition-colors shadow-sm text-muted-foreground hover:bg-muted hover:text-foreground${link.iubendaEmbed ? ' iubenda-noiframe iubenda-embed' : ''}`}
                  title={t(link.labelKey, link.defaultLabel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onClose()}
                  aria-label={`${t(link.labelKey, link.defaultLabel)} (opens in new tab)`}
                >
                  <IconComponent className="w-5 h-5" aria-hidden="true" />
                  <span className="text-[11px] leading-tight text-center">
                    {t(link.labelKey, link.defaultLabel)}
                  </span>
                </a>
              );
            }
            return (
              <a
                key={link.labelKey}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-md transition-colors shadow-sm ${isActive ? 'text-foreground bg-muted font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(link.page);
                  }
                  onClose();
                }}
                title={`Go to ${t(link.labelKey, link.defaultLabel)}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] leading-tight text-center">
                  {t(link.labelKey, link.defaultLabel)}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
