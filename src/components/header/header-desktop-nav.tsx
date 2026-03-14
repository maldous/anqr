import { useTranslation } from 'react-i18next';
import type { HeaderPage } from './header-resolve-page';
import { NAV_LINKS } from './nav-links';

export function HeaderDesktopNav({
  resolvedPage,
  onNavigate,
}: Readonly<{ resolvedPage: HeaderPage; onNavigate?: (page: HeaderPage) => void }>) {
  const { t } = useTranslation();
  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
      {NAV_LINKS.map((link) => {
        const isActive = link.page === resolvedPage;
        if (link.external) {
          return (
            <a
              key={link.labelKey}
              href={link.href}
              className={`px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted${link.iubendaEmbed ? ' iubenda-noiframe iubenda-embed' : ''}`}
              title={t(link.labelKey, link.defaultLabel)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(link.labelKey, link.defaultLabel)}
            </a>
          );
        }
        return (
          <a
            key={link.labelKey}
            href={link.href}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${isActive ? 'text-foreground bg-muted font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            onClick={(e) => {
              if (!onNavigate) return;
              e.preventDefault();
              onNavigate(link.page);
            }}
            title={`Go to ${t(link.labelKey, link.defaultLabel)}`}
          >
            {t(link.labelKey, link.defaultLabel)}
          </a>
        );
      })}
    </nav>
  );
}
