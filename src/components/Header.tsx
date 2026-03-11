import { Capacitor } from '@capacitor/core';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Contrast,
  Download,
  FileText,
  Film,
  Globe,
  Grid3x3,
  Image,
  Images,
  Info,
  Layers,
  Lightbulb,
  Mail,
  Menu,
  Moon,
  Paintbrush,
  Palette,
  PanelLeft,
  Play,
  QrCode,
  ScanLine,
  Settings2,
  Shapes,
  Share2,
  Shield,
  Sliders,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { StaticPageType } from '@/components/StaticPage';
import { Button } from '@/components/ui/button';
import { DynamicTestId } from '@/components/ui/dynamic-testid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type GalleryCategory, gallerySectionManifest } from '@/data/gallery-manifest';
import { useBannerHeight } from '@/hooks/useBannerHeight';
import { isRtlLanguage, languages, loadLocale } from '@/i18n';
import { createLogger } from '@/lib/logger';
import { trackEvent } from '@/lib/zaraz';
import { copyToClipboard } from '@/modules/browser-clipboard';
import { prepareInterstitial, showInterstitial } from '@/modules/platform';
import { getShareableUrl } from '@/modules/share-links';
import { type Tier, useQRStore } from '@/store/qr-store';

// Icon map for gallery section icons - explicit imports for tree-shaking
const GALLERY_ICON_MAP: Record<string, LucideIcon> = {
  QrCode,
  FileText,
  Shapes,
  Palette,
  Image,
  Film,
  Layers,
  Contrast,
  Sliders,
  Settings2,
  Grid3x3,
  Sparkles,
  Paintbrush,
};

// Dynamic icon component for gallery filters - uses explicit map instead of barrel import
function DynamicIcon({ name, className }: Readonly<{ name: string; className?: string }>) {
  const Icon = GALLERY_ICON_MAP[name];
  return Icon ? <Icon className={className} /> : null;
}

const log = createLogger('HEADER');

type HeaderPage = 'editor' | 'gallery' | 'analyze' | StaticPageType;

const NAV_LINKS: Array<{
  href: string;
  labelKey: string;
  defaultLabel: string;
  page: HeaderPage;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  iubendaEmbed?: boolean;
}> = [
  { href: '/', labelKey: 'nav.generator', defaultLabel: 'Generator', page: 'editor', icon: QrCode },
  {
    href: '/analyze',
    labelKey: 'nav.analyze',
    defaultLabel: 'Analyze',
    page: 'analyze',
    icon: ScanLine,
  },
  {
    href: '/gallery',
    labelKey: 'nav.gallery',
    defaultLabel: 'Gallery',
    page: 'gallery',
    icon: Images,
  },
  { href: '/guide', labelKey: 'nav.guide', defaultLabel: 'Guide', page: 'guide', icon: BookOpen },
  { href: '/learn', labelKey: 'nav.learn', defaultLabel: 'Learn', page: 'learn', icon: Lightbulb },
  {
    href: '/examples',
    labelKey: 'nav.examples',
    defaultLabel: 'Examples',
    page: 'examples',
    icon: Sparkles,
  },
  { href: '/about', labelKey: 'nav.about', defaultLabel: 'About', page: 'about', icon: Info },
  {
    href: '/privacy',
    labelKey: 'nav.privacy',
    defaultLabel: 'Privacy',
    page: 'privacy',
    icon: Shield,
  },
  { href: '/terms', labelKey: 'nav.terms', defaultLabel: 'Terms', page: 'terms', icon: FileText },
  {
    href: '/translate',
    labelKey: 'nav.translate',
    defaultLabel: 'Translate',
    page: 'translate',
    icon: Globe,
  },
  {
    href: '/contact',
    labelKey: 'nav.contact',
    defaultLabel: 'Contact',
    page: 'contact',
    icon: Mail,
  },
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

function buildHeaderShareConfig(
  getPayloadText: () => string,
  lang: string,
  qr: ReturnType<typeof useQRStore.getState>['qr'],
  render: ReturnType<typeof useQRStore.getState>['render'],
  overlay: ReturnType<typeof useQRStore.getState>['overlay'],
  animation: ReturnType<typeof useQRStore.getState>['animation'],
  output: ReturnType<typeof useQRStore.getState>['output'],
  safety: ReturnType<typeof useQRStore.getState>['safety'],
  qa: ReturnType<typeof useQRStore.getState>['qa'],
  auto: ReturnType<typeof useQRStore.getState>['auto'],
  watermark: ReturnType<typeof useQRStore.getState>['watermark'],
  metadata: ReturnType<typeof useQRStore.getState>['metadata']
) {
  return buildHeaderShareConfigCore(
    getPayloadText(),
    lang,
    qr,
    render,
    overlay,
    animation,
    output,
    safety,
    qa,
    auto,
    watermark,
    metadata
  );
}

function buildHeaderShareConfigCore(
  data: string,
  lang: string,
  qr: ReturnType<typeof useQRStore.getState>['qr'],
  render: ReturnType<typeof useQRStore.getState>['render'],
  overlay: ReturnType<typeof useQRStore.getState>['overlay'],
  animation: ReturnType<typeof useQRStore.getState>['animation'],
  output: ReturnType<typeof useQRStore.getState>['output'],
  safety: ReturnType<typeof useQRStore.getState>['safety'],
  qa: ReturnType<typeof useQRStore.getState>['qa'],
  auto: ReturnType<typeof useQRStore.getState>['auto'],
  watermark: ReturnType<typeof useQRStore.getState>['watermark'],
  metadata: ReturnType<typeof useQRStore.getState>['metadata']
) {
  return {
    data,
    lang,
    ...buildHeaderQrSettings(qr, render),
    ...buildHeaderColors(render),
    ...buildHeaderStyles(render),
    ...buildHeaderOverlay(overlay),
    ...buildHeaderAnimation(animation),
    ...buildHeaderOutput(output),
    ...buildHeaderSafetyQaAuto(safety, qa, auto, watermark, metadata),
  };
}

function buildHeaderQrSettings(
  qr: ReturnType<typeof useQRStore.getState>['qr'],
  render: ReturnType<typeof useQRStore.getState>['render']
) {
  return {
    ec: qr.ecc,
    version: qr.version === 0 ? undefined : qr.version,
    size: render.modulePx === 20 ? undefined : render.modulePx,
    margin: qr.quietZoneModules === 4 ? undefined : qr.quietZoneModules,
    encodingMode: qr.encodingMode === 'auto' ? undefined : qr.encodingMode,
    borderModulesExtra: qr.borderModulesExtra === 0 ? undefined : qr.borderModulesExtra,
    quietZoneMinEnforce: qr.quietZoneMinEnforce === false ? false : undefined,
  };
}

function buildHeaderColors(render: ReturnType<typeof useQRStore.getState>['render']) {
  return {
    fg: render.fgColor === '#000000' ? undefined : render.fgColor,
    bg: render.bgColor === '#ffffff' ? undefined : render.bgColor,
    transparent: render.bgTransparent || undefined,
  };
}

function buildHeaderStylesModule(render: ReturnType<typeof useQRStore.getState>['render']) {
  return {
    style: render.moduleStyle === 'square' ? undefined : render.moduleStyle,
    finder: render.finderStyle === 'square' ? undefined : render.finderStyle,
    alignmentStyle: render.alignmentStyle === 'match_finder' ? undefined : render.alignmentStyle,
    timingStyle: render.timingStyle === 'match_module' ? undefined : render.timingStyle,
    moduleGap: render.moduleGapPercent === 0 ? undefined : render.moduleGapPercent,
    gapMode: render.gapMode === 'none' ? undefined : render.gapMode,
    cornerRadius: render.cornerRadius === 0 ? undefined : render.cornerRadius,
    gradientType: render.gradient.type === 'none' ? undefined : render.gradient.type,
  };
}

function buildHeaderStylesEye(render: ReturnType<typeof useQRStore.getState>['render']) {
  return {
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
  };
}

function buildHeaderStyles(render: ReturnType<typeof useQRStore.getState>['render']) {
  return {
    ...buildHeaderStylesModule(render),
    ...buildHeaderStylesEye(render),
  };
}

function buildHeaderOverlayProtection(overlay: ReturnType<typeof useQRStore.getState>['overlay']) {
  return {
    preserveFinders: !overlay.preserveFinders ? false : undefined,
    preserveTiming: overlay.preserveTiming ? true : undefined,
    preserveAlignment: overlay.preserveAlignment ? true : undefined,
    protectFormatInfo: overlay.protectFormatInfo ? true : undefined,
    protectVersionInfo: overlay.protectVersionInfo ? true : undefined,
    eccAwareEnabled: overlay.eccAwareEnabled ? true : undefined,
    eccAwareRiskBudget:
      !overlay.eccAwareEnabled || overlay.eccAwareRiskBudget === 50
        ? undefined
        : overlay.eccAwareRiskBudget,
    eccAwareWeightMap:
      !overlay.eccAwareEnabled || overlay.eccAwareWeightMap === 'distance_to_finders'
        ? undefined
        : overlay.eccAwareWeightMap,
  };
}

function buildHeaderOverlayPreprocessing(
  overlay: ReturnType<typeof useQRStore.getState>['overlay']
) {
  return {
    colorMode: overlay.colorMode === 'color' ? undefined : overlay.colorMode,
    brightness: overlay.brightness === 0 ? undefined : overlay.brightness,
    contrast: overlay.contrast === 0 ? undefined : overlay.contrast,
    gamma: overlay.gamma === 1 ? undefined : overlay.gamma,
    saturation: overlay.saturation === 0 ? undefined : overlay.saturation,
    hue: overlay.hueRotateDeg === 0 ? undefined : overlay.hueRotateDeg,
    blur: overlay.blurPx === 0 ? undefined : overlay.blurPx,
    sharpen: overlay.sharpen === 0 ? undefined : overlay.sharpen,
    posterize: overlay.posterizeLevels === 0 ? undefined : overlay.posterizeLevels,
    threshold: overlay.threshold === 128 ? undefined : overlay.threshold,
    edge: overlay.edgeDetect === 'off' ? undefined : overlay.edgeDetect,
    invert: overlay.invert || undefined,
  };
}

function buildHeaderOverlayDither(overlay: ReturnType<typeof useQRStore.getState>['overlay']) {
  return {
    ditherKind: overlay.ditherKind === 'error_diffusion' ? undefined : overlay.ditherKind,
    diffusionKernel:
      overlay.diffusionKernel === 'floyd_steinberg' ? undefined : overlay.diffusionKernel,
    ditherStrength: overlay.ditherStrength === 50 ? undefined : overlay.ditherStrength,
    finderDitherStrength:
      overlay.finderDitherStrength === 65 ? undefined : overlay.finderDitherStrength,
    blendPreservations: overlay.blendPreservations !== true ? undefined : true,
    blendPreservationMode:
      overlay.blendPreservations !== true || overlay.blendPreservationMode === 'overlay'
        ? undefined
        : overlay.blendPreservationMode,
    ditherSerpentine: overlay.ditherSerpentine ? true : undefined,
    orderedMatrix: overlay.orderedMatrix === 'bayer4' ? undefined : overlay.orderedMatrix,
    blueNoiseTileSize: overlay.blueNoiseTileSize === 64 ? undefined : overlay.blueNoiseTileSize,
    blueNoiseSeed: overlay.blueNoiseSeed === 0 ? undefined : overlay.blueNoiseSeed,
    colorDither: overlay.colorDither === 'none' ? undefined : overlay.colorDither,
  };
}

function buildHeaderOverlayModeSpecific(
  overlay: ReturnType<typeof useQRStore.getState>['overlay']
) {
  return {
    subpixelGridSize:
      overlay.mode !== 'subpixel' || overlay.subpixelGridSize === '3x3'
        ? undefined
        : overlay.subpixelGridSize,
    subpixelCenterRule:
      overlay.mode !== 'subpixel' || overlay.subpixelCenterRule === 'strict'
        ? undefined
        : overlay.subpixelCenterRule,
    subpixelNeutralColor:
      overlay.mode !== 'subpixel' || overlay.subpixelNeutralColor === '#808080'
        ? undefined
        : overlay.subpixelNeutralColor,
    subpixelFinderOverride:
      overlay.mode !== 'subpixel' || overlay.subpixelFinderOverride === 'solid'
        ? undefined
        : overlay.subpixelFinderOverride,
    halftoneCell:
      overlay.mode !== 'halftone' || overlay.halftoneCell === 'per_module'
        ? undefined
        : overlay.halftoneCell,
    halftoneDotShape:
      overlay.mode !== 'halftone' || overlay.halftoneDotShape === 'circle'
        ? undefined
        : overlay.halftoneDotShape,
    brightnessCurve:
      overlay.mode !== 'halftone' || overlay.brightnessCurve === 'linear'
        ? undefined
        : overlay.brightnessCurve,
    duotoneColor1:
      overlay.mode !== 'duotone' || overlay.duotoneColors[0] === '#000000'
        ? undefined
        : overlay.duotoneColors[0],
    duotoneColor2:
      overlay.mode !== 'duotone' || overlay.duotoneColors[1] === '#ffffff'
        ? undefined
        : overlay.duotoneColors[1],
  };
}

function buildHeaderOverlay(overlay: ReturnType<typeof useQRStore.getState>['overlay']) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: overlay.intensity === 100 ? undefined : overlay.intensity,
    overlayUrl: overlay.url || undefined,
    fit: overlay.fit === 'cover' ? undefined : overlay.fit,
    rotate: overlay.rotateDeg === 0 ? undefined : overlay.rotateDeg,
    flipX: overlay.flipX ? true : undefined,
    flipY: overlay.flipY ? true : undefined,
    ...buildHeaderOverlayProtection(overlay),
    ...buildHeaderOverlayPreprocessing(overlay),
    ...buildHeaderOverlayDither(overlay),
    ...buildHeaderOverlayModeSpecific(overlay),
  };
}

function buildHeaderAnimationCore(animation: ReturnType<typeof useQRStore.getState>['animation']) {
  return {
    speed: animation.speedMs === 100 ? undefined : animation.speedMs,
    loop: animation.loop === false ? false : undefined,
    reverse: animation.bounce ? true : undefined,
    startFrame: animation.startFrame === 0 ? undefined : animation.startFrame,
    maxFrames: animation.maxFrames === 0 ? undefined : animation.maxFrames,
    frameStep: animation.frameStep === 1 ? undefined : animation.frameStep,
    interpolate: animation.interpolate === 'none' ? undefined : animation.interpolate,
    temporalDither: animation.temporalDither === 'off' ? undefined : animation.temporalDither,
  };
}

function buildHeaderAnimationPattern(
  animation: ReturnType<typeof useQRStore.getState>['animation']
) {
  return {
    pattern: animation.pattern === 'none' ? undefined : animation.pattern,
    target: animation.target === 'result' ? undefined : animation.target,
    waveAxis:
      animation.pattern !== 'wave' || animation.waveAxis === 'y' ? undefined : animation.waveAxis,
    pattern2: animation.pattern2 === 'none' ? undefined : animation.pattern2,
    target2:
      animation.pattern2 === 'none' || animation.target2 === 'result'
        ? undefined
        : animation.target2,
    waveAxis2:
      animation.pattern2 !== 'wave' || animation.waveAxis2 === 'x'
        ? undefined
        : animation.waveAxis2,
    moduleJitter: animation.moduleJitterPx === 0 ? undefined : animation.moduleJitterPx,
    colorCycle: animation.colorCycle ? true : undefined,
    seed: animation.seed === 0 ? undefined : animation.seed,
    animationSeed: animation.seed === 0 ? undefined : animation.seed,
  };
}

function buildHeaderAnimation(animation: ReturnType<typeof useQRStore.getState>['animation']) {
  return {
    ...buildHeaderAnimationCore(animation),
    ...buildHeaderAnimationPattern(animation),
  };
}

function buildHeaderOutputCore(output: ReturnType<typeof useQRStore.getState>['output']) {
  return {
    width: output.widthPx === 400 ? undefined : output.widthPx,
    height: output.heightPx === 400 ? undefined : output.heightPx,
    format: output.format === 'gif' ? undefined : output.format,
    quality: output.quality === 0.9 ? undefined : output.quality,
    filename: output.filename === 'anqr-qrcode' ? undefined : output.filename,
    dpi: output.dpi === 72 ? undefined : output.dpi,
    includeQuietZone: output.includeQuietZone === false ? false : undefined,
    bgOverride: output.bgOverride || undefined,
    formatExtra: output.formatExtra === 'none' ? undefined : output.formatExtra,
  };
}

function buildHeaderOutputFormat(output: ReturnType<typeof useQRStore.getState>['output']) {
  return {
    gifPaletteSize:
      output.format !== 'gif' || output.gifPaletteSize === 256 ? undefined : output.gifPaletteSize,
    gifQuantizer:
      output.format !== 'gif' || output.gifQuantizer === 'median_cut'
        ? undefined
        : output.gifQuantizer,
    gifDither:
      output.format !== 'gif' || output.gifDither === 'floyd' ? undefined : output.gifDither,
    svgTrueVector: output.format === 'svg' && output.svgTrueVector ? true : undefined,
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
  };
}

function buildHeaderOutput(output: ReturnType<typeof useQRStore.getState>['output']) {
  return {
    ...buildHeaderOutputCore(output),
    ...buildHeaderOutputFormat(output),
  };
}

function buildHeaderSafety(safety: ReturnType<typeof useQRStore.getState>['safety']) {
  return {
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
  };
}

function buildHeaderQaAuto(
  qa: ReturnType<typeof useQRStore.getState>['qa'],
  auto: ReturnType<typeof useQRStore.getState>['auto']
) {
  return {
    qaContrastCheck: qa.contrastCheck ? true : undefined,
    qaSimulateBlur: qa.simulateBlurPx === 0 ? undefined : qa.simulateBlurPx,
    qaSimulateNoise: qa.simulateNoise === 0 ? undefined : qa.simulateNoise,
    qaSimulateRotation: qa.simulateRotationDeg === 0 ? undefined : qa.simulateRotationDeg,
    qaShowHeatmap: qa.showHeatmap ? true : undefined,
    autoPickVersion: auto.pickVersion === false ? false : undefined,
    autoPickEcc: auto.pickEcc ? true : undefined,
    autoReduceIntensity: auto.reduceIntensityUntilSafe ? true : undefined,
  };
}

function buildHeaderWatermark(watermark: ReturnType<typeof useQRStore.getState>['watermark']) {
  return {
    watermarkEnabled: watermark.enabled ? true : undefined,
    watermarkKind: !watermark.enabled || watermark.kind === 'text' ? undefined : watermark.kind,
    watermarkText:
      watermark.enabled && watermark.kind === 'text' && watermark.text ? watermark.text : undefined,
    watermarkPosition:
      !watermark.enabled || watermark.position === 'center' ? undefined : watermark.position,
    watermarkOpacity:
      !watermark.enabled || watermark.opacity === 50 ? undefined : watermark.opacity,
    watermarkBlend:
      !watermark.enabled || watermark.blend === 'normal' ? undefined : watermark.blend,
  };
}

function buildHeaderMetadata(metadata: ReturnType<typeof useQRStore.getState>['metadata']) {
  return {
    metaTitle: metadata.title || undefined,
    metaAuthor: metadata.author || undefined,
    metaCopyright: metadata.copyright || undefined,
    metaLicense: metadata.license || undefined,
    metaDescription: metadata.description || undefined,
    metaCreationTime: metadata.creationTime ? true : undefined,
    metaCustomKv: metadata.customKv.length > 0 ? JSON.stringify(metadata.customKv) : undefined,
  };
}

function buildHeaderSafetyQaAuto(
  safety: ReturnType<typeof useQRStore.getState>['safety'],
  qa: ReturnType<typeof useQRStore.getState>['qa'],
  auto: ReturnType<typeof useQRStore.getState>['auto'],
  watermark: ReturnType<typeof useQRStore.getState>['watermark'],
  metadata: ReturnType<typeof useQRStore.getState>['metadata']
) {
  return {
    ...buildHeaderSafety(safety),
    ...buildHeaderQaAuto(qa, auto),
    ...buildHeaderWatermark(watermark),
    ...buildHeaderMetadata(metadata),
  };
}

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setupScrollObservers(el: HTMLElement, onUpdate: () => void): () => void {
  onUpdate();
  el.addEventListener('scroll', onUpdate, { passive: true });
  const resizeObserver = new ResizeObserver(onUpdate);
  resizeObserver.observe(el);
  return () => {
    el.removeEventListener('scroll', onUpdate);
    resizeObserver.disconnect();
  };
}

function HeaderLanguageMenu({
  langMenuOpen,
  isLangMenuClosing,
  langButtonRef,
  currentLang,
  onToggle,
  onClose,
  onChangeLanguage,
  onCloseAnimationEnd,
}: Readonly<{
  langMenuOpen: boolean;
  isLangMenuClosing: boolean;
  langButtonRef: React.RefObject<HTMLDivElement | null>;
  currentLang: (typeof languages)[number];
  onToggle: () => void;
  onClose: () => void;
  onChangeLanguage: (code: string) => void;
  onCloseAnimationEnd: () => void;
}>) {
  const { t, i18n } = useTranslation();

  return (
    <div className="relative" ref={langButtonRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-9 w-9"
        title={`${t('language.select')}: ${currentLang.name}`}
        aria-label={`${currentLang.name} - ${t('language.select', 'Select language')}`}
        aria-expanded={langMenuOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden="true">
          {currentLang.flag}
        </span>
        <span className="sr-only">{currentLang.name}</span>
      </Button>
      {(langMenuOpen || isLangMenuClosing) && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-default bg-transparent border-none"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            aria-label={t('common.close', 'Close language menu')}
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
              ...(isRtlLanguage(i18n.language) ? { left: 8 } : { right: 8 }),
            }}
            onAnimationEnd={() => {
              if (isLangMenuClosing) {
                onCloseAnimationEnd();
              }
            }}
            aria-label={t('language.select', 'Select language')}
          >
            {[...languages]
              .sort((a, b) => {
                const currentCode = i18n.language.split('-')[0];
                const aIsCurrent = a.code === currentCode || a.code === i18n.language;
                const bIsCurrent = b.code === currentCode || b.code === i18n.language;
                if (aIsCurrent && !bIsCurrent) return -1;
                if (bIsCurrent && !aIsCurrent) return 1;
                const aName = t(`languages.${a.code}`);
                const bName = t(`languages.${b.code}`);
                return aName.localeCompare(bName, i18n.language);
              })
              .map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => onChangeLanguage(lang.code)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 ${i18n.language === lang.code || i18n.language.startsWith(lang.code) ? 'bg-muted' : ''}`}
                  title={`${lang.nativeName} - ${t('languages.' + lang.code)}`}
                  aria-label={`${lang.nativeName} (${lang.name})`}
                  aria-current={
                    i18n.language === lang.code || i18n.language.startsWith(lang.code)
                      ? 'true'
                      : undefined
                  }
                >
                  <span>{lang.flag}</span>
                  <span>
                    {lang.nativeName}
                    {(() => {
                      const isCurrentLang =
                        lang.code === i18n.language || i18n.language.startsWith(lang.code);
                      if (isCurrentLang) {
                        return lang.code === 'en-GB' ? '' : ` (${lang.name})`;
                      }
                      return ` (${t('languages.' + lang.code)})`;
                    })()}
                  </span>
                  {(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
                    <Check className="h-4 w-4 ml-auto" aria-hidden="true" />
                  )}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function HeaderMobileNav({
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
      className={`lg:hidden border-t bg-card shadow-lg p-3 overflow-hidden origin-top ${
        isMobileMenuClosing
          ? 'animate-[slide-up_0.2s_ease-in_forwards]'
          : 'animate-[slide-down_0.2s_ease-out_forwards]'
      }`}
      onAnimationEnd={() => {
        if (isMobileMenuClosing) {
          onCloseAnimationEnd();
        }
      }}
      aria-label="Mobile navigation"
    >
      <nav className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-1.5">
          {NAV_LINKS.slice(0, 2).map((link) => {
            const isActive = link.page === resolvedPage;
            const IconComponent = link.icon;
            return (
              <a
                key={link.labelKey}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted hover:bg-primary/10 text-foreground font-medium'
                }`}
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
            const isActive = link.page === resolvedPage;
            const IconComponent = link.icon;
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
                className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-md transition-colors shadow-sm ${
                  isActive
                    ? 'text-foreground bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
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

function HeaderDesktopNav({
  resolvedPage,
  onNavigate,
}: Readonly<{
  resolvedPage: HeaderPage;
  onNavigate?: (page: HeaderPage) => void;
}>) {
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
  );
}

function HeaderGalleryFilter({
  galleryFilter,
  onGalleryFilterChange,
}: Readonly<{
  galleryFilter: GalleryCategory | 'all';
  onGalleryFilterChange?: (filter: GalleryCategory | 'all') => void;
}>) {
  const { t } = useTranslation();

  return (
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
        aria-label={t('accessibility.allCategories', 'Show all categories')}
        aria-pressed={galleryFilter === 'all'}
      >
        <Grid3x3 className="w-4 h-4" aria-hidden="true" />
      </button>
      {gallerySectionManifest.map((section) => (
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
          aria-label={`Filter by ${section.title}`}
          aria-pressed={galleryFilter === section.id}
        >
          <DynamicIcon name={section.icon} className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function HeaderMobileFooter({
  handleShare,
  onExport,
  copied,
  bannerHeight,
}: Readonly<{
  handleShare: () => void;
  onExport?: () => void;
  copied: boolean;
  bannerHeight: number;
}>) {
  const { t } = useTranslation();

  return (
    <div
      className="md:hidden fixed left-0 right-0 z-50 border-t bg-card p-2 shadow-lg"
      style={{
        bottom: Capacitor.isNativePlatform() ? `${bannerHeight + 40}px` : '48px',
        paddingBottom: Capacitor.isNativePlatform() ? '0.25rem' : 'calc(0.5rem + var(--sab, 0px))',
      }}
    >
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 shadow-sm"
          onClick={handleShare}
          title={t('accessibility.copyShareLink')}
          aria-label={
            copied
              ? t('share.copied', 'Link copied')
              : t('accessibility.copyShareLink', 'Copy share link')
          }
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2" aria-hidden="true" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
          )}
          {copied ? t('share.copied') : t('header.share')}
        </Button>
        <Button
          size="sm"
          className="flex-1 shadow-sm"
          onClick={onExport}
          title={t('accessibility.exportQrCode')}
          aria-label={t('accessibility.exportQrCode', 'Export QR code')}
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('header.export')}
        </Button>
      </div>
    </div>
  );
}

function resolveHeaderPage(activePage: HeaderPage | undefined, showGallery: boolean): HeaderPage {
  if (activePage) return activePage;
  return showGallery ? 'gallery' : 'editor';
}

async function changeTierWithAdGate(
  newTier: Tier,
  setTier: (t: Tier) => void,
  checkPremiumAccess: () => boolean,
  activatePremiumAccess: () => void,
  setLoadingAd: (v: boolean) => void
): Promise<void> {
  if (newTier !== 'professional' || !Capacitor.isNativePlatform()) {
    setTier(newTier);
    return;
  }
  if (checkPremiumAccess()) {
    setTier(newTier);
    return;
  }
  setLoadingAd(true);
  try {
    await prepareInterstitial('generation');
    await showInterstitial('generation');
    trackEvent('premium_interstitial_shown', { tier: 'professional' });
    activatePremiumAccess();
    trackEvent('premium_activated', { tier: 'professional', source: 'interstitial' });
    setTier('professional');
    prepareInterstitial('generation');
  } catch (error) {
    log.error('Failed to show interstitial ad', { error });
    activatePremiumAccess();
    trackEvent('premium_activated', { tier: 'professional', source: 'fallback' });
    setTier('professional');
  } finally {
    setLoadingAd(false);
  }
}

export function Header({
  onToggleSidebar,
  onExport,
  sidebarOpen = false,
  showGallery = false,
  activePage,
  galleryFilter = 'all',
  onGalleryFilterChange,
  onNavigate,
}: Readonly<HeaderProps>) {
  const tier = useQRStore((s) => s.tier);
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

  const setTier = useQRStore((s) => s.setTier);
  const getPayloadText = useQRStore((s) => s.getPayloadText);
  const activatePremiumAccess = useQRStore((s) => s.activatePremiumAccess);
  const checkPremiumAccess = useQRStore((s) => s.checkPremiumAccess);
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isLangMenuClosing, setIsLangMenuClosing] = useState(false);
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const bannerHeight = useBannerHeight();
  const langButtonRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const updateScrollIndicators = useCallback(() => {
    const el = headerScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const scrollHeader = useCallback((direction: 'left' | 'right') => {
    const el = headerScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -150 : 150,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const el = headerScrollRef.current;
    if (!el) return;
    return setupScrollObservers(el, updateScrollIndicators);
  }, [updateScrollIndicators]);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = async (code: string) => {
    await loadLocale(code);
    i18n.changeLanguage(code);
    trackEvent('language_switch', { language: code });
    closeLangMenu();
  };

  const closeLangMenu = () => {
    if (langMenuOpen) {
      setIsLangMenuClosing(true);
      setLangMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setIsMobileMenuClosing(true);
      setMobileMenuOpen(false);
    }
  };

  const resolvedPage: HeaderPage = resolveHeaderPage(activePage, showGallery);
  const isEditor = resolvedPage === 'editor';
  const isGallery = resolvedPage === 'gallery';

  useEffect(() => {
    const isDark = getInitialDarkMode();
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      prepareInterstitial('generation');
    }
  }, []);

  const handleTierChange = (newTier: Tier) => {
    void changeTierWithAdGate(
      newTier,
      setTier,
      checkPremiumAccess,
      activatePremiumAccess,
      setLoadingAd
    );
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleShare = async () => {
    const shareConfig = buildHeaderShareConfig(
      getPayloadText,
      i18n.language,
      qr,
      render,
      overlay,
      animation,
      output,
      safety,
      qa,
      auto,
      watermark,
      metadata
    );
    const url = getShareableUrl(shareConfig);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      trackEvent('share', { method: 'copy_link' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header
        className={`border-b bg-card shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${sidebarOpen && isEditor ? 'lg:ms-96' : ''}`}
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
              aria-label={t('accessibility.scrollLeft', 'Scroll left')}
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
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
              aria-label={t('accessibility.scrollRight', 'Scroll right')}
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </button>
          )}

          <div
            ref={headerScrollRef}
            className="px-2 sm:px-4 flex items-center justify-between w-full h-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex items-center gap-1 sm:gap-3 lg:gap-6 shrink-0">
              {/* Settings toggle - only in editor mode, placeholder space on other pages */}
              {isEditor ? (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="flex items-center justify-center w-8 h-8 hover:opacity-80 cursor-pointer"
                  title={t('accessibility.toggleSettings')}
                  aria-label={t('accessibility.toggleSettings', 'Toggle settings panel')}
                  aria-expanded={sidebarOpen}
                >
                  <PanelLeft className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
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
                aria-label={`${t('app.name', 'ANQR')} - ${t('nav.generator', 'Go to Generator')}`}
              >
                <span className="text-xl font-bold leading-6" aria-hidden="true">
                  ANQR
                </span>
              </button>

              {/* Desktop Nav */}
              <HeaderDesktopNav resolvedPage={resolvedPage} onNavigate={onNavigate} />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
              {/* Gallery Filter - icon buttons right-justified next to dark mode toggle */}
              {isGallery && (
                <HeaderGalleryFilter
                  galleryFilter={galleryFilter}
                  onGalleryFilterChange={onGalleryFilterChange}
                />
              )}

              {/* Tier Toggle */}
              {isEditor && (
                <>
                  <div className="hidden sm:block">
                    <Tabs
                      value={tier}
                      onValueChange={(v) => handleTierChange(v as Tier)}
                      data-testid={DynamicTestId.resolve('tier-tabs', 'tier-tabs')}
                    >
                      <TabsList className="shadow-sm">
                        <TabsTrigger
                          value="basic"
                          className="text-xs px-3"
                          title={t('tiers.basic')}
                          disabled={loadingAd}
                          data-testid={DynamicTestId.resolve('tier-tab-basic', 'tier-tab-basic')}
                        >
                          {t('tiers.basic')}
                        </TabsTrigger>
                        <TabsTrigger
                          value="advanced"
                          className="text-xs px-3"
                          title={t('tiers.advanced')}
                          disabled={loadingAd}
                          data-testid={DynamicTestId.resolve(
                            'tier-tab-advanced',
                            'tier-tab-advanced'
                          )}
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
                          data-testid={DynamicTestId.resolve(
                            'tier-tab-professional',
                            'tier-tab-professional'
                          )}
                          aria-label={
                            Capacitor.isNativePlatform() && !checkPremiumAccess()
                              ? t('tiers.watchAdForPro', 'Watch ad for Professional')
                              : t('tiers.professional', 'Professional')
                          }
                        >
                          {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                            <Play className="w-3 h-3" aria-hidden="true" />
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
                      <SelectTrigger
                        className="w-[72px] h-9 text-xs"
                        data-testid={DynamicTestId.resolve('tier-select', 'tier-select')}
                        aria-label={t('accessibility.selectTier', 'Select feature tier')}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="basic"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-basic',
                            'tier-option-basic'
                          )}
                        >
                          {t('tiers.basic')}
                        </SelectItem>
                        <SelectItem
                          value="advanced"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-advanced',
                            'tier-option-advanced'
                          )}
                        >
                          {t('tiers.advanced')}
                        </SelectItem>
                        <SelectItem
                          value="professional"
                          data-testid={DynamicTestId.resolve(
                            'tier-option-professional',
                            'tier-option-professional'
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {Capacitor.isNativePlatform() && !checkPremiumAccess() && (
                              <Play className="w-3 h-3" aria-hidden="true" />
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
                    aria-label={
                      copied
                        ? t('share.copied', 'Link copied')
                        : t('accessibility.copyShareLink', 'Copy share link')
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    ) : (
                      <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    )}
                    {copied ? t('share.copied') : t('header.share')}
                  </Button>
                  <Button
                    size="sm"
                    className="shadow-sm"
                    onClick={onExport}
                    title={t('accessibility.exportQrCode')}
                    aria-label={t('accessibility.exportQrCode', 'Export QR code')}
                    data-testid={DynamicTestId.resolve('export-button', 'export-button')}
                  >
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    {t('header.export')}
                  </Button>
                </div>
              )}

              {/* Language Selector */}
              <HeaderLanguageMenu
                langMenuOpen={langMenuOpen}
                isLangMenuClosing={isLangMenuClosing}
                langButtonRef={langButtonRef}
                currentLang={currentLang}
                onToggle={() => (langMenuOpen ? closeLangMenu() : setLangMenuOpen(true))}
                onClose={closeLangMenu}
                onChangeLanguage={changeLanguage}
                onCloseAnimationEnd={() => setIsLangMenuClosing(false)}
              />

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9"
                title={darkMode ? t('header.lightMode') : t('header.darkMode')}
                aria-label={
                  darkMode
                    ? t('header.lightMode', 'Switch to light mode')
                    : t('header.darkMode', 'Switch to dark mode')
                }
                aria-pressed={darkMode}
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>

              {/* Mobile Menu Button - shows when desktop nav is hidden (below lg breakpoint) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => (mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true))}
                title={t('accessibility.openNavMenu')}
                aria-label={t('accessibility.openNavMenu', 'Open navigation menu')}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - shows when desktop nav is hidden (below lg breakpoint) */}
        <HeaderMobileNav
          mobileMenuOpen={mobileMenuOpen}
          isMobileMenuClosing={isMobileMenuClosing}
          resolvedPage={resolvedPage}
          onNavigate={onNavigate}
          onClose={closeMobileMenu}
          onCloseAnimationEnd={() => setIsMobileMenuClosing(false)}
        />
      </header>

      {/* Mobile Footer Bar */}
      {isEditor && (
        <HeaderMobileFooter
          handleShare={handleShare}
          onExport={onExport}
          copied={copied}
          bannerHeight={bannerHeight}
        />
      )}
    </>
  );
}
