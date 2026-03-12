/**
 * Gallery Component
 * Hero-style gallery showcasing ANQR features organized by category
 */

import type { LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  ChevronUp,
  Contrast,
  FileText,
  Film,
  Grid3x3,
  Image,
  Layers,
  Paintbrush,
  Palette,
  QrCode,
  Settings2,
  Shapes,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdUnit } from '@/platform/ads/components/AdUnit';
import {
  buildGalleryRenderImageUrl,
  buildGalleryUrl,
  type GalleryCategory,
  type GalleryItem,
  type GallerySection,
  gallerySections,
  getGalleryImagePath,
} from '@/content/gallery/gallery-items';
import { trackEvent } from '@/infra/telemetry/zaraz';
import { prepareInterstitial, showInterstitial } from '@/modules/platform';

// Session-level flag: show gallery interstitial only once per app session.
// Module-level boolean provides a synchronous guard against race conditions
// (e.g. rapid mount/unmount before the async showInterstitial resolves).
// sessionStorage adds persistence across page navigations and hot reloads.
let galleryInterstitialGuard = false;
try {
  galleryInterstitialGuard = sessionStorage.getItem('galleryInterstitialShown') === 'true';
} catch {
  // sessionStorage unavailable (e.g. some WebView configs)
}
const markGalleryInterstitialShown = () => {
  galleryInterstitialGuard = true;
  try {
    sessionStorage.setItem('galleryInterstitialShown', 'true');
  } catch {
    // Ignore storage errors
  }
};

// Icon registry for gallery sections - only import icons actually used in gallery-items.ts
const iconRegistry: Record<string, LucideIcon> = {
  QrCode,
  FileText,
  Shapes,
  Palette,
  Image,
  Film,
  Layers,
  Contrast,
  Settings2,
  Sparkles,
  Paintbrush,
};

// Dynamic icon component using registry instead of namespace import
interface DynamicIconProps {
  readonly name: string;
  readonly className?: string;
}

function DynamicIcon({ name, className }: DynamicIconProps) {
  const Icon = iconRegistry[name];
  return Icon ? <Icon className={className} /> : null;
}

// Gallery card component with hover-to-enlarge
interface GalleryCardProps {
  readonly item: GalleryItem;
}

function GalleryCard({ item }: GalleryCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fallbackStage, setFallbackStage] = useState(0);
  const primaryImageSrc = useMemo(() => getGalleryImagePath(item), [item]);
  const [imageSrc, setImageSrc] = useState(primaryImageSrc);

  const shareUrl = buildGalleryUrl(item);
  const itemTitle = t(`gallery.items.${item.id}.title`, { defaultValue: item.title });
  const itemDescription = t(`gallery.items.${item.id}.description`, {
    defaultValue: item.description,
  });

  useEffect(() => {
    setImageError(false);
    setFallbackStage(0);
    setImageSrc(primaryImageSrc);
  }, [primaryImageSrc]);

  const handleImageError = () => {
    if (fallbackStage === 0) {
      setFallbackStage(1);
      setImageSrc(getGalleryImagePath(item, item.isAnimated ? 'png' : 'gif'));
      return;
    }
    if (fallbackStage === 1) {
      setFallbackStage(2);
      setImageSrc(buildGalleryRenderImageUrl(item));
      return;
    }
    setImageError(true);
  };

  return (
    <a
      href={shareUrl}
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${itemTitle} - ${itemDescription}. Open in generator.`}
    >
      <div
        className={`
        relative overflow-hidden rounded-lg bg-card
        border border-border shadow-md
        transition-all duration-200 ease-out origin-center
        ${isHovered ? 'scale-[1.28] z-50 shadow-2xl border-blue-500 dark:border-blue-400' : 'z-0'}
      `}
      >
        {/* Image */}
        <div className="aspect-square w-full bg-muted p-1">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-xs">{t('accessibility.imageUnavailable')}</span>
            </div>
          ) : (
            <img
              src={imageSrc}
              alt={itemTitle}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>
      </div>

      {/* Title and description below card (hidden when hovered/enlarged) */}
      <div
        className={`mt-1 px-0.5 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      >
        <h4 className="text-xs font-semibold text-foreground truncate">{itemTitle}</h4>
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
          {itemDescription}
        </p>
      </div>
    </a>
  );
}

// Horizontal ad component
interface HorizontalAdProps {
  readonly slot: string;
}

function HorizontalAd({ slot }: HorizontalAdProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex justify-center">
        <AdUnit slot={slot} width={728} height={90} format="horizontal" />
      </div>
    </div>
  );
}

// Section component
interface GallerySectionComponentProps {
  readonly section: GallerySection;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly showAdAfter?: string;
}

function GallerySectionComponent({
  section,
  isExpanded,
  onToggle,
  showAdAfter,
}: GallerySectionComponentProps) {
  const { t } = useTranslation();
  const sectionTitle = t(`gallery.sections.${section.id}.title`, { defaultValue: section.title });
  const sectionDescription = t(`gallery.sections.${section.id}.description`, {
    defaultValue: section.description,
  });

  return (
    <div className="mb-8">
      {/* Section header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 mb-4 group"
        title={isExpanded ? t('gallery.collapse') : t('gallery.expand')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <DynamicIcon
              name={section.icon}
              className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {sectionTitle}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({section.items.length})
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">{sectionDescription}</p>
          </div>
        </div>
        <div className="p-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Items grid - consistent 6 columns with hover space */}
      {isExpanded && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-4">
          {section.items.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Horizontal ad after section */}
      {showAdAfter && <HorizontalAd slot={showAdAfter} />}
    </div>
  );
}

// Props for Gallery component
interface GalleryProps {
  readonly filter: GalleryCategory | 'all';
}

// Mobile jump button component
interface MobileJumpButtonProps {
  readonly icon: string;
  readonly label: string;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

function MobileJumpButton({ icon, label, isActive, onClick }: MobileJumpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
      title={label}
    >
      <DynamicIcon name={icon} className="w-3 h-3" />
    </button>
  );
}

// Guide links component for Gallery
function GuideLinks() {
  const { t, i18n } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 border-t">
      <h3 className="text-lg font-semibold mb-4">
        {t('gallery.learnMore', 'Learn how to create these styles')}
      </h3>
      <div className="flex flex-wrap gap-3">
        <a
          href={`/guide?lang=${i18n.language}#section-8`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.guideModuleStyles', 'Module Styles Guide')}
        </a>
        <a
          href={`/guide?lang=${i18n.language}#section-11`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.guideColors', 'Colors & Gradients Guide')}
        </a>
        <a
          href={`/learn?lang=${i18n.language}`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('gallery.learnArticles', 'Browse Learn Articles')}
        </a>
      </div>
    </div>
  );
}

// Main Gallery component
export function Gallery({ filter }: GalleryProps) {
  const { t } = useTranslation();
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
    if (galleryInterstitialGuard) return;
    // Set the guard synchronously to prevent duplicate triggers on rapid remounts
    galleryInterstitialGuard = true;
    let cancelled = false;
    const showGalleryInterstitial = async () => {
      await prepareInterstitial('gallery');
      if (!cancelled) {
        const shown = await showInterstitial('gallery');
        if (shown) {
          markGalleryInterstitialShown();
        } else if (!cancelled) {
          // Ad failed to show — allow retry on next mount
          galleryInterstitialGuard = false;
        }
      }
    };
    void showGalleryInterstitial();
    return () => {
      cancelled = true;
      // If ad wasn't successfully shown, reset guard so next mount can retry
      try {
        if (sessionStorage.getItem('galleryInterstitialShown') !== 'true') {
          galleryInterstitialGuard = false;
        }
      } catch {
        galleryInterstitialGuard = false;
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
            <button
              type="button"
              onClick={() => setMobileFilter('all')}
              className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                mobileFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={t('gallery.all')}
            >
              <Grid3x3 className="w-3 h-3" />
            </button>
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
        <GuideLinks />

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
