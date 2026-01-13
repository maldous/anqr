import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import * as LucideIcons from 'lucide-react';
import {
  BookOpen,
  Camera as CameraIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Globe,
  Grid3x3,
  Images,
  Info,
  Lightbulb,
  Mail,
  Menu,
  Moon,
  PanelLeft,
  Play,
  QrCode,
  ScanLine,
  Share2,
  Shield,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StaticPageType } from '@/components/StaticPage';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type GalleryCategory, gallerySections } from '@/data/gallery-items';
import { useBannerHeight } from '@/hooks/useBannerHeight';
import { isRtlLanguage, languages, loadLocale } from '@/i18n';
import { prepareRewardedAd, showRewardedAd } from '@/modules/admob-service';
import { copyToClipboard, getShareableUrl } from '@/modules/share-utils';
import { type Tier, useQRStore } from '@/store/qr-store';

// Dynamic icon component for gallery filters
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[name];
  return Icon ? <Icon className={className} /> : null;
}

type HeaderPage = 'editor' | 'gallery' | 'analyze' | StaticPageType;

const NAV_LINKS: Array<{
  href: string;
  labelKey: string;
  defaultLabel: string;
  page: HeaderPage;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { href: '/', labelKey: 'nav.generator', defaultLabel: 'Generator', page: 'editor', icon: QrCode },
  { href: '/analyze', labelKey: 'nav.analyze', defaultLabel: 'Analyze', page: 'analyze', icon: ScanLine },
  { href: '/gallery', labelKey: 'nav.gallery', defaultLabel: 'Gallery', page: 'gallery', icon: Images },
  { href: '/guide', labelKey: 'nav.guide', defaultLabel: 'Guide', page: 'guide', icon: BookOpen },
  { href: '/learn', labelKey: 'nav.learn', defaultLabel: 'Learn', page: 'learn', icon: Lightbulb },
  { href: '/examples', labelKey: 'nav.examples', defaultLabel: 'Examples', page: 'examples', icon: Sparkles },
  { href: '/about', labelKey: 'nav.about', defaultLabel: 'About', page: 'about', icon: Info },
  { href: '/privacy', labelKey: 'nav.privacy', defaultLabel: 'Privacy', page: 'privacy', icon: Shield },
  { href: '/terms', labelKey: 'nav.terms', defaultLabel: 'Terms', page: 'terms', icon: FileText },
  { href: '/translate', labelKey: 'nav.translate', defaultLabel: 'Translate', page: 'translate', icon: Globe },
  { href: '/contact', labelKey: 'nav.contact', defaultLabel: 'Contact', page: 'contact', icon: Mail },
];

type HeaderProps = Readonly<{
  onToggleSidebar?: () => void;
  onExport?: () => void;
  sidebarOpen?: boolean;
  showGallery?: boolean;
  activePage?: HeaderPage;
  galleryFilter?: GalleryCategory | 'all';
  onGalleryFilterChange?: (filter: GalleryCategory | 'all') => void;
  onNavigate?: (page: HeaderPage) => void;
}>;

export function Header({
  onToggleSidebar,
  onExport,
  sidebarOpen = false,
  showGallery = false,
  activePage,
  galleryFilter = 'all',
  onGalleryFilterChange,
  onNavigate,
}: HeaderProps) {
  // Use individual selectors to avoid re-renders when unrelated state changes
  // State slices - these change and would cause re-renders if subscribed to whole store
  const tier = useQRStore((s) => s.tier);
  const setOverlayFile = useQRStore((s) => s.setOverlayFile);
  const setOverlayEnabled = useQRStore((s) => s.setOverlayEnabled);
  const qr = useQRStore((s) => s.qr);
  const render = useQRStore((s) => s.render);
  const overlay = useQRStore((s) => s.overlay);
  const animation = useQRStore((s) => s.animation);
  const output = useQRStore((s) => s.output);
  const safety = useQRStore((s) => s.safety);
  const qa = useQRStore((s) => s.qa);
  const auto = useQRStore((s) => s.auto);
  const watermark = useQRStore((s) => s.watermark);
  const metadata = useQRStore((s) => s.metadata);

  // Stable function references - these don't change so grouping is fine
  const setTier = useQRStore((s) => s.setTier);
  const getPayloadText = useQRStore((s) => s.getPayloadText);
  const activatePremiumAccess = useQRStore((s) => s.activatePremiumAccess);
  const checkPremiumAccess = useQRStore((s) => s.checkPremiumAccess);
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isLangMenuClosing, setIsLangMenuClosing] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const bannerHeight = useBannerHeight();
  const langButtonRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  // Check scroll state and update indicators
  const updateScrollIndicators = useCallback(() => {
    const el = headerScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Small threshold to account for rounding
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  // Scroll the header by a fixed amount
  const scrollHeader = useCallback((direction: 'left' | 'right') => {
    const el = headerScrollRef.current;
    if (!el) return;
    const scrollAmount = 150;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Set up scroll and resize observers
  useEffect(() => {
    const el = headerScrollRef.current;
    if (!el) return;

    // Initial check
    updateScrollIndicators();

    // Listen for scroll events
    el.addEventListener('scroll', updateScrollIndicators, { passive: true });

    // Listen for resize events
    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      resizeObserver.disconnect();
    };
  }, [updateScrollIndicators]);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = async (code: string) => {
    // Pre-load locale before switching to ensure translations are available immediately
    await loadLocale(code);
    i18n.changeLanguage(code);
    closeLangMenu();
  };

  // Smooth close for language menu
  const closeLangMenu = () => {
    if (langMenuOpen) {
      setIsLangMenuClosing(true);
      setLangMenuOpen(false);
    }
  };

  // Smooth close for mobile menu
  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setIsMobileMenuClosing(true);
      setMobileMenuOpen(false);
    }
  };

  const resolvedPage: HeaderPage = activePage ?? (showGallery ? 'gallery' : 'editor');
  const isEditor = resolvedPage === 'editor';
  const isGallery = resolvedPage === 'gallery';
  const _isStatic = !(isEditor || isGallery);

  useEffect(() => {
    const isDark =
      localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') &&
        globalThis.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Prepare premium rewarded ad on mount (for native platforms)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      prepareRewardedAd('premium');
    }
  }, []);

  // Handle tier change - Professional requires watching ad on native
  const handleTierChange = async (newTier: Tier) => {
    // If selecting Professional on native platform, require watching ad
    if (newTier === 'professional' && Capacitor.isNativePlatform()) {
      // If already has premium access, allow direct selection
      if (checkPremiumAccess()) {
        setTier(newTier);
        return;
      }

      // Show rewarded ad
      setLoadingAd(true);
      try {
        const reward = await showRewardedAd('premium');
        if (reward) {
          // User watched the ad, grant premium access
          activatePremiumAccess();
          setTier('professional');
        }
        // If reward is null, user didn't complete the ad - don't change tier
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
      } finally {
        setLoadingAd(false);
        // Prepare next ad
        prepareRewardedAd('premium');
      }
    } else {
      // Web or non-professional tier - allow direct change
      setTier(newTier);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Camera capture for quick overlay demo (Android only)
  const handleCameraCapture = async () => {
    setCameraError(null);
    setCameraLoading(true);

    try {
      // Check permissions first
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === 'denied') {
        // Try to request permissions
        const requested = await Camera.requestPermissions();
        if (requested.camera === 'denied') {
          setCameraError(t('camera.permissionDenied'));
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        // Convert data URL to File object
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Set as overlay and enable it
        setOverlayFile(file);
        setOverlayEnabled(true);

        // Navigate to editor if not already there
        if (resolvedPage !== 'editor') {
          onNavigate?.('editor');
        }
      }
    } catch (error: unknown) {
      // Check for user cancellation vs actual error
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'Unknown error';
      }
      if (errorMessage.includes('cancelled') || errorMessage.includes('User cancelled')) {
        // User cancelled - silently ignore
        console.log('Camera capture cancelled');
      } else if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
        setCameraError(t('camera.permissionDenied'));
      } else {
        setCameraError(t('camera.error'));
        console.error('Camera capture failed:', errorMessage);
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // Clear camera error after 3 seconds
  useEffect(() => {
    if (cameraError) {
      const timer = setTimeout(() => setCameraError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [cameraError]);

  const handleShare = async () => {
    const shareConfig = {
      data: getPayloadText(),
      lang: i18n.language,
      // QR settings
      ec: qr.ecc,
      version: qr.version === 0 ? undefined : qr.version,
      size: render.modulePx === 20 ? undefined : render.modulePx,
      margin: qr.quietZoneModules === 4 ? undefined : qr.quietZoneModules,
      encodingMode: qr.encodingMode === 'auto' ? undefined : qr.encodingMode,
      borderModulesExtra: qr.borderModulesExtra === 0 ? undefined : qr.borderModulesExtra,
      quietZoneMinEnforce: qr.quietZoneMinEnforce === false ? false : undefined,
      // Colors
      fg: render.fgColor === '#000000' ? undefined : render.fgColor,
      bg: render.bgColor === '#ffffff' ? undefined : render.bgColor,
      transparent: render.bgTransparent || undefined,
      // Styles
      style: render.moduleStyle === 'square' ? undefined : render.moduleStyle,
      finder: render.finderStyle === 'square' ? undefined : render.finderStyle,
      alignmentStyle: render.alignmentStyle === 'match_finder' ? undefined : render.alignmentStyle,
      timingStyle: render.timingStyle === 'match_module' ? undefined : render.timingStyle,
      // Render settings
      moduleGap: render.moduleGapPercent === 0 ? undefined : render.moduleGapPercent,
      gapMode: render.gapMode === 'none' ? undefined : render.gapMode,
      cornerRadius: render.cornerRadius === 0 ? undefined : render.cornerRadius,
      gradientType: render.gradient.type === 'none' ? undefined : render.gradient.type,
      eyeOuterStyle: render.eyeOuterStyle === 'square' ? undefined : render.eyeOuterStyle,
      eyeInnerStyle: render.eyeInnerStyle === 'square' ? undefined : render.eyeInnerStyle,
      eyeScale: render.eyeScale === 100 ? undefined : render.eyeScale,
      frameStyle: render.frameStyle === 'none' ? undefined : render.frameStyle,
      frameText: render.frameText || undefined,
      dotRotation: render.dotRotationDeg === 0 ? undefined : render.dotRotationDeg,
      crispEdges: render.crispEdges === false ? false : undefined,
      pixelSnap: render.pixelSnap === 'floor' ? undefined : render.pixelSnap,
      perModuleColorMode:
        render.perModuleColorMode === 'solid' ? undefined : render.perModuleColorMode,
      contrastGuard: render.contrastGuard ? true : undefined,
      minContrastRatio:
        !render.contrastGuard || render.minContrastRatio === 4.5
          ? undefined
          : render.minContrastRatio,
      // Overlay
      mode: overlay.enabled ? overlay.mode : undefined,
      intensity: !overlay.enabled || overlay.intensity === 100 ? undefined : overlay.intensity,
      overlayUrl: overlay.enabled && overlay.url ? overlay.url : undefined,
      fit: !overlay.enabled || overlay.fit === 'cover' ? undefined : overlay.fit,
      rotate: !overlay.enabled || overlay.rotateDeg === 0 ? undefined : overlay.rotateDeg,
      flipX: overlay.enabled && overlay.flipX ? true : undefined,
      flipY: overlay.enabled && overlay.flipY ? true : undefined,
      preserveFinders: overlay.enabled && !overlay.preserveFinders ? false : undefined,
      preserveTiming: overlay.enabled && overlay.preserveTiming ? true : undefined,
      preserveAlignment: overlay.enabled && overlay.preserveAlignment ? true : undefined,
      protectFormatInfo: overlay.enabled && overlay.protectFormatInfo ? true : undefined,
      protectVersionInfo: overlay.enabled && overlay.protectVersionInfo ? true : undefined,
      eccAwareEnabled: overlay.enabled && overlay.eccAwareEnabled ? true : undefined,
      eccAwareRiskBudget:
        !(overlay.enabled && overlay.eccAwareEnabled) || overlay.eccAwareRiskBudget === 50
          ? undefined
          : overlay.eccAwareRiskBudget,
      eccAwareWeightMap:
        !(overlay.enabled && overlay.eccAwareEnabled) ||
        overlay.eccAwareWeightMap === 'distance_to_finders'
          ? undefined
          : overlay.eccAwareWeightMap,
      // Overlay preprocessing (only if overlay enabled)
      colorMode: !overlay.enabled || overlay.colorMode === 'color' ? undefined : overlay.colorMode,
      brightness: !overlay.enabled || overlay.brightness === 0 ? undefined : overlay.brightness,
      contrast: !overlay.enabled || overlay.contrast === 0 ? undefined : overlay.contrast,
      gamma: !overlay.enabled || overlay.gamma === 1 ? undefined : overlay.gamma,
      saturation: !overlay.enabled || overlay.saturation === 0 ? undefined : overlay.saturation,
      hue: !overlay.enabled || overlay.hueRotateDeg === 0 ? undefined : overlay.hueRotateDeg,
      blur: !overlay.enabled || overlay.blurPx === 0 ? undefined : overlay.blurPx,
      sharpen: !overlay.enabled || overlay.sharpen === 0 ? undefined : overlay.sharpen,
      posterize:
        !overlay.enabled || overlay.posterizeLevels === 0 ? undefined : overlay.posterizeLevels,
      threshold: !overlay.enabled || overlay.threshold === 128 ? undefined : overlay.threshold,
      edge: !overlay.enabled || overlay.edgeDetect === 'off' ? undefined : overlay.edgeDetect,
      invert: overlay.enabled && overlay.invert ? overlay.invert : undefined,
      // Dithering (only if overlay enabled)
      ditherKind:
        !overlay.enabled || overlay.ditherKind === 'error_diffusion'
          ? undefined
          : overlay.ditherKind,
      diffusionKernel:
        !overlay.enabled || overlay.diffusionKernel === 'floyd_steinberg'
          ? undefined
          : overlay.diffusionKernel,
      ditherStrength:
        !overlay.enabled || overlay.ditherStrength === 50 ? undefined : overlay.ditherStrength,
      ditherSerpentine: overlay.enabled && overlay.ditherSerpentine ? true : undefined,
      orderedMatrix:
        !overlay.enabled || overlay.orderedMatrix === 'bayer4' ? undefined : overlay.orderedMatrix,
      blueNoiseTileSize:
        !overlay.enabled || overlay.blueNoiseTileSize === 64
          ? undefined
          : overlay.blueNoiseTileSize,
      blueNoiseSeed:
        !overlay.enabled || overlay.blueNoiseSeed === 0 ? undefined : overlay.blueNoiseSeed,
      colorDither:
        !overlay.enabled || overlay.colorDither === 'none' ? undefined : overlay.colorDither,
      // Subpixel
      subpixelGridSize:
        !overlay.enabled || overlay.mode !== 'subpixel' || overlay.subpixelGridSize === '3x3'
          ? undefined
          : overlay.subpixelGridSize,
      subpixelCenterRule:
        !overlay.enabled || overlay.mode !== 'subpixel' || overlay.subpixelCenterRule === 'strict'
          ? undefined
          : overlay.subpixelCenterRule,
      subpixelNeutralColor:
        !overlay.enabled ||
        overlay.mode !== 'subpixel' ||
        overlay.subpixelNeutralColor === '#808080'
          ? undefined
          : overlay.subpixelNeutralColor,
      subpixelFinderOverride:
        !overlay.enabled ||
        overlay.mode !== 'subpixel' ||
        overlay.subpixelFinderOverride === 'solid'
          ? undefined
          : overlay.subpixelFinderOverride,
      // Halftone
      halftoneCell:
        !overlay.enabled || overlay.mode !== 'halftone' || overlay.halftoneCell === 'per_module'
          ? undefined
          : overlay.halftoneCell,
      halftoneDotShape:
        !overlay.enabled || overlay.mode !== 'halftone' || overlay.halftoneDotShape === 'circle'
          ? undefined
          : overlay.halftoneDotShape,
      brightnessCurve:
        !overlay.enabled || overlay.mode !== 'halftone' || overlay.brightnessCurve === 'linear'
          ? undefined
          : overlay.brightnessCurve,
      duotoneColor1:
        !overlay.enabled || overlay.mode !== 'duotone' || overlay.duotoneColors[0] === '#000000'
          ? undefined
          : overlay.duotoneColors[0],
      duotoneColor2:
        !overlay.enabled || overlay.mode !== 'duotone' || overlay.duotoneColors[1] === '#ffffff'
          ? undefined
          : overlay.duotoneColors[1],
      // Animation
      speed: animation.speedMs === 100 ? undefined : animation.speedMs,
      loop: animation.loop === false ? false : undefined,
      reverse: animation.bounce ? true : undefined,
      startFrame: animation.startFrame === 0 ? undefined : animation.startFrame,
      maxFrames: animation.maxFrames === 0 ? undefined : animation.maxFrames,
      frameStep: animation.frameStep === 1 ? undefined : animation.frameStep,
      interpolate: animation.interpolate === 'none' ? undefined : animation.interpolate,
      temporalDither: animation.temporalDither === 'off' ? undefined : animation.temporalDither,
      pattern: animation.pattern === 'none' ? undefined : animation.pattern,
      moduleJitter: animation.moduleJitterPx === 0 ? undefined : animation.moduleJitterPx,
      colorCycle: animation.colorCycle ? true : undefined,
      seed: animation.seed === 0 ? undefined : animation.seed,
      // Output
      width: output.widthPx === 400 ? undefined : output.widthPx,
      height: output.heightPx === 400 ? undefined : output.heightPx,
      format: output.format === 'gif' ? undefined : output.format,
      quality: output.quality === 0.9 ? undefined : output.quality,
      filename: output.filename === 'anqr-qrcode' ? undefined : output.filename,
      gifPaletteSize:
        output.format !== 'gif' || output.gifPaletteSize === 256
          ? undefined
          : output.gifPaletteSize,
      gifQuantizer:
        output.format !== 'gif' || output.gifQuantizer === 'median_cut'
          ? undefined
          : output.gifQuantizer,
      gifDither:
        output.format !== 'gif' || output.gifDither === 'floyd' ? undefined : output.gifDither,
      svgTrueVector: output.format === 'svg' && output.svgTrueVector ? true : undefined,
      dpi: output.dpi === 72 ? undefined : output.dpi,
      includeQuietZone: output.includeQuietZone === false ? false : undefined,
      bgOverride: output.bgOverride ? output.bgOverride : undefined,
      gifTransparentColor:
        output.format !== 'gif' || !output.gifTransparentColor
          ? undefined
          : output.gifTransparentColor,
      svgShapePrecision:
        output.format !== 'svg' || output.svgShapePrecision === 'pixel'
          ? undefined
          : output.svgShapePrecision,
      svgEmbedRasterOverlay:
        output.format === 'svg' && output.svgEmbedRasterOverlay === false ? false : undefined,
      formatExtra: output.formatExtra === 'none' ? undefined : output.formatExtra,
      // Safety
      safetyMode: safety.mode === 'off' ? undefined : safety.mode,
      safetyMinModulePx:
        safety.mode !== 'off' && safety.minModulePx !== 2 ? safety.minModulePx : undefined,
      safetyMinQuietZone:
        safety.mode !== 'off' && safety.minQuietZoneModules !== 4
          ? safety.minQuietZoneModules
          : undefined,
      lockFinders: safety.mode !== 'off' && !safety.lockFinders ? false : undefined,
      lockTiming: safety.mode !== 'off' && !safety.lockTiming ? false : undefined,
      lockAlign: safety.mode !== 'off' && !safety.lockAlign ? false : undefined,
      lockFormat: safety.mode !== 'off' && !safety.lockFormat ? false : undefined,
      lockVersion: safety.mode !== 'off' && !safety.lockVersion ? false : undefined,
      // QA
      qaContrastCheck: qa.contrastCheck ? true : undefined,
      qaSimulateBlur: qa.simulateBlurPx === 0 ? undefined : qa.simulateBlurPx,
      qaSimulateNoise: qa.simulateNoise === 0 ? undefined : qa.simulateNoise,
      qaSimulateRotation: qa.simulateRotationDeg === 0 ? undefined : qa.simulateRotationDeg,
      qaShowHeatmap: qa.showHeatmap ? true : undefined,
      // Auto-tuning
      autoPickVersion: auto.pickVersion === false ? false : undefined,
      autoPickEcc: auto.pickEcc ? true : undefined,
      autoReduceIntensity: auto.reduceIntensityUntilSafe ? true : undefined,
      // Watermark
      watermarkEnabled: watermark.enabled ? true : undefined,
      watermarkKind: !watermark.enabled || watermark.kind === 'text' ? undefined : watermark.kind,
      watermarkText:
        watermark.enabled && watermark.kind === 'text' && watermark.text
          ? watermark.text
          : undefined,
      watermarkPosition:
        !watermark.enabled || watermark.position === 'center' ? undefined : watermark.position,
      watermarkOpacity:
        !watermark.enabled || watermark.opacity === 50 ? undefined : watermark.opacity,
      watermarkBlend:
        !watermark.enabled || watermark.blend === 'normal' ? undefined : watermark.blend,
      // Metadata
      metaTitle: metadata.title || undefined,
      metaAuthor: metadata.author || undefined,
      metaCopyright: metadata.copyright || undefined,
      metaLicense: metadata.license || undefined,
      metaDescription: metadata.description || undefined,
      metaCreationTime: metadata.creationTime ? true : undefined,
      metaCustomKv: metadata.customKv.length > 0 ? JSON.stringify(metadata.customKv) : undefined,
    };
    const url = getShareableUrl(shareConfig);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Camera loading overlay */}
      {cameraLoading && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-sm font-medium">{t('camera.loading')}</span>
          </div>
        </div>
      )}

      {/* Camera error toast */}
      {cameraError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-[slide-down_0.2s_ease-out]">
          {cameraError}
        </div>
      )}
      <header
        className={`border-b bg-card shadow-md fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${sidebarOpen && isEditor ? 'lg:ms-96' : ''}`}
        style={{ paddingTop: 'max(var(--sat, 0px), env(safe-area-inset-top, 0px))' }}
      >
        <div className="relative flex items-center h-[52px]">
          {/* Left scroll indicator (start side in RTL) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollHeader('left')}
              className={`absolute z-10 flex items-center justify-center w-8 h-full cursor-pointer transition-colors ${
                isRtlLanguage(i18n.language)
                  ? 'right-0 bg-gradient-to-l from-card to-transparent hover:from-muted'
                  : 'left-0 bg-gradient-to-r from-card to-transparent hover:from-muted'
              }`}
              title={t('accessibility.scrollLeft')}
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          
          {/* Right scroll indicator (end side in RTL) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollHeader('right')}
              className={`absolute z-10 flex items-center justify-center w-8 h-full cursor-pointer transition-colors ${
                isRtlLanguage(i18n.language)
                  ? 'left-0 bg-gradient-to-r from-card to-transparent hover:from-muted'
                  : 'right-0 bg-gradient-to-l from-card to-transparent hover:from-muted'
              }`}
              title={t('accessibility.scrollRight')}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          
          <div
            ref={headerScrollRef}
            className="px-2 sm:px-4 flex items-center justify-between w-full h-full overflow-x-auto scrollbar-hide"
          >
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            {/* Settings toggle - only in editor mode, placeholder space on other pages */}
            {isEditor ? (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="flex items-center justify-center w-8 h-8 hover:opacity-80 cursor-pointer"
                title={t('accessibility.toggleSettings')}
              >
                <PanelLeft className="h-6 w-6 text-muted-foreground" />
              </button>
            ) : (
              /* Placeholder space to keep layout consistent with Generator */
              <div className="hidden lg:block w-8 h-8" />
            )}

            {/* ANQR logo/title - always navigates to generator */}
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                onNavigate?.('editor');
              }}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer"
              title={`${t('app.name')} - ${t('app.tagline')}`}
            >
              <span className="text-xl font-bold leading-6">ANQR</span>
            </button>

            {/* Camera button for quick overlay demo (Android only, editor only) */}
            {isEditor && Capacitor.isNativePlatform() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCameraCapture}
                className="h-9 w-9"
                title={t('header.captureOverlay')}
                disabled={cameraLoading}
              >
                <CameraIcon className="h-5 w-5" />
              </Button>
            )}

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.page === resolvedPage;
                return (
                  <a
                    key={link.labelKey}
                    href={link.href}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'text-foreground bg-muted font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
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
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            {/* Gallery Filter - icon buttons right-justified next to dark mode toggle */}
            {isGallery && (
              <div className="hidden lg:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onGalleryFilterChange?.('all')}
                  className={`p-2 rounded-md transition-colors ${
                    galleryFilter === 'all'
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={t('accessibility.allCategories')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                {gallerySections.map((section) => (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => onGalleryFilterChange?.(section.id)}
                    className={`p-2 rounded-md transition-colors ${
                      galleryFilter === section.id
                        ? 'text-foreground bg-muted'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title={section.title}
                  >
                    <DynamicIcon name={section.icon} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            {/* Tier Toggle */}
            {isEditor && (
              <>
                <div className="hidden sm:block">
                  <Tabs
                    value={tier}
                    onValueChange={(v) => handleTierChange(v as Tier)}
                    data-testid="tier-tabs"
                  >
                    <TabsList className="shadow-sm">
                      <TabsTrigger
                        value="basic"
                        className="text-xs px-3"
                        title={t('tiers.basic')}
                        disabled={loadingAd}
                        data-testid="tier-tab-basic"
                      >
                        {t('tiers.basic')}
                      </TabsTrigger>
                      <TabsTrigger
                        value="advanced"
                        className="text-xs px-3"
                        title={t('tiers.advanced')}
                        disabled={loadingAd}
                        data-testid="tier-tab-advanced"
                      >
                        {t('tiers.advanced')}
                      </TabsTrigger>
                      <TabsTrigger
                        value="professional"
                        className="text-xs px-3 gap-1"
                        title={
                          Capacitor.isNativePlatform() && !checkPremiumAccess()
                            ? t('tiers.watchAdForPro')
                            : t('tiers.professional')
                        }
                        disabled={loadingAd}
                        data-testid="tier-tab-professional"
                      >
                        {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                          <Play className="w-3 h-3" />
                        )}
                        {t('tiers.professional')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="sm:hidden">
                  <Select
                    value={tier}
                    onValueChange={(v) => handleTierChange(v as Tier)}
                    disabled={loadingAd}
                  >
                    <SelectTrigger className="w-[72px] h-9 text-xs" data-testid="tier-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" data-testid="tier-option-basic">
                        {t('tiers.basic')}
                      </SelectItem>
                      <SelectItem value="advanced" data-testid="tier-option-advanced">
                        {t('tiers.advanced')}
                      </SelectItem>
                      <SelectItem value="professional" data-testid="tier-option-professional">
                        <span className="flex items-center gap-1">
                          {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                            <Play className="w-3 h-3" />
                          )}
                          {t('tiers.professional')}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Actions */}
            {isEditor && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="shadow-sm"
                  onClick={handleShare}
                  title={t('accessibility.copyShareLink')}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Share2 className="h-4 w-4 mr-2" />
                  )}
                  {copied ? t('share.copied') : t('header.share')}
                </Button>
                <Button
                  size="sm"
                  className="shadow-sm"
                  onClick={onExport}
                  title={t('accessibility.exportQrCode')}
                  data-testid="export-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('header.export')}
                </Button>
              </div>
            )}

            {/* Language Selector */}
            <div className="relative" ref={langButtonRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (langMenuOpen ? closeLangMenu() : setLangMenuOpen(true))}
                className="h-9 w-9"
                title={t('language.select')}
              >
                <span className="text-base">{currentLang.flag}</span>
              </Button>
              {(langMenuOpen || isLangMenuClosing) && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-[60] cursor-default bg-transparent border-none"
                    onClick={closeLangMenu}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') closeLangMenu();
                    }}
                    aria-label="Close menu"
                    tabIndex={-1}
                  />
                  <div
                    className={`fixed w-72 bg-card border rounded-lg shadow-lg z-[70] py-1 max-h-[50vh] overflow-y-auto origin-top ${
                      isLangMenuClosing
                        ? 'animate-[dropdown-close_0.15s_ease-in_forwards]'
                        : 'animate-[dropdown_0.2s_ease-out]'
                    }`}
                    style={{
                      top: langButtonRef.current
                        ? langButtonRef.current.getBoundingClientRect().bottom + 4
                        : 0,
                      // Position flush against the appropriate edge based on text direction
                      ...(isRtlLanguage(i18n.language)
                        ? { left: 8 } // RTL: flush against left edge
                        : { right: 8 }), // LTR: flush against right edge
                    }}
                    onAnimationEnd={() => {
                      if (isLangMenuClosing) {
                        setIsLangMenuClosing(false);
                      }
                    }}
                  >
                    {/* Sort languages: current language first, then alphabetically by translated name */}
                    {[...languages]
                      .sort((a, b) => {
                        const currentCode = i18n.language.split('-')[0];
                        const aIsCurrent = a.code === currentCode || a.code === i18n.language;
                        const bIsCurrent = b.code === currentCode || b.code === i18n.language;
                        // Current language always first
                        if (aIsCurrent && !bIsCurrent) return -1;
                        if (bIsCurrent && !aIsCurrent) return 1;
                        // Sort by translated name in current language
                        const aName = t(`languages.${a.code}`);
                        const bName = t(`languages.${b.code}`);
                        return aName.localeCompare(bName, i18n.language);
                      })
                      .map((lang) => (
                        <button
                          type="button"
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 ${i18n.language === lang.code || i18n.language.startsWith(lang.code) ? 'bg-muted' : ''}`}
                          title={`${lang.nativeName} - ${t(`languages.${lang.code}`)}`}
                        >
                          <span>{lang.flag}</span>
                          <span>
                            {lang.nativeName}
                            {/* Show English name for current language if not English, otherwise show translated name for other languages */}
                            {(() => {
                              const isCurrentLang =
                                lang.code === i18n.language || i18n.language.startsWith(lang.code);
                              if (isCurrentLang) {
                                return lang.code === 'en-GB' ? '' : ` (${lang.name})`;
                              }
                              return ` (${t(`languages.${lang.code}`)})`;
                            })()}
                          </span>
                          {(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9"
              title={darkMode ? t('header.lightMode') : t('header.darkMode')}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Mobile Menu Button - shows when desktop nav is hidden (below lg breakpoint) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => (mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true))}
              title={t('accessibility.openNavMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          </div>
        </div>

        {/* Mobile Menu - shows when desktop nav is hidden (below lg breakpoint) */}
        {(mobileMenuOpen || isMobileMenuClosing) && (
          <div
            className={`lg:hidden border-t bg-card p-3 overflow-hidden origin-top ${
              isMobileMenuClosing
                ? 'animate-[slide-up_0.2s_ease-in_forwards]'
                : 'animate-[slide-down_0.2s_ease-out_forwards]'
            }`}
            onAnimationEnd={() => {
              if (isMobileMenuClosing) {
                setIsMobileMenuClosing(false);
              }
            }}
          >
            <nav className="flex flex-col gap-2">
              {/* Generator - Full width emphasized */}
              {(() => {
                const generatorLink = NAV_LINKS[0];
                const isActive = generatorLink.page === resolvedPage;
                const IconComponent = generatorLink.icon;
                return (
                  <a
                    href={generatorLink.href}
                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-muted hover:bg-primary/10 text-foreground font-medium'
                    }`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(generatorLink.page);
                      }
                      closeMobileMenu();
                    }}
                    title={`Go to ${t(generatorLink.labelKey, generatorLink.defaultLabel)}`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">
                      {t(generatorLink.labelKey, generatorLink.defaultLabel)}
                    </span>
                  </a>
                );
              })()}

              {/* Remaining items in 3x3 grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {NAV_LINKS.slice(1).map((link) => {
                  const isActive = link.page === resolvedPage;
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.labelKey}
                      href={link.href}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-md transition-colors ${
                        isActive
                          ? 'text-foreground bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(link.page);
                        }
                        closeMobileMenu();
                      }}
                      title={`Go to ${t(link.labelKey, link.defaultLabel)}`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[11px] leading-tight text-center">
                        {t(link.labelKey, link.defaultLabel)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Footer Bar - Share/Export buttons fixed at bottom (only in editor mode on mobile) */}
      {/* On native platforms: position above footer (40px) + AdMob banner (dynamic height) */}
      {isEditor && (
        <div
          className="md:hidden fixed left-0 right-0 z-50 border-t bg-card p-2"
          style={{
            bottom: Capacitor.isNativePlatform() ? `${bannerHeight + 40}px` : '48px',
            paddingBottom: Capacitor.isNativePlatform()
              ? '0.25rem'
              : 'calc(0.5rem + var(--sab, 0px))',
          }}
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleShare}
              title={t('accessibility.copyShareLink')}
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
              {copied ? t('share.copied') : t('header.share')}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={onExport}
              title={t('accessibility.exportQrCode')}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('header.export')}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
