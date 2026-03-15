import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type AnimationFrame,
  decimateCompositorFrames,
  type GifCompositor,
  resolveAnimationFrameDelay,
} from '@/modules/animation';
import { isTemporalDitherActive, type TemporalDitherMode } from '@/modules/dither-algorithms';
import { getOverlayDitherKind, STORE_DEFAULT_DITHER } from '@/modules/overlay';
import { prepareInterstitial, showInterstitial } from '@/modules/platform';
import { type ValidationResult, terminateValidationWorker } from '@/modules/qr-analyzer';
import { INTRINSICALLY_SCALED_OVERLAY_MODES, type QRGeneratorConfig } from '@/modules/qr-generator';
import { useQRStore } from '@/store/qr-store';
import type { UseQRGeneratorResult } from './useQRGenerator.types';
import { applyCropTransform } from './apply-crop-transform';
import { applyFitTransform } from './apply-fit-transform';
import { applyPatternStackToCanvas } from './apply-pattern-stack-to-canvas';
import { applyRotateFlipTransform } from './apply-rotate-flip-transform';
import { buildExportConfig } from './build-export-config';
import { buildPatternEffectLists } from './build-pattern-effect-lists';
import { buildPngMetadata } from './build-png-metadata';
import { cleanupGenerateState } from './cleanup-generate-state';
import { cloneCanvasSimple } from './clone-canvas-simple';
import { completeAnimationGeneration } from './complete-animation-generation';
import { computeBaseAnimationFramesToProcess } from './compute-base-animation-frames-to-process';
import { computePatternDrivenJitterValue } from './compute-pattern-driven-jitter-value';
import { computeSafetyAdjustments } from './compute-safety-adjustments';
import { CONFIG_DEBOUNCE_MS } from './config-debounce-ms';
import { CONFIG_SETTLE_DEBOUNCE_MS } from './config-settle-debounce-ms';
import { createArtworkFrameState } from './create-artwork-frame-state';
import { createScaledExportCanvas } from './create-scaled-export-canvas';
import { createScratchCanvasPool } from './create-scratch-canvas-pool';
import { dispatchRenderCompleteEvent } from './dispatch-render-complete-event';
import { downloadAnimatedGifFormat } from './download-animated-gif-format';
import { downloadSvgFormat } from './download-svg-format';
import { drawToDisplayCanvas } from './draw-to-display-canvas';
import { ENABLE_QART_PERF_OVERLAY } from './enable-qart-perf-overlay';
import { executeFrameGenerationLoop } from './execute-frame-generation-loop';
import { finalizeAnimationFrames } from './finalize-animation-frames';
import { finalizeGeneratedCanvas } from './finalize-generated-canvas';
import { formatGenerationErrorMessage } from './format-generation-error-message';
import { generateArtworkFrameStandalone } from './generate-artwork-frame-standalone';
import type { GenerationProgressState } from './generation-progress-state';
import { handleEmptyContent } from './handle-empty-content';
import { handleGeneratePreChecks } from './handle-generate-pre-checks';
import { loadAnimatedWebPOverlayFile } from './load-animated-web-p-overlay-file';
import { loadExporterModule } from './load-exporter-module';
import { loadGifOverlayFile } from './load-gif-overlay-file';
import { loadQArtModule } from './load-q-art-module';
import { loadStaticOverlayFile } from './load-static-overlay-file';
import { loadWatermarkForAnimation } from './load-watermark-for-animation';
import { log } from './log';
import type { QArtPerfSnapshot } from './q-art-perf-snapshot';
import { QART_PERF_OVERLAY_ELEMENT_ID } from './qart-perf-overlay-element-id';
import { runGeneratorWithSlowStatus } from './run-generator-with-slow-status';
import { runQArtGeneration } from './run-q-art-generation';
import { runStandardGeneration } from './run-standard-generation';
import { scheduleTrackEvent } from './schedule-track-event';
import { setupValidationRunner } from './setup-validation-runner';
import { terminateQArtWorkerIfLoaded } from './terminate-q-art-worker-if-loaded';
import { updateCompositorToFrame } from './update-compositor-to-frame';
import { useDebounce } from './use-debounce';
import { YieldController } from './yield-controller';
import { yieldToMainThread } from './yield-to-main-thread';
import { resolveOverlayPreservationOptions } from './resolve-overlay-preservation-options';

export function useQRGenerator(): UseQRGeneratorResult {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | OffscreenCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRendering, setIsRendering] = useState(false); // Active rendering state
  const [pendingVisible, setPendingVisible] = useState(false); // Delayed pending state to avoid immediate blur while typing
  const [error, setError] = useState<string | null>(null);
  const [overlayCanvas, setOverlayCanvas] = useState<HTMLCanvasElement | OffscreenCanvas | null>(
    null
  );

  // Animation state
  const [gifFrames, setGifFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationDirection = useRef<1 | -1>(1);
  const lastFrameTime = useRef(0);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);

  // Track content that caused overflow to prevent infinite retry loop
  // Using a ref because state updates are async and may not prevent immediate re-calls
  const lastOverflowContentRef = useRef<string | null>(null);

  // Additional flag to block generate() - using ref for synchronous checking
  // This is more reliable than state for preventing loops
  const isOverflowBlockedRef = useRef(false);
  // Monotonic generation id to prevent stale async renders from overwriting latest preview.
  const generationRequestIdRef = useRef(0);
  const activeQArtRequestAbortRef = useRef<AbortController | null>(null);
  const activeAnimationRequestAbortRef = useRef<AbortController | null>(null);
  const autoGenerateSuppressedRef = useRef(false);
  const currentPrimaryDebouncedConfigRef = useRef<object | null>(null);
  const cancelledPrimaryDebouncedConfigRef = useRef<object | null>(null);
  const currentOverlaySourceKeyRef = useRef<string | null>(null);
  const cancelledOverlaySourceKeyRef = useRef<string | null>(null);
  const qartPerfOverlayRef = useRef<HTMLDivElement | null>(null);

  // State to block generate() calls when we're in an overflow error state
  // This prevents the blur loop by stopping the useEffect from calling generate()
  const [hasOverflowError, setHasOverflowError] = useState(false);

  // GIF Compositor for optimal patch-only decoding (no per-frame canvas allocation)
  const [gifCompositor, setGifCompositor] = useState<GifCompositor | null>(null);
  const hasMultipleSourceFramesRef = useRef(false);

  // Store raw overlay canvas before preprocessing
  const [rawOverlayCanvas, setRawOverlayCanvas] = useState<
    HTMLCanvasElement | OffscreenCanvas | null
  >(null);

  // Track when we're loading/parsing an overlay file (prevents busy overlay flickering)
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgressState | null>(
    null
  );
  const [qartPerfSnapshot, setQArtPerfSnapshot] = useState<QArtPerfSnapshot | null>(null); // NOSONAR: setter name matches domain acronym QArt
  const qartPreviewBitmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // QR matrix for vector SVG export
  const [qrMatrix, setQrMatrix] = useState<boolean[][] | null>(null);
  const qrPackedMatrixRef = useRef<{ packed: Uint8Array; moduleCount: number } | null>(null);

  // Store generated frames for GIF export/playback outside React state to avoid
  // retaining large canvas arrays in the render tree.
  const animationFramesRef = useRef<(HTMLCanvasElement | OffscreenCanvas)[]>([]);
  const [animationFrameCount, setAnimationFrameCount] = useState(0);
  const [animationFramesRevision, setAnimationFramesRevision] = useState(0);
  const [isAnimationCacheReady, setIsAnimationCacheReady] = useState(false);

  const replaceAnimationFrames = useCallback((frames: (HTMLCanvasElement | OffscreenCanvas)[]) => {
    animationFramesRef.current = frames;
    setAnimationFrameCount(frames.length);
    setAnimationFramesRevision((rev) => rev + 1);
  }, []);

  const clearAnimationFrames = useCallback(() => {
    animationFramesRef.current = [];
    setAnimationFrameCount(0);
    setAnimationFramesRevision((rev) => rev + 1);
  }, []);

  const updateGenerationProgress = useCallback((stage: string, percent: number) => {
    const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));
    setGenerationProgress((prev) => {
      if (prev?.stage === stage && prev?.percent === normalizedPercent) {
        return prev;
      }
      return { stage, percent: normalizedPercent };
    });
  }, []);

  const clearGenerationProgress = useCallback(() => {
    setGenerationProgress(null);
  }, []);

  const translateQArtStage = useCallback(
    (stage: string): string => {
      switch (stage) {
        case 'Encoding base data':
          return t('preview.busy.qrArt.encodingBaseData', 'Encoding the base data...');
        case 'Analyzing semantic layout':
          return t('preview.busy.qrArt.analyzingLayout', 'Analyzing the layout...');
        case 'Building RS basis':
          return t(
            'preview.busy.qrArt.buildingErrorCorrectionFoundation',
            'Building the error correction foundation...'
          );
        case 'Mapping bits to pixels':
          return t('preview.busy.qrArt.mappingBitsToPixels', 'Mapping bits to pixels...');
        case 'Processing target image':
          return t('preview.busy.qrArt.processingImage', 'Processing your image...');
        case 'Ranking pixels by importance':
          return t(
            'preview.busy.qrArt.rankingPixelsByImportance',
            'Ranking pixels by importance...'
          );
        case 'Performing Gauss-Jordan elimination':
          return t('preview.busy.qrArt.solvingMatrix', 'Solving the matrix...');
        case 'Selecting basis vectors':
          return t(
            'preview.busy.qrArt.selectingBestBasisVectors',
            'Selecting the best basis vectors...'
          );
        case 'Counting predicted matches':
          return t('preview.busy.qrArt.countingPredictedMatches', 'Counting predicted matches...');
        case 'Modifying data bytes':
          return t('preview.busy.qrArt.adjustingDataBytes', 'Adjusting data bytes...');
        case 'Re-encoding QR code':
          return t('preview.busy.qrArt.reEncodingQrCode', 'Re-encoding the QR code...');
        case 'Validating result':
          return t('preview.busy.qrArt.validatingResult', 'Validating the result...');
        case 'Complete':
          return t('preview.busy.qrArt.complete', 'Complete...');
        default:
          return stage;
      }
    },
    [t]
  );

  const cancelGeneration = useCallback(() => {
    generationRequestIdRef.current += 1;
    autoGenerateSuppressedRef.current = true;
    cancelledPrimaryDebouncedConfigRef.current = currentPrimaryDebouncedConfigRef.current;
    cancelledOverlaySourceKeyRef.current = currentOverlaySourceKeyRef.current;
    activeQArtRequestAbortRef.current?.abort();
    activeQArtRequestAbortRef.current = null;
    activeAnimationRequestAbortRef.current?.abort();
    activeAnimationRequestAbortRef.current = null;
    setIsLoading(false);
    setIsRendering(false);
    setIsLoadingOverlay(false);
    setIsAnimationCacheReady(true);
    setPendingVisible(false);
    setIsValidating(false);
    clearGenerationProgress();
  }, [clearGenerationProgress]);

  useEffect(() => {
    return () => {
      activeQArtRequestAbortRef.current?.abort();
      activeQArtRequestAbortRef.current = null;
      activeAnimationRequestAbortRef.current?.abort();
      activeAnimationRequestAbortRef.current = null;
      terminateValidationWorker();
      terminateQArtWorkerIfLoaded();
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_QART_PERF_OVERLAY || typeof document === 'undefined') return;

    let overlayEl = document.getElementById(QART_PERF_OVERLAY_ELEMENT_ID) as HTMLDivElement | null;
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.id = QART_PERF_OVERLAY_ELEMENT_ID;
      overlayEl.style.position = 'fixed';
      overlayEl.style.right = '12px';
      overlayEl.style.bottom = '12px';
      overlayEl.style.zIndex = '2147483646';
      overlayEl.style.maxWidth = '72vw';
      overlayEl.style.padding = '6px 10px';
      overlayEl.style.borderRadius = '8px';
      overlayEl.style.background = 'rgba(0, 0, 0, 0.82)';
      overlayEl.style.color = '#7CFFBE';
      overlayEl.style.font = '11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.style.whiteSpace = 'pre';
      overlayEl.textContent = 'QArt perf: waiting...';
      document.body.appendChild(overlayEl);
    }

    qartPerfOverlayRef.current = overlayEl;

    return () => {
      overlayEl?.remove();
      qartPerfOverlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_QART_PERF_OVERLAY) return;
    const overlayEl = qartPerfOverlayRef.current;
    if (!overlayEl || !qartPerfSnapshot) return;

    const computeMs =
      qartPerfSnapshot.computeMs === null ? null : Math.round(qartPerfSnapshot.computeMs);
    const renderMs =
      qartPerfSnapshot.renderMs === null ? null : Math.round(qartPerfSnapshot.renderMs);
    const previewMs =
      qartPerfSnapshot.previewMs === null ? null : Math.round(qartPerfSnapshot.previewMs);

    overlayEl.textContent = [
      `QArt ${qartPerfSnapshot.source} v${qartPerfSnapshot.version} m${qartPerfSnapshot.maskPattern}`,
      `compute=${computeMs ?? '-'}ms render=${renderMs ?? '-'}ms preview=${previewMs ?? '-'}ms`,
    ].join('\n');
  }, [qartPerfSnapshot]);

  // Get all relevant state from store
  // Subscribe to payload to trigger re-renders when payload changes
  // This is critical - without this dependency, config won't update when payload changes
  const payload = useQRStore((s) => s.payload);
  const qr = useQRStore((s) => s.qr);
  const render = useQRStore((s) => s.render);
  const overlay = useQRStore((s) => s.overlay);

  const watermark = useQRStore((s) => s.watermark);
  const output = useQRStore((s) => s.output);
  const animation = useQRStore((s) => s.animation);
  const _setAnimationPlaying = useQRStore((s) => s.setAnimationPlaying);
  const setQrCharacterEncoding = useQRStore((s) => s.setQrCharacterEncoding);
  const safety = useQRStore((s) => s.safety);
  const metadata = useQRStore((s) => s.metadata);
  const auto = useQRStore((s) => s.auto);
  const getPayloadText = useQRStore((s) => s.getPayloadText);
  const _setOverlayIntensity = useQRStore((s) => s.setOverlayIntensity);

  // Auto-pick ECC based on content length and overlay usage
  const autoPickedEcc = useMemo(() => {
    if (!auto.pickEcc) return qr.ecc;

    const content = getPayloadText();
    const contentLength = content.length;

    // If overlay is enabled with high intensity, prefer higher ECC
    if (overlay.enabled && overlay.intensity > 50) {
      return 'H'; // Maximum error correction for heavy overlays
    }

    if (overlay.enabled && overlay.intensity > 25) {
      return 'Q'; // High error correction for moderate overlays
    }

    // For longer content, use lower ECC to fit more data
    if (contentLength > 500) {
      return 'L'; // Low ECC for very long content
    }

    if (contentLength > 200) {
      return 'M'; // Medium ECC for long content
    }

    // Default to Q for good balance
    return 'Q';
  }, [auto.pickEcc, qr.ecc, overlay.enabled, overlay.intensity, getPayloadText]);

  // Apply safety constraints and generate warnings
  const { safetyAdjustedConfig, safetyWarnings } = useMemo(() => {
    const effectiveEcc = auto.pickEcc ? autoPickedEcc : qr.ecc;
    const result = computeSafetyAdjustments({
      safetyMode: safety.mode,
      minModulePx: safety.minModulePx,
      minQuietZoneModules: safety.minQuietZoneModules,
      maxOverlayIntensityByEcc: safety.maxOverlayIntensityByEcc,
      modulePx: render.modulePx,
      moduleGapPercent: render.moduleGapPercent,
      moduleStyle: render.moduleStyle,
      quietZoneModules: qr.quietZoneModules,
      ecc: qr.ecc,
      overlayEnabled: overlay.enabled,
      overlayIntensity: overlay.intensity,
      pickEcc: auto.pickEcc,
      reduceIntensityUntilSafe: auto.reduceIntensityUntilSafe,
      autoPickedEcc,
      effectiveEcc,
    });

    return {
      safetyAdjustedConfig: {
        modulePx: result.modulePx,
        quietZone: result.quietZone,
        intensity: result.intensity,
        ecc: result.ecc,
      },
      safetyWarnings: result.warnings,
    };
  }, [
    safety.mode,
    safety.minModulePx,
    safety.minQuietZoneModules,
    safety.maxOverlayIntensityByEcc,
    render.modulePx,
    render.moduleGapPercent,
    render.moduleStyle,
    qr.quietZoneModules,
    qr.ecc,
    overlay.enabled,
    overlay.intensity,
    auto.pickEcc,
    auto.reduceIntensityUntilSafe,
    autoPickedEcc,
  ]);

  // Get content and debounce it separately with longer delay for typing
  // This allows users to type without immediate QR rendering
  const rawContent = useMemo(() => {
    // Force dependency on payload by accessing it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _payloadDep = payload;
    return getPayloadText();
  }, [getPayloadText, payload]);

  // Longer debounce for content (700ms) to allow typing without blur
  const debouncedContent = useDebounce(rawContent, 700);

  // Auto-detect the most appropriate character encoding based on content
  // This helps users who paste UTF-8 content (emojis, Chinese, Japanese, etc.)
  // without manually changing the encoding setting
  const detectedCharacterEncoding = useMemo(() => {
    if (!rawContent) return 'default';

    // Helper functions to categorize characters
    // Uniquely Japanese: only found in Japanese text (hiragana, katakana)
    const isUniquelyJapanese = (charCode: number): boolean => {
      // Hiragana: U+3040 - U+309F
      if (charCode >= 0x3040 && charCode <= 0x309f) return true;
      // Katakana: U+30A0 - U+30FF
      if (charCode >= 0x30a0 && charCode <= 0x30ff) return true;
      // Half-width Katakana: U+FF65 - U+FF9F
      if (charCode >= 0xff65 && charCode <= 0xff9f) return true;
      return false;
    };

    // Shared CJK: characters used in Chinese, Japanese, and Korean
    // Shift-JIS can encode these, but presence alone doesn't indicate Japanese
    const isSharedCJK = (charCode: number): boolean => {
      // CJK Unified Ideographs (Kanji/Hanzi): U+4E00 - U+9FFF
      if (charCode >= 0x4e00 && charCode <= 0x9fff) return true;
      // CJK Symbols and Punctuation: U+3000 - U+303F
      if (charCode >= 0x3000 && charCode <= 0x303f) return true;
      return false;
    };

    let hasUniquelyJapanese = false; // Hiragana, Katakana - definitively Japanese
    let hasSharedCJK = false; // Kanji - could be Chinese or Japanese
    let hasOtherNonLatin1 = false; // Emojis, Korean, etc.

    // Check each character in the content
    for (let i = 0; i < rawContent.length; i++) {
      const charCode = rawContent.codePointAt(i)!;

      // Skip characters within Latin-1 range (0-255)
      if (charCode <= 255) continue;

      // Categorize the character
      if (isUniquelyJapanese(charCode)) {
        hasUniquelyJapanese = true;
      } else if (isSharedCJK(charCode)) {
        hasSharedCJK = true;
      } else {
        // Non-Latin-1, non-CJK character (e.g., emoji, Korean, etc.)
        hasOtherNonLatin1 = true;
      }
    }

    // Priority 1: If content has non-CJK Unicode (emojis, Korean, etc.), use UTF-8
    if (hasOtherNonLatin1) {
      return 'utf8';
    }

    // Priority 2: If content has uniquely Japanese chars (hiragana/katakana),
    // use Shift-JIS for efficiency (it's a native QR code encoding mode)
    if (hasUniquelyJapanese) {
      return 'shift-jis';
    }

    // Priority 3: If content has only shared CJK (kanji without hiragana/katakana),
    // it's likely Chinese text - use UTF-8 as Shift-JIS may not encode all Chinese chars
    if (hasSharedCJK) {
      return 'utf8';
    }

    // Content fits within Latin-1 range, default encoding works
    return 'default';
  }, [rawContent]);

  // Auto-update character encoding when user has 'default' selected and content requires
  // a different encoding (UTF-8 or Shift-JIS)
  // This ensures content is properly encoded without user intervention
  // Note: We only auto-update when characterEncoding is 'default' (the auto-detect state)
  // If user explicitly selected utf8, iso-8859-1, or shift-jis, we respect their choice
  useEffect(() => {
    // Only auto-update when character encoding is 'default' (allows auto-detection)
    // If user explicitly set a specific encoding, don't override their choice
    if (qr.characterEncoding !== 'default') return;

    // If content requires UTF-8 or Shift-JIS, update the encoding
    if (detectedCharacterEncoding === 'utf8') {
      setQrCharacterEncoding('utf8');
    } else if (detectedCharacterEncoding === 'shift-jis') {
      setQrCharacterEncoding('shift-jis');
    }
    // Note: We don't auto-downgrade back to 'default' because once the user's
    // content triggered a specific encoding, they might paste more such content later
  }, [detectedCharacterEncoding, qr.characterEncoding, setQrCharacterEncoding]);

  // Build comprehensive config object for QRGenerator
  // Content is pre-debounced, so config only changes after typing settles
  const config = useMemo(() => {
    // Use debounced content to avoid frequent re-renders while typing
    const content = debouncedContent;
    const resolvedOverlayMode = overlay.enabled ? overlay.mode : undefined;
    const preservation = resolveOverlayPreservationOptions({
      overlayEnabled: overlay.enabled,
      overlayMode: resolvedOverlayMode,
      safetyMode: safety.mode,
      safetyLockFinders: safety.lockFinders,
      safetyLockTiming: safety.lockTiming,
      safetyLockAlign: safety.lockAlign,
      safetyLockFormat: safety.lockFormat,
      safetyLockVersion: safety.lockVersion,
      preserveFinders: overlay.preserveFinders,
      preserveTiming: overlay.preserveTiming,
      preserveAlignment: overlay.preserveAlignment,
      protectFormatInfo: overlay.protectFormatInfo,
      protectVersionInfo: overlay.protectVersionInfo,
    });

    return {
      content,
      // === QR ENCODING OPTIONS ===
      typeNumber: qr.version,
      errorCorrection: safetyAdjustedConfig.ecc,
      encodingMode: qr.encodingMode,
      maskPattern: qr.maskPattern,
      characterEncoding: qr.characterEncoding,

      // === RENDER OPTIONS (with safety adjustments) ===
      moduleSize: safetyAdjustedConfig.modulePx,
      margin: safetyAdjustedConfig.quietZone + qr.borderModulesExtra,
      moduleGap: render.moduleGapPercent,
      gapMode: render.gapMode,
      moduleStyle: render.moduleStyle,
      finderStyle: render.finderStyle,
      alignmentStyle: render.alignmentStyle,
      timingStyle: render.timingStyle,
      cornerRadius: render.cornerRadius,
      dotRotationDeg: render.dotRotationDeg,
      eyeOuterStyle: render.eyeOuterStyle,
      eyeInnerStyle: render.eyeInnerStyle,
      eyeScale: render.eyeScale,
      frameStyle: render.frameStyle,
      frameText: render.frameText,
      crispEdges: render.crispEdges,
      pixelSnap: render.pixelSnap,

      // Colors
      fgColor: render.fgColor,
      bgColor: render.bgColor,
      transparentBg: render.bgTransparent,
      gradient: render.gradient,
      palette: render.palette,
      paletteMode: render.paletteMode,
      perModuleColorMode: render.perModuleColorMode,
      contrastGuard: render.contrastGuard,
      minContrastRatio: render.minContrastRatio,

      // === OVERLAY SETTINGS (with safety adjustments) ===
      overlayMode: resolvedOverlayMode,
      overlayIntensity: safetyAdjustedConfig.intensity,
      colorMode: overlay.colorMode,
      // Avoid hidden ECC clamping in normal mode; only apply explicit safety policy caps.
      maxOverlayIntensityByEcc: safety.mode === 'off' ? undefined : safety.maxOverlayIntensityByEcc,
      preserveFinders: preservation.preserveFinders,
      preserveTiming: preservation.preserveTiming,
      preserveAlignment: preservation.preserveAlignment,
      protectFormatInfo: preservation.protectFormatInfo,
      protectVersionInfo: preservation.protectVersionInfo,
      logoSize: 25, // For center mode

      // Overlay preprocessing (wired to qr-generator filter* fields)
      // Note: store values are already in UI units (brightness/contrast/saturation: -100..100,
      // gamma: ~0.2..3, hueRotateDeg: degrees, blurPx: px, sharpen: 0..100, posterizeLevels: 0..16, threshold: 0..255)
      filterInvert: overlay.invert,
      filterBrightness: overlay.brightness,
      filterContrast: overlay.contrast,
      filterGamma: overlay.gamma,
      filterSaturation: overlay.saturation,
      filterHue: overlay.hueRotateDeg,
      filterBlur: overlay.blurPx,
      filterSharpen: overlay.sharpen,
      filterPosterize: overlay.posterizeLevels,
      // Threshold remains opt-in from the overlay control. B&W mode itself is handled by colorMode.
      filterThreshold: overlay.threshold,
      filterEdgeDetect: overlay.edgeDetect !== 'off',
      filterEdgeMode: overlay.edgeDetect,
      filterDuotone1: overlay.duotoneColors?.[0],
      filterDuotone2: overlay.duotoneColors?.[1],
      // Map colorMode to filterGrayscale for preprocessing
      filterGrayscale: overlay.colorMode === 'grayscale' || overlay.colorMode === 'bw',
      // NOTE: Geometric transforms (rotate, flip, crop, fit) are applied in
      // applyGeometricTransforms() BEFORE passing to qr-generator.
      // We intentionally do NOT pass these values to avoid double-application.
      // overlayRotate, overlayFlipX, overlayFlipY, overlayCrop, overlayFit are omitted.

      // Dither options - on mobile, use cheap default unless user explicitly changed it
      ditherKind: getOverlayDitherKind({
        enabled: true,
        kind: overlay.ditherKind === STORE_DEFAULT_DITHER.kind ? undefined : overlay.ditherKind,
      }),
      ditherStrength: overlay.ditherStrength,
      finderDitherStrength: overlay.finderDitherStrength,
      blendPreservations: overlay.blendPreservations,
      blendPreservationMode: overlay.blendPreservationMode,
      ditherSerpentine: overlay.ditherSerpentine,
      diffusionKernel: overlay.diffusionKernel,
      orderedMatrix: overlay.orderedMatrix,
      blueNoiseTileSize: overlay.blueNoiseTileSize,
      blueNoiseSeed: overlay.blueNoiseSeed,
      colorDither: overlay.colorDither,

      // Subpixel options
      subpixelGridSize: overlay.subpixelGridSize,
      subpixelCenterRule: overlay.subpixelCenterRule,
      subpixelNeutralColor: overlay.subpixelNeutralColor,
      subpixelFinderOverride: overlay.subpixelFinderOverride,

      // Halftone options
      halftoneCell: overlay.halftoneCell,
      halftoneDotShape: overlay.halftoneDotShape,
      duotoneColors: overlay.duotoneColors,
      brightnessCurve: overlay.brightnessCurve,

      // ECC aware
      eccAwareEnabled: overlay.eccAwareEnabled,
      eccAwareRiskBudget: overlay.eccAwareRiskBudget,
      eccAwareWeightMap: overlay.eccAwareWeightMap,

      // QR-first mode (for high-contrast B&W images)
      qrFirstMode: overlay.qrFirstMode,

      // QR-Art options
      qrartIterations: overlay.qrartIterations,
      qrartFragmentLength: overlay.qrartFragmentLength,
      qrartSeed: overlay.qrartSeed,

      // Debug flag for overlay preprocessing
      // Automatically enabled in development builds, disabled in production
      debugOverlayDither: import.meta.env.DEV, // Debug logging: ON in dev, OFF in production

      // === ANIMATION / TEMPORAL DITHERING ===
      temporalDither: animation.temporalDither,
      frameIndex: 0, // Default for static images, will be overridden per-frame for animations
      animationSeed: animation.seed,
      moduleJitterPx: animation.moduleJitterPx,
      colorCycle: animation.colorCycle,

      // === QR ENCODING ENFORCEMENT ===
      quietZoneMinEnforce: qr.quietZoneMinEnforce,

      // === SAFETY CONSTRAINTS ===
      safetyMode: safety.mode,
      safetyLockFinders: safety.lockFinders,
      safetyLockTiming: safety.lockTiming,
      safetyLockAlign: safety.lockAlign,
      safetyLockFormat: safety.lockFormat,
      safetyLockVersion: safety.lockVersion,
      safetyMinModulePx: safety.minModulePx,
      safetyMinQuietZone: safety.minQuietZoneModules,
    };
  }, [
    debouncedContent, // Use debounced content instead of raw payload
    safetyAdjustedConfig,
    // QR encoding
    qr.version,
    qr.encodingMode,
    qr.maskPattern,
    qr.characterEncoding,
    qr.borderModulesExtra,
    qr.quietZoneMinEnforce,
    render.moduleGapPercent,
    render.gapMode,
    render.moduleStyle,
    render.finderStyle,
    render.alignmentStyle,
    render.timingStyle,
    render.cornerRadius,
    render.dotRotationDeg,
    render.eyeOuterStyle,
    render.eyeInnerStyle,
    render.eyeScale,
    render.frameStyle,
    render.frameText,
    render.crispEdges,
    render.pixelSnap,
    render.fgColor,
    render.bgColor,
    render.bgTransparent,
    render.gradient,
    render.palette,
    render.paletteMode,
    render.perModuleColorMode,
    render.contrastGuard,
    render.minContrastRatio,
    // Overlay
    overlay.enabled,
    overlay.mode,
    overlay.colorMode,
    overlay.invert,
    overlay.preserveFinders,
    overlay.preserveTiming,
    overlay.preserveAlignment,
    overlay.protectFormatInfo,
    overlay.protectVersionInfo,
    overlay.brightness,
    overlay.contrast,
    overlay.gamma,
    overlay.saturation,
    overlay.hueRotateDeg,
    overlay.blurPx,
    overlay.sharpen,
    overlay.posterizeLevels,
    overlay.threshold,
    overlay.edgeDetect,
    overlay.ditherKind,
    overlay.ditherStrength,
    overlay.finderDitherStrength,
    overlay.blendPreservations,
    overlay.blendPreservationMode,
    overlay.ditherSerpentine,
    overlay.diffusionKernel,
    overlay.orderedMatrix,
    overlay.blueNoiseTileSize,
    overlay.blueNoiseSeed,
    overlay.colorDither,
    overlay.subpixelGridSize,
    overlay.subpixelCenterRule,
    overlay.subpixelNeutralColor,
    overlay.subpixelFinderOverride,
    overlay.halftoneCell,
    overlay.halftoneDotShape,
    overlay.duotoneColors,
    overlay.brightnessCurve,
    overlay.eccAwareEnabled,
    overlay.eccAwareRiskBudget,
    overlay.eccAwareWeightMap,
    overlay.qrFirstMode,
    overlay.qrartIterations,
    overlay.qrartFragmentLength,
    overlay.qrartSeed,
    // Animation
    animation.temporalDither,
    animation.seed,
    animation.moduleJitterPx,
    animation.colorCycle,
    // Safety
    safety.mode,
    safety.lockFinders,
    safety.lockTiming,
    safety.lockAlign,
    safety.lockFormat,
    safety.lockVersion,
    safety.minModulePx,
    safety.minQuietZoneModules,
    safety.maxOverlayIntensityByEcc,
  ]);

  // Debounce config changes to prevent excessive regeneration.
  // We keep a fast-preview stage for live interaction, then settle to full quality.
  const primaryDebouncedConfig = useDebounce(config, CONFIG_DEBOUNCE_MS);
  const settledConfig = useDebounce(config, CONFIG_SETTLE_DEBOUNCE_MS);
  const overlaySourceKey = useMemo(() => {
    const file = overlay.file;
    if (!file) return `url:${overlay.url || ''}`;
    return `file:${file.name}:${file.size}:${file.lastModified}:${file.type}:${overlay.url || ''}`;
  }, [overlay.file, overlay.url]);
  currentOverlaySourceKeyRef.current = overlaySourceKey;

  useEffect(() => {
    const currentPrimary = primaryDebouncedConfig as object;
    if (
      autoGenerateSuppressedRef.current &&
      cancelledPrimaryDebouncedConfigRef.current &&
      cancelledPrimaryDebouncedConfigRef.current !== currentPrimary
    ) {
      autoGenerateSuppressedRef.current = false;
      cancelledPrimaryDebouncedConfigRef.current = null;
      cancelledOverlaySourceKeyRef.current = null;
    }
    currentPrimaryDebouncedConfigRef.current = currentPrimary;
  }, [primaryDebouncedConfig]);

  useEffect(() => {
    if (!autoGenerateSuppressedRef.current) return;
    if (
      cancelledOverlaySourceKeyRef.current &&
      cancelledOverlaySourceKeyRef.current !== overlaySourceKey
    ) {
      autoGenerateSuppressedRef.current = false;
      cancelledPrimaryDebouncedConfigRef.current = null;
      cancelledOverlaySourceKeyRef.current = null;
    }
  }, [overlaySourceKey]);

  // During active interaction, enable fast preview mode which skips
  // expensive rendering features. Once interaction stops and settledConfig catches up,
  // fast preview is removed and a full-quality re-render is triggered automatically.
  const debouncedConfig = useMemo(() => {
    if (primaryDebouncedConfig !== settledConfig) {
      return { ...primaryDebouncedConfig, fastPreview: true as const };
    }
    return primaryDebouncedConfig;
  }, [primaryDebouncedConfig, settledConfig]);

  // Track when config changes but debounce hasn't settled yet.
  // Compare against primaryDebouncedConfig (not debouncedConfig which may have fastPreview added)
  // so that fast-preview renders don't trigger the pending blur overlay.
  const isConfigPending = config !== primaryDebouncedConfig;

  // Show pending state for style changes only (not for content typing)
  // Use a short delay to avoid flickering on rapid style changes
  useEffect(() => {
    if (isConfigPending) {
      const timeout = setTimeout(() => setPendingVisible(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setPendingVisible(false);
    }
  }, [isConfigPending]);

  // CRITICAL: Clear overflow blocking state IMMEDIATELY when raw content changes
  // This fixes the calendar date selection issue where:
  // 1. User selects a date -> rawContent changes immediately
  // 2. But debouncedContent won't update for 700ms
  // 3. Without this, hasOverflowError stays true, blocking the generate useEffect
  // 4. The generate() function never runs, so its content-change detection never executes
  // This useEffect runs on RAW content, so it clears blocking state immediately
  //
  // IMPORTANT: We UNCONDITIONALLY clear overflow state on every rawContent change.
  // Previously this was conditional (only if overflow existed), but that caused timing
  // race conditions where React state updates hadn't propagated before the generate
  // useEffect ran. The clearing operations are cheap and ensuring they always run
  // prevents stuck overflow error states, especially in iCalendar/Event content types.
  useEffect(() => {
    log.debug('rawContent useEffect triggered', {
      rawContentLength: rawContent.length,
      rawContentPreview: rawContent.substring(0, 100),
      lastOverflowContent: lastOverflowContentRef.current?.substring(0, 50),
      isOverflowBlocked: isOverflowBlockedRef.current,
      hasOverflowError,
    });
    lastOverflowContentRef.current = null;
    isOverflowBlockedRef.current = false;
    setHasOverflowError(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only react to rawContent changes, not state changes
  }, [rawContent]);

  // Clear error and overflow tracking when debounced content, version, or ECC changes
  // This is a secondary safety net - the rawContent effect above handles the critical path
  // This effect handles cases where version/ECC change independently
  useEffect(() => {
    // Always clear overflow tracking when these deps change - user is trying something different
    lastOverflowContentRef.current = null;
    isOverflowBlockedRef.current = false;

    setError(null);
    setHasOverflowError(false);
  }, [debouncedConfig.content, debouncedConfig.typeNumber, debouncedConfig.errorCorrection]);

  /**
   * Apply only geometric transforms (crop, fit, rotate, flip) to a canvas.
   * Color adjustments (brightness, contrast, etc.) are now done at moduleCount
   * resolution inside qr-generator.js for 10-50x speedup.
   *
   * NOTE: This is called from the hook BEFORE passing to qr-generator.
   * qr-generator.js has its own _applyGeometricTransforms but it checks
   * _hasGeometricTransforms() which looks at config.overlayRotate/overlayFlipX/overlayFlipY.
   * Since we apply transforms here and don't pass those config values to the generator,
   * the generator will NOT double-apply transforms.
   */
  const applyGeometricTransforms = useCallback(
    (sourceCanvas: HTMLCanvasElement | OffscreenCanvas): HTMLCanvasElement => {
      const source = sourceCanvas as HTMLCanvasElement;
      const needsTransform =
        overlay.rotateDeg !== 0 ||
        overlay.flipX ||
        overlay.flipY ||
        overlay.cropEnabled ||
        !!overlay.fit;

      if (!needsTransform) {
        return source;
      }

      let workingCanvas: HTMLCanvasElement = source;
      if (overlay.cropEnabled && overlay.cropRegion) {
        const cropped = applyCropTransform(sourceCanvas, overlay.cropRegion);
        if (!cropped) return sourceCanvas as HTMLCanvasElement;
        workingCanvas = cropped;
      }

      if (overlay.fit) {
        const fitted = applyFitTransform(workingCanvas, overlay.fit);
        if (!fitted) return workingCanvas;
        workingCanvas = fitted;
      }

      if (overlay.rotateDeg !== 0 || overlay.flipX || overlay.flipY) {
        const rotated = applyRotateFlipTransform(
          workingCanvas,
          overlay.rotateDeg,
          overlay.flipX,
          overlay.flipY
        );
        if (!rotated) return workingCanvas;
        workingCanvas = rotated;
      }

      return workingCanvas;
    },
    [
      overlay.rotateDeg,
      overlay.flipX,
      overlay.flipY,
      overlay.cropEnabled,
      overlay.cropRegion,
      overlay.fit,
    ]
  );

  // Load overlay image when file changes
  // For GIFs: use compositor for optimal patch-only decoding
  // For static images: load directly
  useEffect(() => {
    if (!overlay.file) {
      setRawOverlayCanvas(null);
      setOverlayCanvas(null);
      setGifFrames([]);
      setGifCompositor(null);
      setCurrentFrame(0);
      setIsLoadingOverlay(false);
      return;
    }

    // Set loading state immediately when starting to load overlay
    // This prevents busy overlay flickering between QR render and animation cache build
    setIsLoadingOverlay(true);

    // Check for GIF format (use compositor for optimal decoding)
    const isGif =
      overlay.file.type === 'image/gif' || overlay.file.name.toLowerCase().endsWith('.gif');

    // Check for animated WebP (still uses legacy path for now)
    const isAnimatedWebP =
      overlay.file.type === 'image/webp' || overlay.file.name.toLowerCase().endsWith('.webp');

    if (isGif) {
      loadGifOverlayFile(
        overlay.file,
        setGifCompositor,
        setGifFrames,
        setCurrentFrame,
        setRawOverlayCanvas,
        setIsLoadingOverlay
      );
    } else if (isAnimatedWebP) {
      loadAnimatedWebPOverlayFile(
        overlay.file,
        overlay.gifDisposalHandling,
        setGifFrames,
        setGifCompositor,
        setCurrentFrame,
        setRawOverlayCanvas,
        setIsLoadingOverlay
      );
    } else {
      loadStaticOverlayFile(
        overlay.file,
        setGifFrames,
        setGifCompositor,
        setRawOverlayCanvas,
        setIsLoadingOverlay
      );
    }
  }, [overlay.file, overlay.gifDisposalHandling]);

  // Apply geometric transforms when raw canvas or transform settings change
  // NOTE: Color adjustments are now done at moduleCount resolution in qr-generator.js
  useEffect(() => {
    if (rawOverlayCanvas) {
      const transformed = applyGeometricTransforms(rawOverlayCanvas);
      setOverlayCanvas(transformed);
    } else {
      setOverlayCanvas(null);
    }
  }, [rawOverlayCanvas, applyGeometricTransforms]);

  // Generate QR code
  const generate = useCallback(async () => {
    log.debug('generate() called', {
      debouncedContentLength: debouncedConfig.content?.length,
      debouncedContentPreview: debouncedConfig.content?.substring(0, 100),
      lastOverflowContent: lastOverflowContentRef.current?.substring(0, 50),
      isOverflowBlocked: isOverflowBlockedRef.current,
      hasOverflowError,
      typeNumber: debouncedConfig.typeNumber,
      errorCorrection: debouncedConfig.errorCorrection,
    });

    const preCheckResult = handleGeneratePreChecks({
      lastOverflowContentRef,
      isOverflowBlockedRef,
      content: debouncedConfig.content,
      setHasOverflowError,
      setError,
      clearGenerationProgress,
    });
    if (preCheckResult.shouldAbort) return;

    activeQArtRequestAbortRef.current?.abort();
    const qartAbortController = new AbortController();
    activeQArtRequestAbortRef.current = qartAbortController;

    const requestId = ++generationRequestIdRef.current;
    const isStaleRequest = (): boolean => generationRequestIdRef.current !== requestId;

    const trimmedContent = debouncedConfig.content?.trim() || '';
    const emptyCheck = handleEmptyContent({
      trimmedContent,
      isStaleRequest,
      setCanvas,
      setError,
      setIsLoading,
      setIsRendering,
      clearGenerationProgress,
      canvasRef,
    });
    if (emptyCheck.handled) return;

    setIsLoading(true);
    setError(null);
    updateGenerationProgress(t('preview.busy.preparingPreview', 'Preparing your preview...'), 6);

    // CRITICAL: Yield to browser to allow React to render the loading state
    // before starting expensive QR generation. Without this, the busy overlay
    // may not appear because the heavy computation blocks the UI thread.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        // Double-RAF ensures the browser has completed painting
        requestAnimationFrame(() => resolve());
      });
    });

    if (isStaleRequest()) return;
    setIsRendering(true);
    updateGenerationProgress(
      t('preview.busy.buildingQrStructure', 'Building the QR structure...'),
      14
    );
    const yieldForResponsiveness = async (): Promise<boolean> => {
      await yieldToMainThread(16);
      return isStaleRequest();
    };
    const runValidationIfNeeded = setupValidationRunner({
      requestId,
      animationFrameCount,
      hasMultipleSourceFramesRef,
      animationPlaying: animation.playing,
      setIsValidating,
      setValidation,
      generationRequestIdRef,
    });

    try {
      // Build effective config - may be modified by QR-Art fragment search
      const effectiveConfig = { ...debouncedConfig };
      const runGeneratorWithStatus = (
        cfg: QRGeneratorConfig,
        overlaySource: HTMLCanvasElement | OffscreenCanvas | null
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> =>
        runGeneratorWithSlowStatus({
          cfg,
          overlaySource,
          isStaleRequest,
          updateGenerationProgress,
          t,
        });

      if (overlay.enabled && overlay.mode === 'artwork' && overlayCanvas) {
        const qartResult = await runQArtGeneration({
          overlayCanvas,
          debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
          qartAbortController,
          isStaleRequest,
          yieldForResponsiveness,
          updateGenerationProgress,
          t,
          translateQArtStage,
          watermark,
          canvasRef,
          setCanvas,
          qrPackedMatrixRef,
          setQrMatrix,
          setIsRendering,
          setIsLoading,
          clearGenerationProgress,
          qartPreviewBitmapCanvasRef,
          effectiveConfig,
          runValidationIfNeeded,
          setQArtPerfSnapshot,
          requestId,
        });
        if (qartResult.handled) return;
      }

      const stdResult = await runStandardGeneration({
        effectiveConfig,
        debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
        overlayEnabled: overlay.enabled,
        overlayCanvas,
        isStaleRequest,
        yieldForResponsiveness,
        updateGenerationProgress,
        t,
        runGeneratorWithStatus,
        lastOverflowContentRef,
        isOverflowBlockedRef,
        setHasOverflowError,
        setError,
        setIsRendering,
        setIsLoading,
        clearGenerationProgress,
      });
      if (stdResult.aborted) return;

      await finalizeGeneratedCanvas({
        result: stdResult.result,
        watermark,
        isStaleRequest,
        setCanvas,
        updateGenerationProgress,
        t,
        qrPackedMatrixRef,
        setQrMatrix,
        canvasRef,
        runValidationIfNeeded,
        effectiveConfig,
      });
    } catch (err) {
      if (isStaleRequest()) return;
      log.error('QR generation error', { error: err });
      const errorMessage = formatGenerationErrorMessage(err, t);
      setError(errorMessage);
      clearGenerationProgress();
      dispatchRenderCompleteEvent(false, errorMessage);
    } finally {
      cleanupGenerateState({
        activeQArtRequestAbortRef,
        qartAbortController,
        isStaleRequest,
        setIsRendering,
        setIsLoading,
        clearGenerationProgress,
        error,
      });
    }
  }, [
    debouncedConfig,
    overlay.enabled,
    overlay.mode,
    overlayCanvas,
    watermark,
    animation.playing,
    animationFrameCount,
    error,
    hasOverflowError,
    clearGenerationProgress,
    updateGenerationProgress,
    t,
    translateQArtStage,
  ]);

  const regenerate = useCallback(async () => {
    autoGenerateSuppressedRef.current = false;
    cancelledPrimaryDebouncedConfigRef.current = null;
    cancelledOverlaySourceKeyRef.current = null;
    await generate();
  }, [generate]);

  // Regenerate when config changes
  // Skip if we're playing from cached animation frames or if we have an overflow error
  useEffect(() => {
    log.debug('regenerate useEffect triggered', {
      hasOverflowError,
      isOverflowBlocked: isOverflowBlockedRef.current,
      isAnimationCacheReady,
      animationFramesLength: animationFrameCount,
      animationPlaying: animation.playing,
    });

    // CRITICAL: Only check the REF, not the state!
    // The rawContent useEffect clears isOverflowBlockedRef synchronously,
    // but setHasOverflowError(false) is async (React batches state updates).
    // If we check hasOverflowError here, we might see stale TRUE value
    // from before the rawContent useEffect's state update was flushed.
    // The ref is always up-to-date because it's synchronous.
    if (isOverflowBlockedRef.current) {
      log.debug('regenerate BLOCKED by overflow ref');
      return;
    }
    if (autoGenerateSuppressedRef.current) {
      log.debug('regenerate BLOCKED by user cancel');
      return;
    }
    // If we have cached animation frames and animation is playing, don't regenerate
    // The cached frames will be displayed by the animation playback effect
    if (isAnimationCacheReady && animationFrameCount > 1 && animation.playing) {
      return;
    }
    // During cache building for multi-frame animations, skip - cache builder handles generation
    if (!isAnimationCacheReady && hasMultipleSourceFramesRef.current && animation.playing) {
      return;
    }
    generate();
    // NOTE: hasOverflowError is intentionally NOT in the dependency array.
    // We only use the ref (isOverflowBlockedRef) for blocking decisions because
    // the ref is synchronously updated by the rawContent useEffect, while the
    // state update (setHasOverflowError) is async and may not be flushed yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate, isAnimationCacheReady, animationFrameCount, animation.playing, hasOverflowError]);

  // Calculate effective frame indices based on startFrame, maxFrames, frameStep, and FPS decimation
  // Works with both GIF compositor and legacy AnimationFrame array
  const effectiveFrameIndices = useMemo(() => {
    const totalFrames = gifCompositor?.frameCount || gifFrames.length;
    if (totalFrames === 0) return [];

    const startIdx = Math.min(animation.startFrame, totalFrames - 1);
    const maxCount = animation.maxFrames > 0 ? animation.maxFrames : totalFrames; // Use all frames when maxFrames is 0 (no limit)
    const step = Math.max(1, animation.frameStep);

    // First pass: apply startFrame and frameStep
    let candidateIndices: number[] = [];
    for (let i = startIdx; i < totalFrames && candidateIndices.length < maxCount; i += step) {
      candidateIndices.push(i);
    }

    // Second pass: apply FPS-based decimation if source FPS > target
    const preDecimationCount = candidateIndices.length;
    if (candidateIndices.length > 1 && overlay.gifMaxFps > 0 && gifCompositor) {
      // Use compositor-based decimation for GIFs
      const allIndices = decimateCompositorFrames(gifCompositor, overlay.gifMaxFps);
      const allIndexSet = new Set(allIndices);
      // Filter to only keep indices that are in our candidate set
      candidateIndices = candidateIndices.filter((i) => allIndexSet.has(i));
    }

    if (candidateIndices.length > 0) {
      log.debug('effectiveFrameIndices', {
        totalFrames,
        preDecimation: preDecimationCount,
        postDecimation: candidateIndices.length,
        dropped: preDecimationCount - candidateIndices.length,
        gifMaxFps: overlay.gifMaxFps,
        startFrame: animation.startFrame,
        frameStep: animation.frameStep,
      });
    }

    return candidateIndices;
  }, [
    gifCompositor,
    gifFrames.length,
    animation.startFrame,
    animation.maxFrames,
    animation.frameStep,
    overlay.gifMaxFps,
  ]);

  // For backward compatibility - get effective frames for legacy code paths
  const effectiveFrames = useMemo(() => {
    if (gifCompositor) {
      // Create synthetic AnimationFrame objects from compositor
      const frames = effectiveFrameIndices.map((i) => {
        const srcDisposal = gifCompositor.disposalType(i);
        const effectiveDisposal =
          overlay.gifDisposalHandling === 'simplify' && srcDisposal === 3 ? 2 : srcDisposal;
        return {
          canvas: gifCompositor.canvas, // Note: this is the same canvas, caller must use compositor.apply(i)
          delay: gifCompositor.delayMs(i),
          disposalType: effectiveDisposal,
        };
      });
      const totalMs = frames.reduce((s, f) => s + f.delay, 0);
      const uniqueDisposals = [...new Set(frames.map((f) => f.disposalType))].sort((a, b) => a - b);
      log.debug('effectiveFrames: compositor', {
        frameCount: frames.length,
        sampleDelays: frames.slice(0, 3).map((f) => f.delay),
        uniqueDisposals,
        disposalHandling: overlay.gifDisposalHandling,
        totalDurationMs: totalMs,
        avgFps: totalMs > 0 ? Math.round((frames.length / totalMs) * 1000 * 10) / 10 : 0,
      });
      return frames;
    }
    // Legacy path for WebP
    const frames = effectiveFrameIndices.map((i) => gifFrames[i]).filter(Boolean);
    if (frames.length > 0) {
      log.debug('effectiveFrames: legacy', {
        frameCount: frames.length,
        sampleDelays: frames.slice(0, 3).map((f) => f.delay),
      });
    }
    return frames;
  }, [gifCompositor, gifFrames, effectiveFrameIndices, overlay.gifDisposalHandling]);

  // Expose state to window for external tools (gallery generator)
  // NOTE: We intentionally DON'T store animationFrames directly to avoid pinning
  // large canvases in memory. External tools should use getAnimationFrames() getter.
  useEffect(() => {
    // Get original frame delays from parsed GIF frames
    const frameDelays = effectiveFrames.map((f) => f.delay || 100);

    globalThis.__ANQR_STATE__ = {
      isLoading,
      isAnimationReady: isAnimationCacheReady && animationFrameCount > 1,
      animationFrameCount,
      currentFrame,
      // Use getter function instead of direct reference to allow GC when not actively used
      get animationFrames() {
        return animationFramesRef.current;
      },
      animationSpeedMs: animation.speedMs,
      frameDelays, // Original delays from source GIF
    };

    // Cleanup: remove reference when component unmounts or deps change
    return () => {
      if (globalThis.__ANQR_STATE__) {
        // Clear the reference to allow GC
        globalThis.__ANQR_STATE__ = undefined;
      }
    };
  }, [
    isLoading,
    isAnimationCacheReady,
    animationFrameCount,
    currentFrame,
    animation.speedMs,
    effectiveFrames,
  ]);

  // Determine the total frame count for animation playback
  // This handles both overlay-based animations (effectiveFrames) and base QR animations (animationFrames)
  const playbackFrameCount = useMemo(() => {
    // Only start playback tick once cache is fully built.
    // All animated content (multi-frame overlays, patterns, base effects) goes through
    // the cache path. Starting the tick before cache is ready causes the tick, overlay
    // frame update effect, and cache builder to fight over the shared gifCompositor.
    if (isAnimationCacheReady && animationFrameCount > 1) return animationFrameCount;
    return 0;
  }, [isAnimationCacheReady, animationFrameCount]);

  // Animation loop for both overlay-based and base QR animations
  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  useEffect(() => {
    // Only animate if we have multiple frames and animation is playing
    if (playbackFrameCount <= 1 || !animation.playing) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    setIsAnimating(true);
    lastFrameTime.current = performance.now();
    // Reset direction when animation settings change
    animationDirection.current = 1;

    let tickCount = 0;
    const tick = (now: number) => {
      const elapsed = now - lastFrameTime.current;
      const activeFrameIndex = currentFrameRef.current;
      const frameDelay = resolveAnimationFrameDelay(effectiveFrames, activeFrameIndex, {
        useSourceFrameDelays:
          overlay.enabled && effectiveFrames.length > 1 && overlay.gifUseFrameDelays,
        gifMaxFps: overlay.gifMaxFps,
        fallbackDelayMs: animation.speedMs,
      });

      if (elapsed >= frameDelay) {
        if (tickCount < 3) {
          log.debug('animation tick', {
            tickCount,
            frameIndex: activeFrameIndex,
            elapsed: Math.round(elapsed),
            frameDelay,
            playbackFrameCount,
          });
        } else if (tickCount % 60 === 0) {
          log.trace('animation tick', {
            tickCount,
            frameIndex: activeFrameIndex,
            elapsed: Math.round(elapsed),
            frameDelay,
            playbackFrameCount,
          });
        }
        tickCount++;
        // Use additive timing to prevent drift - increment by frameDelay instead of resetting to now
        lastFrameTime.current += frameDelay;

        // Prevent catch-up storms: if we've fallen too far behind, reset to now
        if (now - lastFrameTime.current > frameDelay * 3) {
          lastFrameTime.current = now;
        }

        setCurrentFrame((prev) => {
          // Get frame delay from current frame if available
          let next = prev + animationDirection.current;

          // Handle bounds based on playback frame count
          if (next >= playbackFrameCount) {
            if (animation.bounce) {
              animationDirection.current = -1;
              next = playbackFrameCount - 2;
            } else if (animation.loop) {
              next = 0;
            } else {
              next = playbackFrameCount - 1;
            }
          } else if (next < 0) {
            if (animation.bounce) {
              animationDirection.current = 1;
              next = 1;
            } else if (animation.loop) {
              next = playbackFrameCount - 1;
            } else {
              next = 0;
            }
          }

          return Math.max(0, Math.min(playbackFrameCount - 1, next));
        });
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    playbackFrameCount,
    animation.playing,
    animation.speedMs,
    animation.loop,
    animation.bounce,
    effectiveFrames,
    overlay.enabled,
    overlay.gifUseFrameDelays,
    overlay.gifMaxFps,
  ]);

  // Update overlay canvas when current frame changes (for animation preview)
  // Uses compositor for GIFs (optimal), legacy frames for WebP
  // OPTIMIZATION: Track last rendered frame to avoid O(n²) replay from frame 0
  const lastRenderedFrameRef = useRef<number>(-1);

  useEffect(() => {
    // If we have cached animation frames, skip - we'll draw from cache
    if (isAnimationCacheReady && animationFrameCount > 0) {
      return;
    }

    // During cache building for multi-frame overlays, skip compositor operations.
    // The cache builder exclusively owns the compositor during this phase.
    if (!isAnimationCacheReady && hasMultipleSourceFramesRef.current) return;

    const frameIdx = effectiveFrameIndices[currentFrame];
    if (frameIdx === undefined) return;

    if (gifCompositor) {
      const lastRendered = lastRenderedFrameRef.current;

      log.trace('overlay frame update', {
        currentFrame,
        frameIdx,
        lastRendered,
        action:
          lastRendered < 0 || frameIdx < lastRendered
            ? 'replay'
            : frameIdx > lastRendered
              ? 'forward'
              : 'noop',
      });

      updateCompositorToFrame(gifCompositor, frameIdx, lastRendered);

      lastRenderedFrameRef.current = frameIdx;
      setRawOverlayCanvas(gifCompositor.getSnapshot());
    } else if (gifFrames[frameIdx]) {
      // Legacy path for WebP
      setRawOverlayCanvas(gifFrames[frameIdx].canvas);
    }
  }, [
    currentFrame,
    effectiveFrameIndices,
    gifCompositor,
    gifFrames,
    isAnimationCacheReady,
    animationFrameCount,
  ]);

  // Reset the frame tracking when compositor changes (new GIF loaded), animation cache state changes,
  // or when effective frame indices change (user changed frame settings)
  useEffect(() => {
    lastRenderedFrameRef.current = -1;
  }, []);

  // Track whether we have multiple source frames (for validation skip during cache building)
  useEffect(() => {
    hasMultipleSourceFramesRef.current =
      (gifCompositor?.frameCount ?? 0) > 1 || effectiveFrameIndices.length > 1;
  }, [gifCompositor, effectiveFrameIndices.length]);

  // Display cached animation frames during playback (fast path - no re-encoding)
  useEffect(() => {
    // Guard against race conditions: don't draw during active rendering
    if (isRendering) return;

    const cachedFrames = animationFramesRef.current;
    if (isAnimationCacheReady && animationFrameCount > 1 && cachedFrames[currentFrame]) {
      const cachedFrame = cachedFrames[currentFrame];

      // Draw directly to display canvas (skip setCanvas during playback to avoid re-renders)
      if (canvasRef.current) {
        drawToDisplayCanvas(canvasRef.current, cachedFrame);
      }
    }
  }, [currentFrame, isAnimationCacheReady, animationFrameCount, isRendering]);

  // Prepare interstitial ad on mount (so it's ready when user downloads)
  useEffect(() => {
    prepareInterstitial('export');
  }, []);

  // Download function with output scaling
  const download = useCallback(async () => {
    if (!canvas) return;

    setIsExporting(true);

    // Allow React to render the busy overlay before starting export
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Show interstitial ad BEFORE download on native platforms
      await showInterstitial('export');
      scheduleTrackEvent('export', { format: output.format });
      const exporter = await loadExporterModule();

      const exportCanvas = createScaledExportCanvas(
        canvas,
        output.widthPx,
        output.heightPx,
        render.crispEdges
      );

      const exportConfig = buildExportConfig(output, metadata);
      const pngMetadata = buildPngMetadata(metadata);

      if (output.format === 'svg') {
        await downloadSvgFormat({
          exporter,
          exportCanvas,
          exportConfig,
          svgTrueVector: output.svgTrueVector,
          qrMatrix,
          qrPackedMatrixRef: qrPackedMatrixRef.current,
          outputWidthPx: output.widthPx,
          outputFilename: output.filename,
          quietZoneModules: qr.quietZoneModules,
          borderModulesExtra: qr.borderModulesExtra,
          renderState: render,
          metadataState: metadata,
        });
      } else if (output.format === 'gif' && animationFrameCount > 1) {
        await downloadAnimatedGifFormat({
          exporter,
          cachedAnimationFrames: animationFramesRef.current,
          exportConfig,
          outputWidthPx: output.widthPx,
          outputHeightPx: output.heightPx,
          crispEdges: render.crispEdges,
          animationSpeedMs: animation.speedMs,
          animationLoop: animation.loop,
          effectiveFrames,
          gifUseFrameDelays: overlay.gifUseFrameDelays,
          gifMaxFps: overlay.gifMaxFps,
        });
      } else if (output.format === 'gif') {
        await exporter.downloadGif([exportCanvas], exportConfig);
      } else {
        await exporter.downloadImage(exportCanvas, exportConfig, pngMetadata, output.dpi);
      }
    } catch (err) {
      log.error('Download error', { error: err });
    } finally {
      setIsExporting(false);
    }
  }, [
    canvas,
    output,
    render,
    qr.quietZoneModules,
    qr.borderModulesExtra,
    qrMatrix,
    animationFrameCount,
    animation.speedMs,
    animation.loop,
    metadata,
    overlay.gifUseFrameDelays,
    overlay.gifMaxFps,
    effectiveFrames,
  ]);

  // Generate all animation frames for GIF export and playback cache
  // This runs once when config changes, then frames are cached for fast playback
  useEffect(() => {
    // Track if this effect is still current (for cleanup/cancellation)
    let isCancelled = false;
    const animationQArtAbortController = new AbortController();
    activeAnimationRequestAbortRef.current?.abort();
    activeAnimationRequestAbortRef.current = animationQArtAbortController;
    const isRunCancelled = (): boolean =>
      isCancelled || animationQArtAbortController.signal.aborted;

    const { modulePatternEffects, resultPatternEffects } = buildPatternEffectLists(animation);
    const hasColorCycle = animation.colorCycle === true;
    const hasPattern = modulePatternEffects.length > 0 || resultPatternEffects.length > 0;
    const hasTemporalDither = animation.temporalDither !== 'off';
    const hasInterpolation = animation.interpolate !== 'none';
    const hasJitter = animation.moduleJitterPx > 0 || modulePatternEffects.length > 0;

    // True only if at least one animation effect is actually enabled
    const hasAnyAnimationEffect = hasColorCycle || hasPattern || hasTemporalDither || hasJitter;

    // Check if we should generate animation from base QR (no overlay)
    // Only when at least one effect is actually enabled
    const shouldGenerateBaseAnimation = hasAnyAnimationEffect && !overlay.enabled;

    // Check if we should generate animation effects on a static overlay image
    // This handles colorCycle, temporalDither, jitter on single-frame overlays
    const shouldGenerateStaticOverlayAnimation =
      hasAnyAnimationEffect && overlay.enabled && effectiveFrames.length === 1;

    const computePatternDrivenJitter = (frameIndex: number, totalFrames: number): number =>
      computePatternDrivenJitterValue(
        frameIndex,
        totalFrames,
        animation.moduleJitterPx,
        modulePatternEffects
      );

    const scratchPool = createScratchCanvasPool();
    const applyResultPatternStackPersistent = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        resultPatternEffects,
        frameIndex,
        totalFrames,
        true,
        scratchPool.getPatternScratch
      );
    const applyResultPatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        resultPatternEffects,
        frameIndex,
        totalFrames,
        false,
        scratchPool.getPatternScratch
      );
    const applyModulePatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        modulePatternEffects,
        frameIndex,
        totalFrames,
        false,
        scratchPool.getPatternScratch
      );

    // Early return only if no animation is needed
    // For multi-frame overlays (animated GIFs), we need to generate frames regardless of other animation effects
    const hasMultiFrameOverlay = effectiveFrames.length > 1 && overlay.enabled;

    // OPTIMIZATION: If we have a single static overlay with NO animation effects enabled,
    // skip batch frame generation entirely - the normal generate() path handles this
    if (
      !(hasMultiFrameOverlay || shouldGenerateBaseAnimation || shouldGenerateStaticOverlayAnimation)
    ) {
      clearAnimationFrames();
      setIsAnimationCacheReady(false);
      return;
    }

    // Mark cache as not ready while generating
    setIsAnimationCacheReady(false);
    setIsLoading(true);
    updateGenerationProgress(
      t('preview.busy.preparingAnimationFrames', 'Preparing the animation frames...'),
      8
    );

    // Generate QR for each frame (batch generation)
    const generateAllFrames = async () => {
      let frames: (HTMLCanvasElement | OffscreenCanvas)[] = [];

      const persistFrameCanvas = (frameCanvas: HTMLCanvasElement | OffscreenCanvas): void => {
        frames.push(cloneCanvasSimple(frameCanvas));
      };

      // Create yield controller for time-based yielding
      const yieldCtrl = new YieldController();
      yieldCtrl.reset();

      const watermarkImage = await loadWatermarkForAnimation(watermark);

      // Calculate temporal dither mode - only if enabled
      const temporalMode = animation.temporalDither as TemporalDitherMode;
      const useTemporalDither = hasTemporalDither && isTemporalDitherActive(temporalMode);

      // Determine frames to process
      // For GIF compositor, we need to process frames sequentially using apply/dispose
      const useCompositor = gifCompositor && effectiveFrameIndices.length > 0 && overlay.enabled;

      log.debug('animation cache: building', {
        effectiveFrameCount: effectiveFrames.length,
        useCompositor: !!useCompositor,
        hasMultiFrameOverlay,
        shouldGenerateBaseAnimation,
        shouldGenerateStaticOverlayAnimation,
        sampleDelays: effectiveFrames.slice(0, 3).map((f) => f.delay),
      });
      const isScaledOverlayMode = (mode: string | undefined): boolean =>
        mode !== undefined && INTRINSICALLY_SCALED_OVERLAY_MODES.has(mode);
      const previewScanConfigBase = {
        ...debouncedConfig,
        scanGateProfile: 'preview' as const,
        ...(hasMultiFrameOverlay && isScaledOverlayMode(debouncedConfig.overlayMode)
          ? { forceScaledOverlay: true }
          : {}),
      };

      const baseResult = await computeBaseAnimationFramesToProcess({
        shouldGenerateBaseAnimation,
        shouldGenerateStaticOverlayAnimation,
        effectiveFrames,
        hasPattern,
        hasJitter,
        previewScanConfigBase,
        speedMs: animation.speedMs,
        isRunCancelled,
        yieldCtrl,
        computeJitter: computePatternDrivenJitter,
        applyResultPersistent: applyResultPatternStackPersistent,
        applyGeometricTransforms,
      });
      if (!baseResult.framesToProcess || isRunCancelled()) return;
      const framesToProcess = baseResult.framesToProcess;

      if (useCompositor && gifCompositor) {
        gifCompositor.reset();
      }

      const isArtworkMode = overlay.enabled && overlay.mode === 'artwork';
      const qartModule = isArtworkMode ? await loadQArtModule() : null;
      const artworkState = createArtworkFrameState(
        debouncedConfig as unknown as Record<string, unknown>
      );

      const generateArtworkFrame = (
        frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas,
        frameIdx: number
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> =>
        generateArtworkFrameStandalone({
          frameOverlayCanvas,
          frameIdx,
          artworkState,
          qartModule,
          debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
          previewScanConfigBase,
          abortSignal: animationQArtAbortController.signal,
          isRunCancelled,
        });

      await executeFrameGenerationLoop({
        frames,
        framesToProcess,
        isRunCancelled,
        yieldCtrl,
        gifCompositor: gifCompositor ?? null,
        updateGenerationProgress,
        t,
        shouldGenerateBaseAnimation,
        hasPattern,
        hasJitter,
        previewScanConfigBase,
        useTemporalDither,
        temporalMode,
        animationSeed: animation.seed,
        useCompositor: !!(useCompositor && gifCompositor),
        effectiveFrameIndices,
        applyGeometricTransforms,
        scratchPool,
        isArtworkMode,
        generateArtworkFrame,
        modulePatternEffects,
        applyModulePatternEphemeral: applyModulePatternStackEphemeral,
        computeJitter: computePatternDrivenJitter,
        moduleJitterPx: animation.moduleJitterPx,
        resultPatternEffects,
        applyResultEphemeral: applyResultPatternStackEphemeral,
        hasColorCycle,
        watermarkConfig: watermark,
        watermarkImage,
        persistFrameCanvas,
        setCanvas,
        canvasRef,
        getLatestFrame: () => frames[frames.length - 1],
      });

      frames = await finalizeAnimationFrames({
        frames,
        hasInterpolation,
        interpolateMode: animation.interpolate,
        content: debouncedConfig.content,
        isRunCancelled,
        updateGenerationProgress,
        t,
      });

      completeAnimationGeneration({
        frames,
        isRunCancelled,
        replaceAnimationFrames,
        setIsAnimationCacheReady,
        setIsLoading,
        setIsLoadingOverlay,
        clearGenerationProgress,
        setCanvas,
        canvasRef,
      });
    };

    generateAllFrames();

    // Cleanup: cancel in-flight generation if deps change
    // IMPORTANT: Reset loading states to prevent stuck spinner when navigating away and back
    return () => {
      isCancelled = true;
      animationQArtAbortController.abort();
      if (activeAnimationRequestAbortRef.current === animationQArtAbortController) {
        activeAnimationRequestAbortRef.current = null;
      }
      setIsLoading(false);
      setIsLoadingOverlay(false);
      clearGenerationProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveFrames,
    effectiveFrameIndices,
    gifCompositor,
    overlay.enabled,
    debouncedConfig,
    watermark,
    animation.temporalDither,
    animation.seed,
    animation.pattern,
    animation.pattern2,
    animation.target,
    animation.target2,
    animation.waveAxis,
    animation.waveAxis2,
    animation.interpolate,
    animation.speedMs,
    animation.colorCycle,
    animation.moduleJitterPx,
    applyGeometricTransforms,
    clearAnimationFrames,
    overlay.mode,
    replaceAnimationFrames,
    clearGenerationProgress,
    updateGenerationProgress,
    t,
    translateQArtStage,
  ]);

  // Fast-preview is active when the short debounce has fired but the settled
  // debounce hasn't caught up yet.
  const isFastPreview = primaryDebouncedConfig !== settledConfig;

  // Determine if we're still preparing animation
  // This covers: GIF overlays, static overlays with animation effects, and base QR animation effects
  const hasMultiFrameContent = (gifCompositor?.frameCount || 0) > 1 || gifFrames.length > 1;
  const hasAnimationEffectsEnabled =
    animation.colorCycle ||
    animation.pattern !== 'none' ||
    animation.pattern2 !== 'none' ||
    animation.temporalDither !== 'off' ||
    animation.moduleJitterPx > 0;

  // Show preparing state when:
  // 1. We're loading an overlay file (GIF parsing, etc.), OR
  // 2. We have multi-frame GIF content and cache isn't ready, OR
  // 3. We have animation effects enabled (on static image or no overlay) and cache isn't ready
  const isPreparingAnimation =
    isLoadingOverlay ||
    (!isAnimationCacheReady && hasMultiFrameContent) ||
    (!isAnimationCacheReady &&
      hasAnimationEffectsEnabled &&
      animationFrameCount === 0 &&
      isLoading);

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    canvas,
    isLoading,
    isExporting,
    isRendering,
    isPending: pendingVisible, // Use delayed version to avoid immediate blur while typing
    error,
    regenerate,
    cancelGeneration,
    download,
    // Animation state
    isAnimating,
    currentFrame,
    totalFrames: playbackFrameCount || effectiveFrames.length,
    // True when we have multi-frame content but animation cache isn't ready yet
    isPreparingAnimation,
    // Safety warnings
    safetyWarnings,
    // Validation
    validation,
    isValidating,
    // Busy feedback
    busyStage: generationProgress?.stage ?? null,
    busyProgress: generationProgress?.percent ?? null,
    // Fast preview
    isFastPreview,
    // Animation frames for GIF export
    animationFrames: animationFramesRef.current,
    animationFramesRevision,
  };
}
