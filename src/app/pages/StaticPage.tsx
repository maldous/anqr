/**
 * StaticPage
 * About, Privacy, Terms, Contact, and Guide pages.
 */

import { Loader2, Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PageDefinition } from "@/i18n/static";
import { getStaticContentAsync } from "@/i18n/static";
import { StaticPageAdRail } from "./static-page-ad-rail";
import { StaticPageArticle } from "./static-page-article";
import { StaticPageContentHeader } from "./static-page-content-header";
import { TableOfContents } from "./static-page-shell-parts";
import { buildToc } from "./static-page-toc";
export type { StaticPageType } from "./StaticPage.types";
import type { StaticPageProps } from "./static-page-types";

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
  const hasToc = page === "guide" || page === "learn" || page === "examples";
  const tocGroups = useMemo(
    () => (hasToc && def ? buildToc(page, def.sections, t) : []),
    [hasToc, page, def, t],
  );
  const [activeSlug, setActiveSlug] = useState("");
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
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      },
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
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSlug(slug);
      // Update URL hash without triggering scroll
      globalThis.history.replaceState(null, "", `#${slug}`);
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
          <span className="text-sm">{t("loading")}</span>
        </div>
      </main>
    );
  }

  // For pages with TOC (guide, learn, examples), use layout with sidebar
  if (hasToc) {
    return (
      <main className="min-h-[200px] flex-1 flex bg-background overflow-hidden transition-all duration-300">
        <StaticPageAdRail
          slot="static-left"
          hiddenClassName="hidden xl:flex"
          paddingClassName="pl-3 pr-2"
        />

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
              title={t("accessibility.openGuideSidebar")}
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
          <StaticPageContentHeader
            page={page}
            breadcrumb={def.breadcrumb}
            lang={i18n.language}
            title={def.title}
            description={def.description}
          />

          <StaticPageArticle
            def={def}
            page={page}
            lang={i18n.language}
            hasToc
            tocGroups={tocGroups}
            onNavigate={navigateToSection}
            registerSectionRef={registerSectionRef}
            t={t}
          />
        </div>

        <StaticPageAdRail
          slot="static-right"
          hiddenClassName="hidden xl:flex"
          paddingClassName="pl-2 pr-3"
        />
      </main>
    );
  }

  // Standard layout for non-guide pages
  return (
    <main className="min-h-[200px] flex-1 flex bg-background overflow-hidden transition-all duration-300">
      <StaticPageAdRail
        slot="static-left"
        hiddenClassName="hidden lg:flex"
        paddingClassName="pl-3 pr-2"
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-background scrollbar-hide">
        <StaticPageContentHeader
          page={page}
          breadcrumb={def.breadcrumb}
          lang={i18n.language}
          title={def.title}
          description={def.description}
        />

        <StaticPageArticle
          def={def}
          page={page}
          lang={i18n.language}
          hasToc={false}
          tocGroups={[]}
          onNavigate={navigateToSection}
          registerSectionRef={registerSectionRef}
          t={t}
        />
      </div>

      <StaticPageAdRail
        slot="static-right"
        hiddenClassName="hidden lg:flex"
        paddingClassName="pl-2 pr-3"
      />
    </main>
  );
}
