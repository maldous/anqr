import { Check, Code, Copy, Link, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DynamicTestId } from '@/components/ui/dynamic-testid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HighlightedLabel } from '@/lib/search-context';
import { trackEvent } from '@/lib/zaraz';
import { copyToClipboard } from '@/modules/browser-clipboard';
import {
  generateImageEmbed,
  generateMarkdownEmbed,
  getShareableUrl,
  getSocialShareUrls,
} from '@/modules/share-links';
import { useQRStore } from '@/store/qr-store';

type StoreState = ReturnType<typeof useQRStore.getState>;

function buildShareQRSettings(qr: StoreState['qr'], render: StoreState['render']) {
  return {
    ec: qr.ecc,
    version: qr.version === 0 ? undefined : qr.version,
    modulePx: render.modulePx === 20 ? undefined : render.modulePx,
    margin: qr.quietZoneModules === 4 ? undefined : qr.quietZoneModules,
    encodingMode: qr.encodingMode === 'auto' ? undefined : qr.encodingMode,
    borderModulesExtra: qr.borderModulesExtra === 0 ? undefined : qr.borderModulesExtra,
    quietZoneMinEnforce: qr.quietZoneMinEnforce === false ? false : undefined,
  };
}

function buildShareColors(render: StoreState['render']) {
  return {
    fg: render.fgColor === '#000000' ? undefined : render.fgColor,
    bg: render.bgColor === '#ffffff' ? undefined : render.bgColor,
    transparent: render.bgTransparent || undefined,
  };
}

function buildShareEyeAndFrameStyles(render: StoreState['render']) {
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
      render.contrastGuard && render.minContrastRatio !== 4.5 ? render.minContrastRatio : undefined,
  };
}

function buildShareStyles(render: StoreState['render']) {
  return {
    style: render.moduleStyle === 'square' ? undefined : render.moduleStyle,
    finder: render.finderStyle === 'square' ? undefined : render.finderStyle,
    alignmentStyle: render.alignmentStyle === 'match_finder' ? undefined : render.alignmentStyle,
    timingStyle: render.timingStyle === 'match_module' ? undefined : render.timingStyle,
    moduleGap: render.moduleGapPercent === 0 ? undefined : render.moduleGapPercent,
    gapMode: render.gapMode === 'none' ? undefined : render.gapMode,
    cornerRadius: render.cornerRadius === 0 ? undefined : render.cornerRadius,
    gradientType: render.gradient.type === 'none' ? undefined : render.gradient.type,
    ...buildShareEyeAndFrameStyles(render),
  };
}

function buildShareOverlayPreprocessing(overlay: StoreState['overlay']) {
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

function buildShareOverlayDither(overlay: StoreState['overlay']) {
  return {
    ditherKind: overlay.ditherKind === 'error_diffusion' ? undefined : overlay.ditherKind,
    diffusionKernel:
      overlay.diffusionKernel === 'floyd_steinberg' ? undefined : overlay.diffusionKernel,
    ditherStrength: overlay.ditherStrength === 50 ? undefined : overlay.ditherStrength,
    finderDitherStrength:
      overlay.finderDitherStrength === 65 ? undefined : overlay.finderDitherStrength,
    blendPreservations: overlay.blendPreservations ? true : undefined,
    blendPreservationMode:
      overlay.blendPreservations && overlay.blendPreservationMode !== 'overlay'
        ? overlay.blendPreservationMode
        : undefined,
    ditherSerpentine: overlay.ditherSerpentine ? true : undefined,
    orderedMatrix: overlay.orderedMatrix === 'bayer4' ? undefined : overlay.orderedMatrix,
    blueNoiseTileSize: overlay.blueNoiseTileSize === 64 ? undefined : overlay.blueNoiseTileSize,
    blueNoiseSeed: overlay.blueNoiseSeed === 0 ? undefined : overlay.blueNoiseSeed,
    colorDither: overlay.colorDither === 'none' ? undefined : overlay.colorDither,
  };
}

function buildShareOverlaySubpixelParams(overlay: StoreState['overlay']) {
  if (overlay.mode !== 'subpixel') return {};
  return {
    subpixelGridSize: overlay.subpixelGridSize !== '3x3' ? overlay.subpixelGridSize : undefined,
    subpixelCenterRule:
      overlay.subpixelCenterRule !== 'strict' ? overlay.subpixelCenterRule : undefined,
    subpixelNeutralColor:
      overlay.subpixelNeutralColor !== '#808080' ? overlay.subpixelNeutralColor : undefined,
    subpixelFinderOverride:
      overlay.subpixelFinderOverride !== 'solid' ? overlay.subpixelFinderOverride : undefined,
  };
}

function buildShareOverlayModeSpecific(overlay: StoreState['overlay']) {
  return {
    ...buildShareOverlaySubpixelParams(overlay),
    halftoneCell:
      overlay.mode === 'halftone' && overlay.halftoneCell !== 'per_module'
        ? overlay.halftoneCell
        : undefined,
    halftoneDotShape:
      overlay.mode === 'halftone' && overlay.halftoneDotShape !== 'circle'
        ? overlay.halftoneDotShape
        : undefined,
    brightnessCurve:
      overlay.mode === 'halftone' && overlay.brightnessCurve !== 'linear'
        ? overlay.brightnessCurve
        : undefined,
    duotoneColor1:
      overlay.mode === 'duotone' && overlay.duotoneColors[0] !== '#000000'
        ? overlay.duotoneColors[0]
        : undefined,
    duotoneColor2:
      overlay.mode === 'duotone' && overlay.duotoneColors[1] !== '#ffffff'
        ? overlay.duotoneColors[1]
        : undefined,
  };
}

function buildShareOverlayProtection(overlay: StoreState['overlay']) {
  return {
    preserveFinders: overlay.preserveFinders ? undefined : false,
    preserveTiming: overlay.preserveTiming ? true : undefined,
    preserveAlignment: overlay.preserveAlignment ? true : undefined,
    protectFormatInfo: overlay.protectFormatInfo ? true : undefined,
    protectVersionInfo: overlay.protectVersionInfo ? true : undefined,
    eccAwareEnabled: overlay.eccAwareEnabled ? true : undefined,
    eccAwareRiskBudget:
      overlay.eccAwareEnabled && overlay.eccAwareRiskBudget !== 50
        ? overlay.eccAwareRiskBudget
        : undefined,
    eccAwareWeightMap:
      overlay.eccAwareEnabled && overlay.eccAwareWeightMap !== 'distance_to_finders'
        ? overlay.eccAwareWeightMap
        : undefined,
  };
}

function buildShareOverlay(overlay: StoreState['overlay']) {
  if (!overlay.enabled) return {};
  return {
    mode: overlay.mode,
    intensity: overlay.intensity === 100 ? undefined : overlay.intensity,
    overlayUrl: overlay.url || undefined,
    fit: overlay.fit === 'cover' ? undefined : overlay.fit,
    rotate: overlay.rotateDeg === 0 ? undefined : overlay.rotateDeg,
    flipX: overlay.flipX ? true : undefined,
    flipY: overlay.flipY ? true : undefined,
    ...buildShareOverlayProtection(overlay),
    ...buildShareOverlayPreprocessing(overlay),
    ...buildShareOverlayDither(overlay),
    ...buildShareOverlayModeSpecific(overlay),
  };
}

function buildShareAnimationPatterns(animation: StoreState['animation']) {
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
  };
}

function buildShareAnimation(animation: StoreState['animation']) {
  return {
    speed: animation.speedMs === 100 ? undefined : animation.speedMs,
    loop: animation.loop === false ? false : undefined,
    reverse: animation.bounce ? true : undefined,
    startFrame: animation.startFrame === 0 ? undefined : animation.startFrame,
    maxFrames: animation.maxFrames === 0 ? undefined : animation.maxFrames,
    frameStep: animation.frameStep === 1 ? undefined : animation.frameStep,
    interpolate: animation.interpolate === 'none' ? undefined : animation.interpolate,
    temporalDither: animation.temporalDither === 'off' ? undefined : animation.temporalDither,
    ...buildShareAnimationPatterns(animation),
    moduleJitter: animation.moduleJitterPx === 0 ? undefined : animation.moduleJitterPx,
    colorCycle: animation.colorCycle ? true : undefined,
    seed: animation.seed === 0 ? undefined : animation.seed,
    animationSeed: animation.seed === 0 ? undefined : animation.seed,
  };
}

function buildShareOutput(output: StoreState['output']) {
  return {
    width: output.widthPx === 400 ? undefined : output.widthPx,
    height: output.heightPx === 400 ? undefined : output.heightPx,
    format: output.format === 'gif' ? undefined : output.format,
    quality: output.quality === 0.9 ? undefined : output.quality,
    filename: output.filename === 'anqr-qrcode' ? undefined : output.filename,
    gifPaletteSize:
      output.format === 'gif' && output.gifPaletteSize !== 256 ? output.gifPaletteSize : undefined,
    gifQuantizer:
      output.format === 'gif' && output.gifQuantizer !== 'median_cut'
        ? output.gifQuantizer
        : undefined,
    gifDither:
      output.format === 'gif' && output.gifDither !== 'floyd' ? output.gifDither : undefined,
    svgTrueVector: output.format === 'svg' && output.svgTrueVector ? true : undefined,
    dpi: output.dpi === 72 ? undefined : output.dpi,
    includeQuietZone: output.includeQuietZone === false ? false : undefined,
    bgOverride: output.bgOverride ? output.bgOverride : undefined,
    gifTransparentColor:
      output.format === 'gif' && output.gifTransparentColor
        ? output.gifTransparentColor
        : undefined,
    svgShapePrecision:
      output.format === 'svg' && output.svgShapePrecision !== 'pixel'
        ? output.svgShapePrecision
        : undefined,
    svgEmbedRasterOverlay:
      output.format === 'svg' && output.svgEmbedRasterOverlay === false ? false : undefined,
    formatExtra: output.formatExtra === 'none' ? undefined : output.formatExtra,
  };
}

function buildShareSafetyQaAuto(
  safety: StoreState['safety'],
  qa: StoreState['qa'],
  auto: StoreState['auto'],
  watermark: StoreState['watermark'],
  metadata: StoreState['metadata']
) {
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
    qaContrastCheck: qa.contrastCheck ? true : undefined,
    qaSimulateBlur: qa.simulateBlurPx === 0 ? undefined : qa.simulateBlurPx,
    qaSimulateNoise: qa.simulateNoise === 0 ? undefined : qa.simulateNoise,
    qaSimulateRotation: qa.simulateRotationDeg === 0 ? undefined : qa.simulateRotationDeg,
    qaShowHeatmap: qa.showHeatmap ? true : undefined,
    autoPickVersion: auto.pickVersion === false ? false : undefined,
    autoPickEcc: auto.pickEcc ? true : undefined,
    autoReduceIntensity: auto.reduceIntensityUntilSafe ? true : undefined,
    watermarkEnabled: watermark.enabled ? true : undefined,
    watermarkKind: watermark.enabled && watermark.kind !== 'text' ? watermark.kind : undefined,
    watermarkText:
      watermark.enabled && watermark.kind === 'text' && watermark.text ? watermark.text : undefined,
    watermarkPosition:
      watermark.enabled && watermark.position !== 'center' ? watermark.position : undefined,
    watermarkOpacity: watermark.enabled && watermark.opacity !== 50 ? watermark.opacity : undefined,
    watermarkBlend: watermark.enabled && watermark.blend !== 'normal' ? watermark.blend : undefined,
    metaTitle: metadata.title || undefined,
    metaAuthor: metadata.author || undefined,
    metaCopyright: metadata.copyright || undefined,
    metaLicense: metadata.license || undefined,
    metaDescription: metadata.description || undefined,
    metaCreationTime: metadata.creationTime ? true : undefined,
    metaCustomKv: metadata.customKv.length > 0 ? JSON.stringify(metadata.customKv) : undefined,
  };
}

export function ShareSection() {
  const {
    share,
    setShare,
    getPayloadText,
    qr,
    render,
    overlay,
    animation,
    output,
    safety,
    qa,
    auto,
    watermark,
    metadata,
  } = useQRStore();
  const { t, i18n } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Build shareable URL from current config
  const shareableUrl = useMemo(() => {
    const config = {
      data: getPayloadText(),
      lang: i18n.language,
      ...buildShareQRSettings(qr, render),
      ...buildShareColors(render),
      ...buildShareStyles(render),
      ...buildShareOverlay(overlay),
      ...buildShareAnimation(animation),
      ...buildShareOutput(output),
      ...buildShareSafetyQaAuto(safety, qa, auto, watermark, metadata),
    };
    return getShareableUrl(config);
  }, [
    getPayloadText,
    qr,
    render,
    overlay,
    animation,
    output,
    safety,
    qa,
    auto,
    watermark,
    metadata,
    i18n.language,
  ]);

  const embedCode = useMemo(() => {
    return generateImageEmbed(shareableUrl, 'QR Code', { width: 200, height: 200 });
  }, [shareableUrl]);

  const markdownEmbed = useMemo(() => {
    return generateMarkdownEmbed(shareableUrl, 'QR Code');
  }, [shareableUrl]);

  const socialUrls = useMemo(() => {
    return getSocialShareUrls(shareableUrl, 'Check out this QR code!');
  }, [shareableUrl]);

  // Count the number of URL parameters being shared
  const _paramCount = useMemo(() => {
    try {
      const url = new URL(shareableUrl);
      return url.searchParams.size;
    } catch {
      return 0;
    }
  }, [shareableUrl]);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      trackEvent('share', { method: field });
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Direct Link */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.directLink')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.directLinkDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve(
            'share-direct-link-switch',
            'share-direct-link-switch'
          )}
          checked={share.directLink}
          onCheckedChange={(checked) => setShare({ directLink: checked })}
        />
      </div>

      {share.directLink && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve(
                'share-direct-link-input',
                'share-direct-link-input'
              )}
              readOnly
              value={shareableUrl}
              className="flex-1 text-xs"
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-link-button',
                'share-copy-link-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(shareableUrl, 'link')}
            >
              {copiedField === 'link' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Embed HTML */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.embedHtml')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.embedHtmlDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve('share-embed-html-switch', 'share-embed-html-switch')}
          checked={share.embedHtml}
          onCheckedChange={(checked) => setShare({ embedHtml: checked })}
        />
      </div>

      {share.embedHtml && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve(
                'share-embed-code-input',
                'share-embed-code-input'
              )}
              readOnly
              value={embedCode}
              className="flex-1 text-xs font-mono"
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-embed-button',
                'share-copy-embed-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(embedCode, 'embed')}
            >
              {copiedField === 'embed' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Code className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              data-testid={DynamicTestId.resolve('share-markdown-input', 'share-markdown-input')}
              readOnly
              value={markdownEmbed}
              className="flex-1 text-xs font-mono"
              placeholder={t('share.markdown')}
            />
            <Button
              data-testid={DynamicTestId.resolve(
                'share-copy-markdown-button',
                'share-copy-markdown-button'
              )}
              variant="outline"
              size="icon"
              onClick={() => handleCopy(markdownEmbed, 'markdown')}
            >
              {copiedField === 'markdown' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Encode More Params */}
      <div className="flex items-center justify-between">
        <div>
          <Label>
            <HighlightedLabel>{t('share.encodeAllParams')}</HighlightedLabel>
          </Label>
          <p className="text-xs text-muted-foreground">{t('share.encodeAllParamsDesc')}</p>
        </div>
        <Switch
          data-testid={DynamicTestId.resolve(
            'share-encode-more-params-switch',
            'share-encode-more-params-switch'
          )}
          checked={share.encodeMoreParams}
          onCheckedChange={(checked) => setShare({ encodeMoreParams: checked })}
        />
      </div>

      {/* Quick Share Buttons */}
      <div className="pt-2 border-t space-y-2">
        <Label className="text-muted-foreground">
          <HighlightedLabel>{t('share.quickShare')}</HighlightedLabel>
        </Label>
        <div className="flex gap-2">
          <Button
            data-testid={DynamicTestId.resolve(
              'share-quick-copy-button',
              'share-quick-copy-button'
            )}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleCopy(shareableUrl, 'quick')}
          >
            {copiedField === 'quick' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Link className="h-4 w-4 mr-2" />
            )}
            {copiedField === 'quick' ? t('share.copied') : t('share.copyLink')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            data-testid={DynamicTestId.resolve('share-twitter-button', 'share-twitter-button')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={socialUrls.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share', { method: 'twitter' })}
            >
              {t('share.twitter')}
            </a>
          </Button>
          <Button
            asChild
            data-testid={DynamicTestId.resolve('share-whatsapp-button', 'share-whatsapp-button')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <a
              href={socialUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('share', { method: 'whatsapp' })}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('share.whatsapp')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
