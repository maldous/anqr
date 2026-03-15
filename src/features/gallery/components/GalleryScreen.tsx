/**
 * Gallery Component
 * Hero-style gallery showcasing ANQR features organized by category
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/platform/ads/components/AdUnit';
import { type GalleryCategory, gallerySections } from '@/content/gallery/gallery-items';
import { trackEvent } from '@/infra/telemetry/zaraz';
import { prepareInterstitial, showInterstitial } from '@/modules/platform';
import {
  GuideLinks,
  HorizontalAd,
  GallerySectionComponent,
  MobileAllButton,
  MobileJumpButton,
} from './gallery-layout-parts';
import { galleryInterstitialGuard } from './gallery-interstitial-guard';
import type { GalleryProps } from './gallery.props';
import { initGalleryInterstitialGuard } from './init-gallery-interstitial-guard';
import { markGalleryInterstitialShown } from './mark-gallery-interstitial-shown';

galleryInterstitialGuard.value = initGalleryInterstitialGuard();

export function Gallery({ filter }: GalleryProps) {
  const { t, i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Set<GalleryCategory>>(
    new Set(gallerySections.map((s) => s.id))
  );
  const [mobileFilter, setMobileFilter] = useState<GalleryCategory | 'all'>('all');

  // Track gallery page view
  useEffect(() => {
    trackEvent('gallery_view');
  }, []);

  // Show interstitial ad once per session when Gallery opens (on native apps)
  useEffect(() => {
    if (galleryInterstitialGuard.value) return;
    // Set the guard synchronously to prevent duplicate triggers on rapid remounts
    galleryInterstitialGuard.value = true;
    let cancelled = false;
    const showGalleryInterstitial = async () => {
      await prepareInterstitial('gallery');
      if (!cancelled) {
        const shown = await showInterstitial('gallery');
        if (shown) {
          markGalleryInterstitialShown();
        } else if (!cancelled) {
          // Ad failed to show — allow retry on next mount
          galleryInterstitialGuard.value = false;
        }
      }
    };
    void showGalleryInterstitial();
    return () => {
      cancelled = true;
      // If ad wasn't successfully shown, reset guard so next mount can retry
      try {
        if (sessionStorage.getItem('galleryInterstitialShown') !== 'true') {
          galleryInterstitialGuard.value = false;
        }
      } catch {
        galleryInterstitialGuard.value = false;
      }
    };
  }, []);

  // Update document title when language changes
  useEffect(() => {
    document.title = `${t('gallery.title')} | ANQR`;
  }, [t]);

  const _filteredSections = useMemo(() => {
    return filter === 'all' ? gallerySections : gallerySections.filter((s) => s.id === filter);
  }, [filter]);

  const _totalItems = useMemo(
    () => gallerySections.reduce((acc, s) => acc + s.items.length, 0),
    []
  );

  const toggleSection = (id: GalleryCategory) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Combined filter: use prop filter on desktop, mobile filter on mobile
  const effectiveFilter = mobileFilter === 'all' ? filter : mobileFilter;

  const displaySections = useMemo(() => {
    if (effectiveFilter === 'all') return gallerySections;
    return gallerySections.filter((s) => s.id === effectiveFilter);
  }, [effectiveFilter]);

  return (
    <main className="min-h-[200px] flex-1 flex bg-background overflow-hidden transition-all duration-300">
      {/* Left ad column - matches Preview exactly */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-3 pr-2">
        <AdUnit slot="gallery-left" width={160} height={600} format="vertical" />
      </div>

      {/* Main gallery content - scrollbar hidden but scrollable */}
      <div className="flex-1 overflow-y-auto bg-background scrollbar-hide">
        {/* Mobile jump buttons - horizontal scrollable row */}
        <div className="lg:hidden sticky top-0 z-40 bg-background border-b px-1 py-1.5">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide justify-between">
            <MobileAllButton
              isActive={mobileFilter === 'all'}
              onClick={() => setMobileFilter('all')}
              title={t('gallery.all')}
            />
            {gallerySections.map((section) => (
              <MobileJumpButton
                key={section.id}
                icon={section.icon}
                label={t(`gallery.sections.${section.id}.title`, { defaultValue: section.title })}
                isActive={mobileFilter === section.id}
                onClick={() => setMobileFilter(section.id)}
              />
            ))}
          </div>
        </div>

        {/* Hero section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">
              {t('gallery.title')}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>
        </div>

        {/* Top horizontal ad */}
        <HorizontalAd slot="gallery-top" />

        {/* Gallery content */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          {displaySections.map((section, index) => (
            <GallerySectionComponent
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              showAdAfter={index % 2 === 1 ? `gallery-after-${section.id}` : undefined}
            />
          ))}
        </div>

        {/* Guide links */}
        <GuideLinks language={i18n.language} />

        {/* Bottom horizontal ad */}
        <HorizontalAd slot="gallery-bottom" />
      </div>

      {/* Right ad column - matches Preview exactly */}
      <div className="hidden lg:flex flex-col items-center justify-center w-[180px] min-h-[600px] bg-background flex-shrink-0 pl-2 pr-3">
        <AdUnit slot="gallery-right" width={160} height={600} format="vertical" />
      </div>
    </main>
  );
}
