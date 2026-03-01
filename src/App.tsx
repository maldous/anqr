import { Capacitor } from '@capacitor/core';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BusyOverlay } from '@/components/BusyOverlay';
import { Header } from '@/components/Header';
import { MobileDivider } from '@/components/MobileDivider';
import { Preview } from '@/components/Preview';
import { Sidebar } from '@/components/Sidebar';
import type { StaticPageType } from '@/components/StaticPage';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createLogger } from '@/lib/logger';

// Lazy-loaded components for bundle optimization
const Analyze = lazy(() => import('@/components/Analyze').then((m) => ({ default: m.Analyze })));
const Gallery = lazy(() => import('@/components/Gallery').then((m) => ({ default: m.Gallery })));
const StaticPage = lazy(() =>
  import('@/components/StaticPage').then((m) => ({ default: m.StaticPage }))
);
const WelcomeModal = lazy(() =>
  import('@/components/WelcomeModal').then((m) => ({ default: m.WelcomeModal }))
);

// Simple loading spinner for lazy-loaded components
function LazyLoadFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

import type { GalleryCategory } from '@/data/gallery-manifest';
import { useBannerHeight } from '@/hooks/useBannerHeight';
import { QRGeneratorProvider, useQRGeneratorContext } from '@/hooks/useQRGenerator';
import i18n, { isRtlLanguage, languages, loadLocale } from '@/i18n';
import { showNativeToast } from '@/modules/platform';
import { parseUrlParams } from '@/modules/share-links';
import {
  type AlignmentStyle,
  type FinderStyle,
  type Tier,
  type TimingStyle,
  useQRStore,
} from '@/store/qr-store';

type PageView = 'editor' | 'gallery' | 'analyze' | StaticPageType;
type ModuleStyleOption = 'square' | 'rounded' | 'dots' | 'diamond' | 'connected';
type CapacitorAppPlugin = {
  exitApp?: () => Promise<void> | void;
};

const log = createLogger('APP');

/** Type alias for gradient update configuration */
interface GradientUpdate {
  type: 'none' | 'linear' | 'radial' | 'conic';
  stops?: Array<{ pos: number; color: string }>;
  angle?: number;
}

function getPageFromLocation(): PageView {
  // NOSONAR - This regex is safe: /\/+$/ has no backtracking risk (simple trailing slash removal)
  const path = globalThis.location.pathname.replace(/\/+$/, '') || '/';
  const hash = globalThis.location.hash.replace(/^#/, '');

  // Prefer clean paths when present.
  if (path === '/analyze') return 'analyze';
  if (path === '/gallery') return 'gallery';
  if (path === '/guide') return 'guide';
  if (path === '/learn') return 'learn';
  if (path === '/examples') return 'examples';
  if (path === '/translate') return 'translate';
  if (path === '/about') return 'about';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/contact') return 'contact';

  // Backward-compatible hash routes.
  if (hash === 'gallery') return 'gallery';
  if (
    hash === 'about' ||
    hash === 'privacy' ||
    hash === 'terms' ||
    hash === 'contact' ||
    hash === 'guide'
  )
    return hash as StaticPageType;

  return 'editor';
}

// Mobile split configuration
// localStorage key for persisting user's preferred split position
const MOBILE_SPLIT_STORAGE_KEY = 'anqr:ui:mobile-split-percent';
const DEFAULT_MOBILE_SPLIT = 50; // Start with 50/50 split
const MIN_MOBILE_SPLIT = 20; // Minimum sidebar height %
const MAX_MOBILE_SPLIT = 70; // Maximum sidebar height %

function AppContent() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>('editor');
  const [galleryFilter, setGalleryFilter] = useState<GalleryCategory | 'all'>('all');
  const [mobileSplitPercent, setMobileSplitPercent] = useState(DEFAULT_MOBILE_SPLIT);
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerHeight = useBannerHeight();
  const { download, isExporting, canvas: generatedCanvas } = useQRGeneratorContext();

  // Handle mobile divider drag
  const handleMobileDividerDrag = useCallback((deltaY: number) => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight;
    if (containerHeight <= 0) return;

    // Convert pixel delta to percentage
    const deltaPercent = (deltaY / containerHeight) * 100;

    setMobileSplitPercent((prev) => {
      const newValue = prev + deltaPercent;
      return Math.max(MIN_MOBILE_SPLIT, Math.min(MAX_MOBILE_SPLIT, newValue));
    });
  }, []);

  // Save split position to localStorage on drag end
  // Use a ref to get the current value to avoid recreating the callback
  const mobileSplitPercentRef = useRef(mobileSplitPercent);
  mobileSplitPercentRef.current = mobileSplitPercent;
  const lastBackPressAtRef = useRef(0);

  const handleMobileDividerDragEnd = useCallback(() => {
    localStorage.setItem(MOBILE_SPLIT_STORAGE_KEY, String(mobileSplitPercentRef.current));
  }, []);

  // Load saved split position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(MOBILE_SPLIT_STORAGE_KEY);
    if (saved) {
      const parsed = Number.parseFloat(saved);
      if (!Number.isNaN(parsed) && parsed >= MIN_MOBILE_SPLIT && parsed <= MAX_MOBILE_SPLIT) {
        setMobileSplitPercent(parsed);
      }
    }
  }, []);

  // NOTE: We use useQRStore.getState() for setters in the URL params effect below
  // instead of subscribing to the store here. This prevents App from re-rendering
  // on every store change. Setters are stable references so getState() is safe.
  // See issue #15 in tbd.txt for details on this optimization.

  const navigateTo = useCallback((page: PageView) => {
    const nextPath = page === 'editor' ? '/' : `/${page}`;
    const nextSearch = page === 'editor' ? globalThis.location.search : '';

    // Avoid unnecessary history entries.
    // NOSONAR - This regex is safe: /\/+$/ has no backtracking risk (simple trailing slash removal)
    const current = globalThis.location.pathname.replace(/\/+$/, '') || '/';
    if (current === nextPath && globalThis.location.search === nextSearch) {
      setCurrentPage(page);
      return;
    }

    globalThis.history.pushState({}, '', `${nextPath}${nextSearch}`);
    setCurrentPage(page);
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle location changes for routing (paths + legacy hash)
  useEffect(() => {
    const handleLocationChange = async () => {
      setCurrentPage(getPageFromLocation());

      // Process lang parameter on every navigation (works on all pages)
      const params = new URLSearchParams(globalThis.location.search);
      const lang = params.get('lang');
      if (lang && lang !== i18n.language) {
        await loadLocale(lang);
        i18n.changeLanguage(lang);
      }
    };

    handleLocationChange();

    globalThis.addEventListener('popstate', handleLocationChange);
    globalThis.addEventListener('hashchange', handleLocationChange);
    return () => {
      globalThis.removeEventListener('popstate', handleLocationChange);
      globalThis.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Handle Android back press (hardware button + swipe-back gesture)
  // OnBackPressedDispatcher in MainActivity.java intercepts all back presses
  // and dispatches a custom 'androidBackPress' event to the web view.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleAndroidBackPress = async () => {
      // Navigate internally: gallery/analyze/static -> editor
      if (currentPage !== 'editor') {
        navigateTo('editor');
        return;
      }

      // In editor, try to go back in browser history
      if (globalThis.history.length > 1) {
        globalThis.history.back();
        return;
      }

      // On editor with no history: double-back-to-exit (reuse same ref as hardware back handler)
      const now = Date.now();
      if (now - lastBackPressAtRef.current < 1500) {
        const appPlugin = (
          globalThis as typeof globalThis & {
            Capacitor?: { Plugins?: { App?: CapacitorAppPlugin } };
          }
        ).Capacitor?.Plugins?.App;
        await appPlugin?.exitApp?.();
        return;
      }
      lastBackPressAtRef.current = now;
      await showNativeToast('Press back again to exit', 'short');
    };

    // Listen for the custom event dispatched from native Android
    document.addEventListener('androidBackPress', handleAndroidBackPress);

    return () => {
      document.removeEventListener('androidBackPress', handleAndroidBackPress);
    };
  }, [currentPage, navigateTo]);

  // Convenience booleans for view states
  const showGallery = currentPage === 'gallery';
  const showAnalyze = currentPage === 'analyze';
  const showStaticPage = [
    'about',
    'privacy',
    'terms',
    'contact',
    'guide',
    'learn',
    'examples',
    'translate',
  ].includes(currentPage);
  const showEditor = currentPage === 'editor';

  // Update document title, RTL direction, and hreflang links when language/page changes
  useEffect(() => {
    if (showEditor) {
      document.title = `${t('app.name')} - ${t('app.tagline')}`;
    }

    // Apply RTL direction based on current language
    const isRtl = isRtlLanguage(i18n.language);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language.split('-')[0];

    // Update hreflang links for SEO
    // Add hreflang for all translatable pages (static pages and editor)
    const staticPageTypes = ['learn', 'examples', 'guide', 'about', 'privacy', 'terms', 'contact'];
    const isStaticPage = staticPageTypes.includes(currentPage);
    const shouldAddHreflang = isStaticPage || showEditor;

    // Remove existing hreflang links (including static ones from index.html)
    for (const el of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
      el.remove();
    }

    // Add hreflang links for translatable pages
    if (shouldAddHreflang) {
      const baseUrl = 'https://anqr.link';
      // For editor (root), use '/' as path; for other pages, use '/page'
      const pagePath = showEditor ? '/' : `/${currentPage}`;

      // Add x-default pointing to English version first
      const xDefaultLink = document.createElement('link');
      xDefaultLink.rel = 'alternate';
      xDefaultLink.hreflang = 'x-default';
      xDefaultLink.href = `${baseUrl}${pagePath}`;
      document.head.appendChild(xDefaultLink);

      // Add hreflang for each supported language
      for (const lang of languages) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        // Use 'en' for en-GB (broader match), lowercase for others
        link.hreflang = lang.code === 'en-GB' ? 'en' : lang.code.toLowerCase();
        // en-GB is the default, so no lang parameter; others get ?lang=code
        link.href =
          lang.code === 'en-GB'
            ? `${baseUrl}${pagePath}`
            : `${baseUrl}${pagePath}?lang=${lang.code}`;
        document.head.appendChild(link);
      }
    }

    // Update canonical URL based on current page and language
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    const currentLang = i18n.language;
    const basePath = showEditor ? '/' : `/${currentPage}`;
    canonicalLink.href =
      currentLang === 'en-GB'
        ? `https://anqr.link${basePath}`
        : `https://anqr.link${basePath}?lang=${currentLang}`;

    // Cleanup: remove hreflang links when component unmounts or dependencies change
    return () => {
      for (const el of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
        el.remove();
      }
    };
  }, [showEditor, currentPage, t]);

  // Load overlay image from URL
  // Takes store reference to avoid subscribing component to store changes
  const loadOverlayFromUrl = useCallback(
    async (url: string, store: ReturnType<typeof useQRStore.getState>) => {
      // On native platforms, bundled assets (public/) are available locally.
      // Convert remote anqr.link URLs to local paths to avoid cross-origin issues.
      let fetchUrl = url;
      if (Capacitor.isNativePlatform() && url.startsWith('https://anqr.link/')) {
        const localPath = url.replace('https://anqr.link', '');
        fetchUrl = `${globalThis.location.origin}${localPath}`;
        log.debug('Resolved overlay to local path', { original: url, local: fetchUrl });
      }

      // Validate that it's a proper URL
      try {
        const parsed = new URL(fetchUrl);
        if (!parsed.protocol.startsWith('http')) {
          log.warn('Invalid overlay URL', { url, reason: 'must be http/https' });
          return;
        }
      } catch {
        log.warn('Invalid overlay URL format', { url });
        return;
      }

      try {
        log.debug('Loading overlay from URL', { url: fetchUrl });
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

        const blob = await response.blob();
        const filename = url.split('/').pop()?.split('?')[0] || 'image';
        const file = new File([blob], filename, { type: blob.type });

        store.setOverlayUrl(url);
        store.setOverlayFile(file);
        store.setOverlayEnabled(true);
        log.debug('Overlay loaded successfully');
      } catch (err) {
        log.error('Failed to load overlay from URL', { error: err, url });
      }
    },
    []
  );

  // Load settings from URL parameters on mount (editor share links)
  useEffect(() => {
    if (getPageFromLocation() !== 'editor') return;
    const params = parseUrlParams();

    // Get store setters via getState() to avoid subscribing App to the entire store
    // This is safe because setters are stable references that don't change
    const store = useQRStore.getState();

    // Apply language from URL params if present
    if (params.lang) {
      i18n.changeLanguage(params.lang);
    }

    // Determine required tier based on params used
    let requiredTier: Tier = 'basic';

    // Check for advanced features
    if (params.mode || params.overlayUrl || params.intensity !== undefined) {
      requiredTier = 'advanced';
    }
    if (params.style && params.style !== 'square') {
      requiredTier = 'advanced';
    }
    if (params.finder && params.finder !== 'square') {
      requiredTier = 'advanced';
    }
    if (params.fg && params.fg !== '#000000') {
      requiredTier = 'advanced';
    }
    if (params.bg && params.bg !== '#ffffff') {
      requiredTier = 'advanced';
    }

    // Set the tier first so UI shows correct options
    if (requiredTier !== 'basic') {
      store.setTier(requiredTier);
    }

    // Apply URL parameters to store
    // IMPORTANT: When loading from shared URLs, treat data as authoritative.
    // Set kind to 'plain_text' so getPayloadText() returns the exact data,
    // rather than trying to rebuild from structured fields which would be empty.
    // This ensures shared WiFi/vCard/etc URLs produce the correct QR code.
    if (params.data) {
      const data = params.data;

      // For URL payloads, also populate the url helper for UI convenience
      if (data.startsWith('http://') || data.startsWith('https://')) {
        store.setPayloadKind('url');
        store.setPayloadUrl({ href: data });
        store.setPayloadText(data);
      } else {
        // For all other payload types (WiFi, vCard, etc.), use plain_text kind
        // This ensures the raw data is used directly without trying to rebuild
        // from structured fields which aren't populated from the URL
        store.setPayloadKind('plain_text');
        store.setPayloadText(data);
      }
    }

    if (params.ec) store.setQrEcc(params.ec as 'L' | 'M' | 'Q' | 'H');
    if (params.version) store.setQrVersion(params.version);
    if (params.size) store.setRenderModulePx(params.size);
    if (params.margin !== undefined) store.setQrQuietZone(params.margin);
    if (params.fg) store.setRenderFgColor(params.fg);
    if (params.bg) store.setRenderBgColor(params.bg);
    if (params.transparent) store.setRenderBgTransparent(true);
    if (params.style) store.setRenderModuleStyle(params.style as ModuleStyleOption);
    if (params.finder) store.setRenderFinderStyle(params.finder as FinderStyle);
    if (params.alignmentStyle)
      store.setRenderAlignmentStyle(params.alignmentStyle as AlignmentStyle);
    if (params.timingStyle) store.setRenderTimingStyle(params.timingStyle as TimingStyle);
    // Render settings
    if (params.moduleGap !== undefined) store.setRenderModuleGap(params.moduleGap);
    if (params.gapMode)
      store.setRenderGapMode(params.gapMode as 'none' | 'inset' | 'stroke' | 'negative_space');
    if (params.cornerRadius !== undefined) store.setRenderCornerRadius(params.cornerRadius);
    if (params.gradientType) {
      const gradientUpdate: GradientUpdate = {
        type: params.gradientType as 'none' | 'linear' | 'radial' | 'conic',
      };
      if (params.gradientStops && params.gradientStops.length > 0) {
        gradientUpdate.stops = params.gradientStops;
      }
      if (params.gradientAngle !== undefined) {
        // Store gradient angle in stops format or separate field - use stops[0].pos as angle workaround
        // Actually, the gradient object doesn't have an angle field in the store type, so we need to handle this
        // Looking at the store, gradient has: type and stops. Angle is typically encoded in the gradient creation
      }
      store.setRenderGradient(gradientUpdate);
    }
    if (params.eyeOuterStyle)
      useQRStore.setState((s) => ({
        render: {
          ...s.render,
          eyeOuterStyle: params.eyeOuterStyle as 'square' | 'rounded' | 'circle',
        },
      }));
    if (params.eyeInnerStyle)
      useQRStore.setState((s) => ({
        render: {
          ...s.render,
          eyeInnerStyle: params.eyeInnerStyle as 'square' | 'rounded' | 'circle',
        },
      }));
    if (params.eyeScale !== undefined)
      useQRStore.setState((s) => ({ render: { ...s.render, eyeScale: params.eyeScale! } }));
    if (params.frameStyle)
      store.setRenderFrameStyle(params.frameStyle as 'none' | 'rounded_frame' | 'sticker' | 'tag');
    if (params.frameText) store.setRenderFrameText(params.frameText);
    if (params.dotRotation !== undefined)
      useQRStore.setState((s) => ({
        render: { ...s.render, dotRotationDeg: params.dotRotation! },
      }));
    if (params.crispEdges === false)
      useQRStore.setState((s) => ({ render: { ...s.render, crispEdges: false } }));
    if (params.pixelSnap)
      useQRStore.setState((s) => ({
        render: { ...s.render, pixelSnap: params.pixelSnap as 'floor' | 'round' | 'ceil' },
      }));
    if (params.perModuleColorMode)
      useQRStore.setState((s) => ({
        render: {
          ...s.render,
          perModuleColorMode: params.perModuleColorMode as
            | 'solid'
            | 'by_brightness'
            | 'by_position'
            | 'by_overlay'
            | 'by_cluster',
        },
      }));
    if (params.contrastGuard)
      useQRStore.setState((s) => ({ render: { ...s.render, contrastGuard: true } }));
    if (params.minContrastRatio !== undefined)
      useQRStore.setState((s) => ({
        render: { ...s.render, minContrastRatio: params.minContrastRatio! },
      }));
    // Overlay
    if (params.mode) store.setOverlayMode(params.mode as any);
    if (params.intensity !== undefined) store.setOverlayIntensity(params.intensity);
    if (params.fit) store.setOverlayFit(params.fit as 'cover' | 'contain' | 'stretch');
    if (params.rotate !== undefined) store.setOverlayRotate(params.rotate);
    if (params.flipX) store.setOverlayFlip({ x: true });
    if (params.flipY) store.setOverlayFlip({ y: true });
    if (params.preserveFinders === false) store.setOverlayPreserveFinders(false);
    if (params.preserveTiming) store.setOverlayPreserveTiming(true);
    if (params.preserveAlignment) store.setOverlayPreserveAlignment(true);
    if (params.protectFormatInfo)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, protectFormatInfo: true } }));
    if (params.protectVersionInfo)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, protectVersionInfo: true } }));
    if (params.eccAwareEnabled)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, eccAwareEnabled: true } }));
    if (params.eccAwareRiskBudget !== undefined)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, eccAwareRiskBudget: params.eccAwareRiskBudget! },
      }));
    if (params.eccAwareWeightMap)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, eccAwareWeightMap: params.eccAwareWeightMap as any },
      }));

    // Overlay type and frame picking
    if (params.overlayType)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, type: params.overlayType as any } }));
    if (params.overlayFramePick)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, framePick: params.overlayFramePick as any },
      }));
    // Crop settings
    if (params.cropEnabled)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, cropEnabled: true } }));
    if (params.cropX !== undefined || params.cropY !== undefined || params.cropSize !== undefined) {
      useQRStore.setState((s) => ({
        overlay: {
          ...s.overlay,
          cropRegion: {
            x: params.cropX ?? s.overlay.cropRegion.x,
            y: params.cropY ?? s.overlay.cropRegion.y,
            size: params.cropSize ?? s.overlay.cropRegion.size,
          },
        },
      }));
    }
    // GIF processing settings
    if (params.gifUseFrameDelays === false)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, gifUseFrameDelays: false } }));
    if (params.gifMaxFps !== undefined)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, gifMaxFps: params.gifMaxFps! } }));
    if (params.gifDisposalHandling)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, gifDisposalHandling: params.gifDisposalHandling as any },
      }));

    // Apply preprocessing params
    if (params.colorMode)
      store.setOverlayColorMode(params.colorMode as 'color' | 'grayscale' | 'bw');
    if (params.brightness !== undefined) store.setOverlayBrightness(params.brightness);
    if (params.contrast !== undefined) store.setOverlayContrast(params.contrast);
    if (params.gamma !== undefined) store.setOverlayGamma(params.gamma);
    if (params.saturation !== undefined) store.setOverlaySaturation(params.saturation);
    if (params.hue !== undefined) store.setOverlayHueRotate(params.hue);
    if (params.blur !== undefined) store.setOverlayBlur(params.blur);
    if (params.sharpen !== undefined) store.setOverlaySharpen(params.sharpen);
    if (params.posterize !== undefined) store.setOverlayPosterize(params.posterize);
    if (params.threshold !== undefined) store.setOverlayThreshold(params.threshold);
    if (params.edge) store.setOverlayEdgeDetect(params.edge as 'off' | 'sobel' | 'canny');
    if (params.invert) store.setOverlayInvert(params.invert);

    // Apply dithering params
    if (params.ditherKind) store.setOverlayDitherKind(params.ditherKind as any);
    if (params.diffusionKernel) store.setOverlayDiffusionKernel(params.diffusionKernel as any);
    if (params.ditherStrength !== undefined) store.setOverlayDitherStrength(params.ditherStrength);
    if (params.finderDitherStrength !== undefined)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, finderDitherStrength: params.finderDitherStrength! },
      }));
    if (params.blendPreservations)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, blendPreservations: true },
      }));
    if (params.blendPreservationMode)
      useQRStore.setState((s) => ({
        overlay: {
          ...s.overlay,
          blendPreservationMode: params.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
        },
      }));
    if (params.ditherSerpentine)
      useQRStore.setState((s) => ({ overlay: { ...s.overlay, ditherSerpentine: true } }));
    if (params.orderedMatrix)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, orderedMatrix: params.orderedMatrix as any },
      }));
    if (params.blueNoiseTileSize !== undefined)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, blueNoiseTileSize: params.blueNoiseTileSize! },
      }));
    if (params.blueNoiseSeed !== undefined)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, blueNoiseSeed: params.blueNoiseSeed! },
      }));
    if (params.colorDither)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, colorDither: params.colorDither as any },
      }));

    // Subpixel params
    if (params.subpixelGridSize)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, subpixelGridSize: params.subpixelGridSize as any },
      }));
    if (params.subpixelCenterRule)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, subpixelCenterRule: params.subpixelCenterRule as any },
      }));
    if (params.subpixelNeutralColor)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, subpixelNeutralColor: params.subpixelNeutralColor! },
      }));
    if (params.subpixelFinderOverride)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, subpixelFinderOverride: params.subpixelFinderOverride as any },
      }));

    // Halftone params
    if (params.halftoneCell)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, halftoneCell: params.halftoneCell as any },
      }));
    if (params.halftoneDotShape)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, halftoneDotShape: params.halftoneDotShape as any },
      }));
    if (params.brightnessCurve)
      useQRStore.setState((s) => ({
        overlay: { ...s.overlay, brightnessCurve: params.brightnessCurve as any },
      }));
    if (params.duotoneColor1) {
      const color1 = params.duotoneColor1;
      useQRStore.setState((s) => ({
        overlay: {
          ...s.overlay,
          duotoneColors: [color1, s.overlay.duotoneColors[1]],
        },
      }));
    }
    if (params.duotoneColor2) {
      const color2 = params.duotoneColor2;
      useQRStore.setState((s) => ({
        overlay: {
          ...s.overlay,
          duotoneColors: [s.overlay.duotoneColors[0], color2],
        },
      }));
    }

    // Animation params
    if (params.speed !== undefined) store.setAnimationSpeedMs(params.speed);
    if (params.loop === false) store.setAnimationLoop(false);
    if (params.reverse) store.setAnimationBounce(true);
    if (params.startFrame !== undefined) store.setAnimationStartFrame(params.startFrame);
    if (params.maxFrames !== undefined) store.setAnimationMaxFrames(params.maxFrames);
    if (params.frameStep !== undefined) store.setAnimationFrameStep(params.frameStep);
    if (params.interpolate)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, interpolate: params.interpolate as any },
      }));
    if (params.temporalDither)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, temporalDither: params.temporalDither as any },
      }));
    if (params.pattern)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, pattern: params.pattern as any },
      }));
    if (params.target)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, target: params.target as any },
      }));
    if (params.waveAxis)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, waveAxis: params.waveAxis as any },
      }));
    if (params.pattern2)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, pattern2: params.pattern2 as any },
      }));
    if (params.target2)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, target2: params.target2 as any },
      }));
    if (params.waveAxis2)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, waveAxis2: params.waveAxis2 as any },
      }));
    if (params.moduleJitter !== undefined)
      useQRStore.setState((s) => ({
        animation: { ...s.animation, moduleJitterPx: params.moduleJitter! },
      }));
    if (params.colorCycle)
      useQRStore.setState((s) => ({ animation: { ...s.animation, colorCycle: true } }));
    if (params.seed !== undefined)
      useQRStore.setState((s) => ({ animation: { ...s.animation, seed: params.seed! } }));
    if (params.animationSeed !== undefined)
      useQRStore.setState((s) => ({ animation: { ...s.animation, seed: params.animationSeed! } }));

    // Output params
    if (params.format) store.setOutputFormat(params.format as 'png' | 'webp' | 'gif' | 'svg');
    if (params.width !== undefined) store.setOutputWidth(params.width);
    if (params.height !== undefined) store.setOutputHeight(params.height);
    if (params.quality !== undefined) store.setOutputQuality(params.quality);
    if (params.filename) store.setOutputFilename(params.filename);
    if (params.gifPaletteSize !== undefined) store.setOutputGifPaletteSize(params.gifPaletteSize);
    if (params.gifQuantizer)
      store.setOutputGifQuantizer(params.gifQuantizer as 'median_cut' | 'neuquant' | 'octree');
    if (params.gifDither)
      useQRStore.setState((s) => ({ output: { ...s.output, gifDither: params.gifDither as any } }));
    if (params.svgTrueVector) store.setOutputSvgTrueVector(true);
    if (params.dpi !== undefined)
      useQRStore.setState((s) => ({ output: { ...s.output, dpi: params.dpi! } }));
    if (params.includeQuietZone === false)
      useQRStore.setState((s) => ({ output: { ...s.output, includeQuietZone: false } }));
    if (params.bgOverride)
      useQRStore.setState((s) => ({ output: { ...s.output, bgOverride: params.bgOverride! } }));
    if (params.gifTransparentColor)
      useQRStore.setState((s) => ({
        output: { ...s.output, gifTransparentColor: params.gifTransparentColor! },
      }));
    if (params.svgShapePrecision)
      useQRStore.setState((s) => ({
        output: { ...s.output, svgShapePrecision: params.svgShapePrecision as any },
      }));
    if (params.svgEmbedRasterOverlay === false)
      useQRStore.setState((s) => ({ output: { ...s.output, svgEmbedRasterOverlay: false } }));
    if (params.formatExtra)
      useQRStore.setState((s) => ({
        output: { ...s.output, formatExtra: params.formatExtra as any },
      }));

    // QR encoding params
    if (params.encodingMode)
      store.setQrEncodingMode(
        params.encodingMode as 'auto' | 'numeric' | 'alphanumeric' | 'byte' | 'kanji'
      );
    if (params.borderModulesExtra !== undefined)
      useQRStore.setState((s) => ({
        qr: { ...s.qr, borderModulesExtra: params.borderModulesExtra! },
      }));
    if (params.quietZoneMinEnforce === false)
      useQRStore.setState((s) => ({ qr: { ...s.qr, quietZoneMinEnforce: false } }));

    // Load overlay from URL if provided
    if (params.overlayUrl) {
      loadOverlayFromUrl(params.overlayUrl, store);
    }

    // Safety params
    if (params.safetyMode)
      useQRStore.setState((s) => ({ safety: { ...s.safety, mode: params.safetyMode as any } }));
    if (params.safetyMinModulePx !== undefined)
      useQRStore.setState((s) => ({
        safety: { ...s.safety, minModulePx: params.safetyMinModulePx! },
      }));
    if (params.safetyMinQuietZone !== undefined)
      useQRStore.setState((s) => ({
        safety: { ...s.safety, minQuietZoneModules: params.safetyMinQuietZone! },
      }));
    if (params.lockFinders === false)
      useQRStore.setState((s) => ({ safety: { ...s.safety, lockFinders: false } }));
    if (params.lockTiming === false)
      useQRStore.setState((s) => ({ safety: { ...s.safety, lockTiming: false } }));
    if (params.lockAlign === false)
      useQRStore.setState((s) => ({ safety: { ...s.safety, lockAlign: false } }));
    if (params.lockFormat === false)
      useQRStore.setState((s) => ({ safety: { ...s.safety, lockFormat: false } }));
    if (params.lockVersion === false)
      useQRStore.setState((s) => ({ safety: { ...s.safety, lockVersion: false } }));

    // QA params
    if (params.qaContrastCheck)
      useQRStore.setState((s) => ({ qa: { ...s.qa, contrastCheck: true } }));
    if (params.qaSimulateBlur !== undefined)
      useQRStore.setState((s) => ({ qa: { ...s.qa, simulateBlurPx: params.qaSimulateBlur! } }));
    if (params.qaSimulateNoise !== undefined)
      useQRStore.setState((s) => ({ qa: { ...s.qa, simulateNoise: params.qaSimulateNoise! } }));
    if (params.qaSimulateRotation !== undefined)
      useQRStore.setState((s) => ({
        qa: { ...s.qa, simulateRotationDeg: params.qaSimulateRotation! },
      }));
    if (params.qaShowHeatmap) useQRStore.setState((s) => ({ qa: { ...s.qa, showHeatmap: true } }));

    // Auto-tuning params
    if (params.autoPickVersion === false)
      useQRStore.setState((s) => ({ auto: { ...s.auto, pickVersion: false } }));
    if (params.autoPickEcc) useQRStore.setState((s) => ({ auto: { ...s.auto, pickEcc: true } }));
    if (params.autoReduceIntensity)
      useQRStore.setState((s) => ({ auto: { ...s.auto, reduceIntensityUntilSafe: true } }));

    // Watermark params
    if (params.watermarkEnabled)
      useQRStore.setState((s) => ({ watermark: { ...s.watermark, enabled: true } }));
    if (params.watermarkKind)
      useQRStore.setState((s) => ({
        watermark: { ...s.watermark, kind: params.watermarkKind as any },
      }));
    if (params.watermarkText)
      useQRStore.setState((s) => ({ watermark: { ...s.watermark, text: params.watermarkText! } }));
    if (params.watermarkPosition)
      useQRStore.setState((s) => ({
        watermark: { ...s.watermark, position: params.watermarkPosition as any },
      }));
    if (params.watermarkOpacity !== undefined)
      useQRStore.setState((s) => ({
        watermark: { ...s.watermark, opacity: params.watermarkOpacity! },
      }));
    if (params.watermarkBlend)
      useQRStore.setState((s) => ({
        watermark: { ...s.watermark, blend: params.watermarkBlend as any },
      }));

    // Metadata params
    if (params.metaTitle)
      useQRStore.setState((s) => ({ metadata: { ...s.metadata, title: params.metaTitle! } }));
    if (params.metaAuthor)
      useQRStore.setState((s) => ({ metadata: { ...s.metadata, author: params.metaAuthor! } }));
    if (params.metaCopyright)
      useQRStore.setState((s) => ({
        metadata: { ...s.metadata, copyright: params.metaCopyright! },
      }));
    if (params.metaLicense)
      useQRStore.setState((s) => ({ metadata: { ...s.metadata, license: params.metaLicense! } }));
    if (params.metaDescription)
      useQRStore.setState((s) => ({
        metadata: { ...s.metadata, description: params.metaDescription! },
      }));
    if (params.metaCreationTime)
      useQRStore.setState((s) => ({ metadata: { ...s.metadata, creationTime: true } }));
    if (params.metaCustomKv) {
      try {
        const customKv = JSON.parse(params.metaCustomKv);
        if (Array.isArray(customKv)) {
          useQRStore.setState((s) => ({ metadata: { ...s.metadata, customKv } }));
        }
      } catch (e) {
        log.warn('Failed to parse custom metadata', { error: e });
      }
    }

    // Palette params
    if (params.palette) {
      try {
        // Palette can be JSON array or comma-separated hex colors
        let paletteArray: string[];
        if (params.palette.startsWith('[')) {
          paletteArray = JSON.parse(params.palette);
        } else {
          paletteArray = params.palette.split(',').map((c) => (c.startsWith('#') ? c : `#${c}`));
        }
        if (Array.isArray(paletteArray) && paletteArray.length > 0) {
          useQRStore.setState((s) => ({ render: { ...s.render, palette: paletteArray } }));
        }
      } catch (e) {
        log.warn('Failed to parse palette', { error: e });
      }
    }
    if (params.paletteMode)
      useQRStore.setState((s) => ({
        render: { ...s.render, paletteMode: params.paletteMode as any },
      }));

    // Per-ECC intensity limits
    if (params.maxOverlayIntensityL !== undefined) {
      const intensityL = params.maxOverlayIntensityL;
      useQRStore.setState((s) => ({
        safety: {
          ...s.safety,
          maxOverlayIntensityByEcc: {
            ...s.safety.maxOverlayIntensityByEcc,
            L: intensityL,
          },
        },
      }));
    }
    if (params.maxOverlayIntensityM !== undefined) {
      const intensityM = params.maxOverlayIntensityM;
      useQRStore.setState((s) => ({
        safety: {
          ...s.safety,
          maxOverlayIntensityByEcc: {
            ...s.safety.maxOverlayIntensityByEcc,
            M: intensityM,
          },
        },
      }));
    }
    if (params.maxOverlayIntensityQ !== undefined) {
      const intensityQ = params.maxOverlayIntensityQ;
      useQRStore.setState((s) => ({
        safety: {
          ...s.safety,
          maxOverlayIntensityByEcc: {
            ...s.safety.maxOverlayIntensityByEcc,
            Q: intensityQ,
          },
        },
      }));
    }
    if (params.maxOverlayIntensityH !== undefined) {
      const intensityH = params.maxOverlayIntensityH;
      useQRStore.setState((s) => ({
        safety: {
          ...s.safety,
          maxOverlayIntensityByEcc: {
            ...s.safety.maxOverlayIntensityByEcc,
            H: intensityH,
          },
        },
      }));
    }

    // GIF disposal
    if (params.gifDisposal)
      useQRStore.setState((s) => ({ output: { ...s.output, gifDisposal: params.gifDisposal! } }));
  }, [loadOverlayFromUrl]);

  return (
    <TooltipProvider>
      {/* Skip to main content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none"
        aria-label={t('accessibility.skipToMainContent', 'Skip to main content')}
      >
        {t('accessibility.skipToMainContent', 'Skip to main content')}
      </a>
      <div className="h-screen bg-background flex flex-col overflow-hidden relative">
        {/* Global busy overlay for export operations */}
        <BusyOverlay
          visible={isExporting}
          stage={t('preview.busy.workingOnIt', 'Working on it...')}
          cancelLabel={t('common.cancel', 'Cancel')}
        />
        {/* Welcome modal for first-time visitors (web only) */}
        <Suspense fallback={null}>
          <WelcomeModal />
        </Suspense>
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={showEditor ? sidebarOpen : false}
          onExport={download}
          showGallery={showGallery}
          activePage={currentPage}
          galleryFilter={galleryFilter}
          onGalleryFilterChange={setGalleryFilter}
          onNavigate={navigateTo}
        />
        <div
          ref={containerRef}
          className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
          style={{ marginTop: 'calc(52px + max(var(--sat, 0px), env(safe-area-inset-top, 0px)))' }}
        >
          {/* Mobile layout: Sidebar and Preview in column, both visible */}
          {/* Desktop/Tablet: Sidebar is fixed, Preview takes remaining space */}

          {/* Sidebar - only shown in editor mode */}
          {showEditor && (
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              mobileHeightPercent={mobileSplitPercent}
            />
          )}

          {/* Mobile divider - drag to resize sidebar/preview split */}
          {showEditor && sidebarOpen && (
            <MobileDivider
              onDrag={handleMobileDividerDrag}
              onDragEnd={handleMobileDividerDragEnd}
            />
          )}

          {/* Main content area - conditionally render active page */}
          {/* Content is constrained above footer and AdMob banner */}
          {/* On native: account for footer (~40px) + share/export bar (~48px) + AdMob banner (dynamic) */}
          {/* On web: just footer (~48px) */}
          <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
            style={{
              paddingBottom: (() => {
                const isNative = Capacitor.isNativePlatform();
                const editorPadding = isNative ? bannerHeight + 88 : 48;
                const nonEditorPadding = isNative ? bannerHeight + 40 : 48;
                return showEditor ? `${editorPadding}px` : `${nonEditorPadding}px`;
              })(),
            }}
          >
            <Preview sidebarOpen={sidebarOpen} hidden={!showEditor} />
            <Suspense fallback={<LazyLoadFallback />}>
              {showAnalyze && <Analyze onNavigate={navigateTo} generatedCanvas={generatedCanvas} />}
              {showGallery && <Gallery filter={galleryFilter} />}
              {showStaticPage && <StaticPage page={currentPage as StaticPageType} />}
            </Suspense>
          </div>
        </div>
        {/* Fixed Footer - visible on all platforms */}
        {/* On native: positioned just above AdMob banner. Ad is pinned to safe area, footer sits above it. */}
        <footer
          className={`border-t bg-background py-2 fixed left-0 right-0 z-40 transition-all duration-300 ${sidebarOpen && showEditor ? 'lg:ms-96' : ''}`}
          style={{ bottom: Capacitor.isNativePlatform() ? `${bannerHeight}px` : '0' }}
        >
          {/* Inner wrapper with margins to center over QR area (between ad columns) */}
          <div className="px-4 lg:mx-[160px] text-center flex items-center justify-center min-h-[24px]">
            <p className="text-[10px] sm:text-xs text-muted-foreground" dir="auto">
              <a
                href="/guide"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('guide');
                }}
              >
                {t('nav.guide')}
              </a>
              {' · '}
              <a
                href="/about"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('about');
                }}
              >
                {t('nav.about')}
              </a>
              {' · '}
              <a
                href="https://www.iubenda.com/privacy-policy/70266922"
                className="iubenda-noiframe iubenda-embed hover:underline"
                title={t('nav.privacy')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('nav.privacy')}
              </a>
              {' · '}
              <a
                href="/terms"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('terms');
                }}
              >
                {t('nav.terms')}
              </a>
              {' · '}
              <a
                href="/contact"
                className="hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('contact');
                }}
              >
                {t('nav.contact')}
              </a>
              {' · '}
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QRGeneratorProvider>
      <AppContent />
    </QRGeneratorProvider>
  );
}
