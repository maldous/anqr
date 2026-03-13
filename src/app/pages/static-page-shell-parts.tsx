import { ChevronDown, ChevronUp, List, Mail, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import type { TocGroup } from './static-page-types';

const REDDIT_URL = 'https://www.reddit.com/r/ANQR/';

export function TableOfContents({
  groups,
  activeSlug,
  onNavigate,
  onClose,
  isOpen,
  t,
}: Readonly<{
  groups: TocGroup[];
  activeSlug: string;
  onNavigate: (slug: string) => void;
  onClose: () => void;
  isOpen: boolean;
  t: (key: string) => string;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.length > 0 ? [groups[0].key] : [])
  );

  useEffect(() => {
    setExpandedGroups(new Set(groups.length > 0 ? [groups[0].key] : []));
  }, [groups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleItemClick = (slug: string) => {
    onNavigate(slug);
    setMobileOpen(false);
  };

  const handleGroupClick = (group: TocGroup) => {
    if (group.id) {
      handleItemClick(group.id);
    } else if (group.items.length > 0) {
      handleItemClick(group.items[0].id);
    }
    if (!expandedGroups.has(group.key)) {
      toggleGroup(group.key);
    }
  };

  const tocContent = (
    <nav className="text-sm">
      {groups.map((group) => (
        <div key={group.key} className="mb-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleGroupClick(group)}
              className="flex-1 text-left text-base font-bold text-foreground hover:text-primary py-2 px-2 rounded-l transition-colors cursor-pointer"
              title={`Go to ${group.title}`}
            >
              {group.title}
            </button>
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="p-2 rounded-r hover:bg-muted transition-colors"
              title={expandedGroups.has(group.key) ? 'Collapse' : 'Expand'}
            >
              {expandedGroups.has(group.key) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {expandedGroups.has(group.key) && (
            <ul className="mt-1 space-y-0.5 border-l-2 border-muted ml-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`block w-full text-left py-1 pl-3 pr-2 text-xs leading-snug transition-colors rounded-r ${
                      activeSlug === item.id
                        ? 'text-primary font-medium bg-primary/10 border-l-2 border-primary -ml-[2px]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="fixed z-50 p-2.5 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            style={{ top: 'calc(60px + env(safe-area-inset-top, 0px) + 12px)', left: '12px' }}
            title={t('accessibility.openGuideSidebar')}
          >
            <List className="h-5 w-5" />
          </button>
        )}

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 cursor-default"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-background border-r shadow-xl transition-transform duration-300 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <List className="h-4 w-4" />
              ANQR
            </h3>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={t('accessibility.closeSidebar')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)] scrollbar-hide">{tocContent}</div>
        </div>
      </div>

      <aside
        className={`hidden lg:block flex-shrink-0 border-r bg-background guide-sidebar transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-64' : 'w-0 border-r-0'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto py-6 px-4 scrollbar-hide">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <List className="h-4 w-4" />
              ANQR
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={t('accessibility.closeSidebar')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {tocContent}
        </div>
      </aside>
    </>
  );
}

export function Breadcrumb({ items, lang }: Readonly<{ items: string[]; lang: string }>) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
      aria-label="Breadcrumb"
    >
      <a href={`/?lang=${lang}`} className="hover:text-primary transition-colors">
        ANQR
      </a>
      {items.map((item, idx) => (
        <span key={item} className="flex items-center gap-2">
          <span className="text-muted-foreground/50">/</span>
          {idx === items.length - 1 ? (
            <span className="text-foreground font-medium">{item}</span>
          ) : (
            <a
              href={`/${item.toLowerCase()}?lang=${lang}`}
              className="hover:text-primary transition-colors"
            >
              {item}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ContactEmailLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t('contact.emailUs')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('contact.emailUsDesc')}</p>
      <Button asChild size="lg">
        <a href="mailto:email@anqr.link">
          <Mail className="h-4 w-4 mr-2" />
          email@anqr.link
        </a>
      </Button>
    </div>
  );
}

export function ContactRedditLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t('contact.redditCommunity')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('contact.redditCommunityDesc')}</p>
      <Button asChild size="lg">
        <a href={REDDIT_URL} target="_blank" rel="noopener noreferrer">
          <Users className="h-4 w-4 mr-2" />
          {t('contact.joinReddit')}
        </a>
      </Button>
    </div>
  );
}
