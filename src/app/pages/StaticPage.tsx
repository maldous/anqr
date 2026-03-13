/**
 * StaticPage
 * About, Privacy, Terms, Contact, and Guide pages.
 */

import { Loader2, Menu } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/platform/ads/components/AdUnit';
import { Button } from '@/ui/primitives/button';
import type { PageDefinition } from '@/i18n/static';
import { getStaticContentAsync } from '@/i18n/static';
import { getImageUrl } from './static-page-image-url';
import {
  Breadcrumb,
  ContactEmailLink,
  ContactRedditLink,
  TableOfContents,
} from './static-page-shell-parts';
import { renderTextWithLinks } from './static-page-text';
import { buildToc } from './static-page-toc';
import type { StaticPageProps } from './static-page-types';

export type { StaticPageType } from './StaticPage.types';
import type { StaticPageType } from './StaticPage.types';

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

                    {/* External links only (e.g., iubenda privacy policy) */}
                    {section.links &&
                      section.links.some((link) => link.href.startsWith('http')) && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {section.links
                            .filter((link) => link.href.startsWith('http'))
                            .map((link) => (
                              <Button key={link.href} asChild variant="outline" size="default">
                                <a href={link.href} target="_blank" rel="noopener noreferrer">
                                  {link.label}
                                </a>
                              </Button>
                            ))}
                        </div>
                      )}
                  </section>
                );
              })}
            </div>

            {/* Bottom horizontal ad */}
            <div className="mt-8 flex justify-center">
              <AdUnit slot={`${page}-bottom`} width={728} height={90} format="horizontal" />
            </div>

            <div className="mt-8 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                {t('accessibility.lastUpdated')}: {def.lastUpdated}
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

                {/* External links only (e.g., iubenda privacy policy) */}
                {section.links && section.links.some((link) => link.href.startsWith('http')) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {section.links
                      .filter((link) => link.href.startsWith('http'))
                      .map((link) => (
                        <Button key={link.href} asChild variant="outline" size="default">
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        </Button>
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

          {/* Bottom horizontal ad */}
          <div className="mt-8 flex justify-center">
            <AdUnit slot={`${page}-bottom`} width={728} height={90} format="horizontal" />
          </div>

          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {t('accessibility.lastUpdated')}: {def.lastUpdated}
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
