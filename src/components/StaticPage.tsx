/**
 * StaticPage
 * About, Privacy, Terms, Contact, and Guide pages.
 */

import { Capacitor } from '@capacitor/core';
import { ChevronDown, ChevronUp, List, Loader2, Mail, Menu, Users, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/components/AdUnit';
import { Button } from '@/components/ui/button';
import type { PageDefinition, PageLink, PageSection } from '@/i18n/static';
import { CONTACT_EMAIL, getStaticContentAsync, LAST_UPDATED } from '@/i18n/static';

export type StaticPageType =
  | 'about'
  | 'guide'
  | 'learn'
  | 'examples'
  | 'translate'
  | 'privacy'
  | 'terms'
  | 'contact';

interface StaticPageProps {
  page: StaticPageType;
}
// Helper to get image URL - use absolute URL on native to load from web
function getImageUrl(src: string): string {
  // On native apps, load images from the web to keep APK size small
  if (Capacitor.isNativePlatform() && src.startsWith('/')) {
    return `https://anqr.link${src}`;
  }
  return src;
}

// Helper to generate URL-friendly slug from heading
function _slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(?:^-|-$)/g, '');
}

// Helper to process ${lang} placeholder in hrefs
function processHref(href: string, lang: string): string {
  return href.replaceAll('${lang}', lang);
}

// Helper to render text with clickable URLs and internal links
// Supports: https://... URLs and [[/path|Label]] internal links
// Also detects numbered lists "1. X 2. Y 3. Z" and renders as proper list items
function renderTextWithLinks(text: string, lang: string): React.ReactNode {
  // First check if this is a numbered list (contains "1. ... 2. ..." pattern)
  const numberedListRegex = /(?:^|\s)(\d+)\.\s/g;
  const matches = [...text.matchAll(numberedListRegex)];

  // If we have 2+ numbered items, treat as a list
  if (matches.length >= 2) {
    // Split by numbered items pattern
    const items: { num: string; content: string }[] = [];
    let _lastEnd = 0;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const num = match[1];
      const matchIndex = match.index ?? 0;
      const _startOfNumber = matchIndex + (match[0].startsWith(' ') ? 1 : 0);
      const startOfContent = matchIndex + match[0].length;

      // Find where this item ends (start of next number or end of string)
      const nextMatch = matches[i + 1];
      let endOfContent: number;
      if (nextMatch) {
        const nextIndex = nextMatch.index ?? 0;
        endOfContent = nextIndex + (nextMatch[0].startsWith(' ') ? 1 : 0);
      } else {
        endOfContent = text.length;
      }

      const content = text.slice(startOfContent, endOfContent).trim();
      if (content) {
        items.push({ num, content });
      }
      _lastEnd = endOfContent;
    }

    if (items.length >= 2) {
      return (
        <ol className="list-decimal pl-5 space-y-1.5 text-left">
          {items.map((item) => (
            <li key={`${item.num}-${item.content.slice(0, 20)}`} className="leading-relaxed">
              {renderTextContent(item.content, lang)}
            </li>
          ))}
        </ol>
      );
    }
  }

  // Not a numbered list, render normally
  return renderTextContent(text, lang);
}

// Helper to render text content with links (used by renderTextWithLinks)
function renderTextContent(text: string, lang: string): React.ReactNode {
  // Combined regex: match URLs or [[path|label]] syntax
  // NOSONAR - This regex is safe: no nested quantifiers or overlapping alternatives that could cause catastrophic backtracking
  const combinedRegex = /(https?:\/\/[^\s]+)|\[\[([^|\]]+)\|([^\]]+)\]\]/g;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      // External URL match
      result.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {match[1]}
        </a>
      );
    } else if (match[2] && match[3]) {
      // Internal link [[path|label]] match
      const href = processHref(match[2], lang);
      const label = match[3];
      const isExternal = href.startsWith('http');

      result.push(
        <a
          key={`link-${keyIndex++}`}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-primary hover:underline"
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex)}</span>);
  }

  return result.length > 0 ? result : text;
}

// ToC group structure for pages with table of contents
type TocGroup = {
  key: string; // stable, non-i18n identifier for group
  title: string;
  id?: string; // ID of the first section in this group (for header navigation)
  items: { id: string; title: string }[];
};

// Build TOC for Guide page with categorized groups
function buildGuideToc(sections: PageSection[], t: (key: string) => string): TocGroup[] {
  const groups: TocGroup[] = [
    { key: 'guide-0', title: t('nav.guide'), id: '', items: [] },
    { key: 'guide-1', title: t('tiers.basic'), id: '', items: [] },
    { key: 'guide-2', title: t('tiers.advanced'), id: '', items: [] },
    { key: 'guide-3', title: t('tiers.professional'), id: '', items: [] },
    { key: 'guide-4', title: 'API', id: '', items: [] },
    { key: 'guide-5', title: t('payload.other'), id: '', items: [] },
  ];

  // Map section indices to groups (stable across languages)
  const getGroupIndex = (sectionIndex: number): number => {
    if (sectionIndex <= 1) return 0;
    if (sectionIndex <= 4) return 1;
    if (sectionIndex <= 40) return 2;
    if (sectionIndex <= 56) return 3;
    if (sectionIndex <= 69) return 4;
    return 5;
  };

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;
    const groupIndex = getGroupIndex(index);
    // First item in each group becomes the group's header link target
    if (!groups[groupIndex].id) {
      groups[groupIndex].id = id;
    }
    groups[groupIndex].items.push({ id, title: section.heading });
  }

  return groups.filter((g) => g.items.length > 0);
}

// Build TOC for Learn page with 5 guides grouped logically
// Each guide starts at a section with links (end of previous guide) or at index 0
function buildLearnToc(sections: PageSection[], _t: (key: string) => string): TocGroup[] {
  const groups: TocGroup[] = [];

  // Guide start indices based on actual learn.ts structure:
  // Guide 1: 7 sections (0-6), Guide 2: 6 sections (7-12), Guide 3: 6 sections (13-18),
  // Guide 4: 7 sections (19-25), Guide 5: 7 sections (26-32)
  const guideStartIndices = new Set([0, 7, 13, 19, 26]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    // Guide title sections
    if (guideStartIndices.has(index)) {
      groups.push({
        key: `learn-${groups.length}`,
        title: section.heading,
        id,
        items: [],
      });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

// Build TOC for Examples page with 5 examples grouped logically
// Each example has 5 sections based on examples.ts structure
function buildExamplesToc(sections: PageSection[], _t: (key: string) => string): TocGroup[] {
  const groups: TocGroup[] = [];

  // Example start indices based on actual examples.ts structure:
  // Each example has 5 sections (case study + 4 subsections)
  const exampleStartIndices = new Set([0, 5, 10, 15, 20]);

  for (const [index, section] of sections.entries()) {
    if (!section.heading) continue;
    const id = `section-${index}`;

    // Example title sections
    if (exampleStartIndices.has(index)) {
      groups.push({
        key: `example-${groups.length}`,
        title: section.heading,
        id,
        items: [],
      });
    } else if (groups.length > 0) {
      groups[groups.length - 1].items.push({ id, title: section.heading });
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

// Generic TOC builder that delegates to page-specific builders
function buildToc(
  page: StaticPageType,
  sections: PageSection[],
  t: (key: string) => string
): TocGroup[] {
  switch (page) {
    case 'guide':
      return buildGuideToc(sections, t);
    case 'learn':
      return buildLearnToc(sections, t);
    case 'examples':
      return buildExamplesToc(sections, t);
    default:
      return [];
  }
}

// Table of Contents component for content-heavy pages (guide, learn, examples)
function TableOfContents({
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

  // On desktop, respect isOpen prop. On mobile, always render (has its own mobileOpen state)
  // We check window width via CSS classes, so we render both but hide with lg:hidden / hidden lg:block
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.length > 0 ? [groups[0].key] : [])
  );

  // Reset expanded groups when groups change (e.g., language change)
  useEffect(() => {
    setExpandedGroups(new Set(groups.length > 0 ? [groups[0].key] : []));
  }, [groups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleItemClick = (slug: string) => {
    onNavigate(slug);
    setMobileOpen(false);
  };

  // Find active group for mobile display
  const activeGroup = groups.find((g) => g.items.some((item) => item.id === activeSlug));
  const _activeItem = activeGroup?.items.find((item) => item.id === activeSlug);

  // Handle clicking on a group title - navigate to the group's header section
  const handleGroupClick = (group: TocGroup) => {
    // Navigate to the group's header section (first section in that group)
    if (group.id) {
      handleItemClick(group.id);
    } else if (group.items.length > 0) {
      handleItemClick(group.items[0].id);
    }
    // Also expand the group if it's collapsed
    if (!expandedGroups.has(group.key)) {
      toggleGroup(group.key);
    }
  };

  const tocContent = (
    <nav className="text-sm">
      {groups.map((group) => (
        <div key={group.key} className="mb-4">
          {/* Group header - clickable to navigate to first item */}
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
          {/* Sub-items - smaller text for clear hierarchy */}
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
      {/* Mobile ToC - slide-out drawer */}
      <div className="lg:hidden">
        {/* Toggle button fixed at top */}
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="fixed z-50 p-2.5 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            style={{
              top: 'calc(60px + env(safe-area-inset-top, 0px) + 12px)',
              left: '12px',
            }}
            title={t('accessibility.openGuideSidebar')}
          >
            <List className="h-5 w-5" />
          </button>
        )}

        {/* Backdrop */}
        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 cursor-default"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar drawer */}
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

      {/* Desktop ToC - sticky sidebar with slide animation */}
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

// Breadcrumb component for navigation hierarchy
function Breadcrumb({ items, lang }: Readonly<{ items: string[]; lang: string }>) {
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

// Render related content links as consistent styled buttons
function RelatedLinks({
  links,
  lang,
  t,
}: Readonly<{
  links: PageLink[];
  lang: string;
  t: (key: string) => string;
}>) {
  if (!links || links.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('nav.related') || 'Related'}
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <Button
            key={link.href}
            asChild
            variant="outline"
            size="default"
            className="min-w-[140px]"
          >
            <a href={processHref(link.href, lang)}>{link.label}</a>
          </Button>
        ))}
      </div>
    </div>
  );
}

function ContactEmailLink() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 text-center">
      <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t('contact.emailUs')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('contact.emailUsDesc')}</p>
      <Button asChild size="lg">
        <a href={`mailto:${CONTACT_EMAIL}`}>
          <Mail className="h-4 w-4 mr-2" />
          {CONTACT_EMAIL}
        </a>
      </Button>
    </div>
  );
}

const REDDIT_URL = 'https://www.reddit.com/r/ANQR/';

function ContactRedditLink() {
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

export function StaticPage({ page }: Readonly<StaticPageProps>) {
  const { t, i18n } = useTranslation();
  const [def, setDef] = useState<PageDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load content when language or page changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getStaticContentAsync(i18n.language, page).then((content) => {
      if (!cancelled) {
        setDef(content);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [i18n.language, page]);

  // Update page title when content loads
  useEffect(() => {
    if (def) {
      document.title = `${def.title} | ANQR`;
    }
  }, [def]);

  // Pages that show TOC sidebar: guide, learn, examples
  const hasToc = page === 'guide' || page === 'learn' || page === 'examples';
  const tocGroups = useMemo(
    () => (hasToc && def ? buildToc(page, def.sections, t) : []),
    [hasToc, page, def, t]
  );
  const [activeSlug, setActiveSlug] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Clear section refs when language/content changes to prevent stale refs accumulating
  useEffect(() => {
    sectionRefs.current.clear();
  }, []);

  // Track active section with IntersectionObserver
  useEffect(() => {
    if (!hasToc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by position in viewport (topmost first)
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topEntry = visibleEntries[0];
          const slug = (topEntry.target as HTMLElement).dataset.slug;
          if (slug) setActiveSlug(slug);
        }
      },
      {
        root: contentRef.current,
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    // Observe all section headings
    for (const el of sectionRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [hasToc]);

  // Navigate to section with smooth scroll
  // Uses scrollIntoView which is more reliable than manual offset calculation
  const navigateToSection = useCallback((slug: string) => {
    const el = sectionRefs.current.get(slug);
    if (el) {
      // scrollIntoView handles nested scroll containers correctly
      // scroll-margin-top CSS handles the header offset
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSlug(slug);
      // Update URL hash without triggering scroll
      globalThis.history.replaceState(null, '', `#${slug}`);
    }
  }, []);

  // Handle initial hash on mount
  useEffect(() => {
    if (!(hasToc && def)) return;
    const hash = globalThis.location.hash.slice(1);
    if (!hash) {
      if (tocGroups.length > 0 && tocGroups[0].items.length > 0) {
        setActiveSlug(tocGroups[0].items[0].id);
      }
      return;
    }

    // Use requestAnimationFrame with retry to ensure refs are populated
    // Once found, add small delay to ensure layout is complete before scrolling
    let attempts = 0;
    const maxAttempts = 30; // ~500ms at 60fps
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tryNavigate = () => {
      const el = sectionRefs.current.get(hash);
      if (el) {
        // Small delay to ensure layout is complete on production
        timeoutId = setTimeout(() => {
          navigateToSection(hash);
        }, 100);
      } else if (attempts < maxAttempts) {
        attempts++;
        rafId = requestAnimationFrame(tryNavigate);
      }
    };

    rafId = requestAnimationFrame(tryNavigate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [hasToc, def, tocGroups, navigateToSection]);

  // Register section ref
  const registerSectionRef = useCallback((slug: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(slug, el);
    } else {
      sectionRefs.current.delete(slug);
    }
  }, []);

  // State for TOC sidebar visibility - starts visible on desktop (web)
  const [isTocSidebarOpen, setIsTocSidebarOpen] = useState(true);

  // Note: Click outside to close is disabled - user must click X button to close sidebar

  // Loading state
  if (isLoading || !def) {
    return (
      <main className="min-h-[200px] flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">{t('loading')}</span>
        </div>
      </main>
    );
  }

  // For pages with TOC (guide, learn, examples), use layout with sidebar
  if (hasToc) {
    return (
      <main className="min-h-[200px] flex-1 flex bg-background overflow-hidden transition-all duration-300">
        {/* Left ad column - hidden on TOC pages to make room for ToC */}
        <div className="hidden xl:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-3 pr-2">
          <AdUnit slot="static-left" width={160} height={600} format="vertical" />
        </div>

        {/* Toggle button when sidebar is closed - positioned in main content area */}
        {!isTocSidebarOpen && (
          <div className="hidden lg:block relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTocSidebarOpen(true);
              }}
              className="toc-sidebar-toggle absolute left-4 top-4 z-40 p-2 rounded-lg bg-card border shadow-md hover:bg-muted transition-colors"
              title={t('accessibility.openGuideSidebar')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents
          groups={tocGroups}
          activeSlug={activeSlug}
          onNavigate={navigateToSection}
          onClose={() => setIsTocSidebarOpen(false)}
          isOpen={isTocSidebarOpen}
          t={t}
        />

        {/* Main content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto bg-background scrollbar-hide">
          {/* Centered header section like Gallery */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            {def.breadcrumb && (
              <div className="flex justify-center mb-2">
                <Breadcrumb items={def.breadcrumb} lang={i18n.language} />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">
                {def.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {def.description}
              </p>
            </div>
          </div>

          {/* Horizontal ad below header */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-center">
              <AdUnit slot={`${page}-top`} width={728} height={90} format="horizontal" />
            </div>
          </div>

          <article className="max-w-3xl mx-auto px-4 sm:px-6 py-4 text-justify">
            <div className="space-y-8 sm:space-y-10">
              {def.sections.map((section, i) => {
                const slug = `section-${i}`;
                // Check if this section is a main heading (group title) vs a subheading
                const isMainHeading = tocGroups.some((g) => g.id === slug);
                return (
                  <section
                    key={section.heading}
                    id={slug}
                    data-slug={slug}
                    ref={(el) => registerSectionRef(slug, el)}
                    className={`space-y-3 sm:space-y-4 scroll-mt-20 ${isMainHeading ? 'mt-8 pt-6 border-t border-border first:mt-0 first:pt-0 first:border-t-0' : ''}`}
                  >
                    {isMainHeading ? (
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        <a
                          href={`#${slug}`}
                          className="hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToSection(slug);
                          }}
                        >
                          {section.heading}
                        </a>
                      </h2>
                    ) : (
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                        <a
                          href={`#${slug}`}
                          className="hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToSection(slug);
                          }}
                        >
                          {section.heading}
                        </a>
                      </h3>
                    )}

                    {section.paragraphs?.map((p) => (
                      <p
                        key={p.slice(0, 50)}
                        className="text-sm sm:text-base text-muted-foreground leading-relaxed"
                      >
                        {renderTextWithLinks(p, i18n.language)}
                      </p>
                    ))}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
                        {section.bullets.map((b) => (
                          <li key={b} className="leading-relaxed">
                            {renderTextWithLinks(b, i18n.language)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Images */}
                    {section.images && section.images.length > 0 && (
                      <div className="space-y-4 my-4">
                        {section.images.map((image) => (
                          <figure key={image.src} className="w-full">
                            <img
                              src={getImageUrl(image.src)}
                              alt={image.alt}
                              className="w-full rounded-lg shadow-md border"
                              loading="lazy"
                            />
                            {image.caption && (
                              <figcaption className="text-sm sm:text-base text-muted-foreground mt-2 text-justify italic">
                                {image.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {def.relatedLinks && (
              <RelatedLinks links={def.relatedLinks} lang={i18n.language} t={t} />
            )}

            {/* Bottom horizontal ad */}
            <div className="mt-8 flex justify-center">
              <AdUnit slot={`${page}-bottom`} width={728} height={90} format="horizontal" />
            </div>

            <div className="mt-8 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                {t('accessibility.lastUpdated')}: {LAST_UPDATED}
              </p>
            </div>
          </article>
        </div>

        {/* Right ad column */}
        <div className="hidden xl:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-2 pr-3">
          <AdUnit slot="static-right" width={160} height={600} format="vertical" />
        </div>
      </main>
    );
  }

  // Standard layout for non-guide pages
  return (
    <main className="min-h-[200px] flex-1 flex bg-background overflow-hidden transition-all duration-300">
      {/* Left ad column */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-3 pr-2">
        <AdUnit slot="static-left" width={160} height={600} format="vertical" />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-background scrollbar-hide">
        {/* Centered header section like Gallery */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {def.breadcrumb && (
            <div className="flex justify-center mb-2">
              <Breadcrumb items={def.breadcrumb} lang={i18n.language} />
            </div>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">{def.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {def.description}
            </p>
          </div>
        </div>

        {/* Horizontal ad below header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <AdUnit slot={`${page}-top`} width={728} height={90} format="horizontal" />
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-6 py-4 text-justify">
          <div className="space-y-10">
            {def.sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>

                {section.paragraphs?.map((p) => (
                  <p
                    key={p.slice(0, 50)}
                    className="text-base text-muted-foreground leading-relaxed"
                  >
                    {renderTextWithLinks(p, i18n.language)}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
                    {section.bullets.map((b) => (
                      <li key={b}>{renderTextWithLinks(b, i18n.language)}</li>
                    ))}
                  </ul>
                )}

                {/* Images */}
                {section.images && section.images.length > 0 && (
                  <div className="space-y-4 my-4">
                    {section.images.map((image) => (
                      <figure key={image.src} className="w-full">
                        <img
                          src={getImageUrl(image.src)}
                          alt={image.alt}
                          className="w-full rounded-lg shadow-md border"
                          loading="lazy"
                        />
                        {image.caption && (
                          <figcaption className="text-sm sm:text-base text-muted-foreground mt-2 text-justify italic">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {page === 'contact' && (
              <div className="grid gap-6 md:grid-cols-2">
                <ContactEmailLink />
                <ContactRedditLink />
              </div>
            )}
          </div>

          {def.relatedLinks && <RelatedLinks links={def.relatedLinks} lang={i18n.language} t={t} />}

          {/* Bottom horizontal ad */}
          <div className="mt-8 flex justify-center">
            <AdUnit slot={`${page}-bottom`} width={728} height={90} format="horizontal" />
          </div>

          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {t('accessibility.lastUpdated')}: {LAST_UPDATED}
            </p>
          </div>
        </article>
      </div>

      {/* Right ad column */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-2 pr-3">
        <AdUnit slot="static-right" width={160} height={600} format="vertical" />
      </div>
    </main>
  );
}

export default StaticPage;
