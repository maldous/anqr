/**
 * useQRGenerator Hook
 * Wires the QR store state to the QRGenerator module for live rendering
 * Supports animated GIF overlays
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { prepareInterstitial, showInterstitial } from '@/modules/admob-service';
import {
  type AnimationFrame,
  applyColorCycle,
  createGifCompositor,
  decimateCompositorFrames,
  type GifCompositor,
  parseAnimatedImage,
} from '@/modules/animation';
import {
  type AnimationPattern,
  generatePatternFrames,
  interpolateFrames,
} from '@/modules/animation-patterns';
import { downloadGif, downloadImage, downloadSvg, downloadVectorSvg } from '@/modules/exporter';
import { getEffectiveDitherKind, STORE_DEFAULT_DITHER } from '@/modules/overlay-processor';
import { QRGenerator } from '@/modules/qr-generator';
// Note: applyFilters is no longer used here - color adjustments are done at moduleCount
// resolution inside qr-generator.js for 10-50x speedup
import { type ValidationResult, validateQRCodeRobust } from '@/modules/qr-scanner';
import {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  isTemporalDitherActive,
  type TemporalDitherMode,
} from '@/modules/temporal-dither';
import { applyWatermark } from '@/modules/watermark';
import { useQRStore } from '@/store/qr-store';

// Singleton QR generator instance
const qrGenerator = new QRGenerator();

// Target FPS for preview mode (source GIFs above this will be decimated)
const _PREVIEW_TARGET_FPS = 15;

// Yield interval: yield after this many ms of processing to keep UI responsive
const YIELD_INTERVAL_MS = 16; // ~60fps frame budget

/**
 * Yield to main thread to prevent UI blocking during heavy computation
 * Uses requestIdleCallback with timeout fallback for mobile performance
 */
function yieldToMainThread(timeout = 50): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'undefined') {
      // Fallback for browsers without requestIdleCallback
      setTimeout(resolve, 0);
    } else {
      requestIdleCallback(() => resolve(), { timeout });
    }
  });
}

/**
 * Time-based yield checker for batched operations
 * Returns true if enough time has passed that we should yield
 */
class YieldController {
  private lastYieldTime: number = 0;

  reset(): void {
    this.lastYieldTime = performance.now();
  }

  shouldYield(): boolean {
    const now = performance.now();
    if (now - this.lastYieldTime >= YIELD_INTERVAL_MS) {
      return true;
    }
    return false;
  }

  async yieldIfNeeded(): Promise<boolean> {
    if (this.shouldYield()) {
      await yieldToMainThread(8); // Short timeout for responsive yielding
      this.lastYieldTime = performance.now();
      return true;
    }
    return false;
  }
}

interface UseQRGeneratorResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | null;
  isLoading: boolean;
  isExporting: boolean;
  isRendering: boolean; // True when actively rendering (after debounce, during generation)
  isPending: boolean; // True when config has changed but debounce hasn't settled yet
  error: string | null;
  regenerate: () => Promise<void>;
  download: () => Promise<void>;
  // Animation state
  isAnimating: boolean;
  currentFrame: number;
  totalFrames: number;
  // True when we have multi-frame content but animation cache isn't ready yet
  isPreparingAnimation: boolean;
  // Safety warnings
  safetyWarnings: string[];
  // Validation
  validation: ValidationResult | null;
  isValidating: boolean;
  // Animation frames for GIF export
  animationFrames: HTMLCanvasElement[];
}

/**
 * Debounce helper
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Load a File as a canvas element
 */
async function loadFileAsCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string') {
        img.src = dataUrl;
      } else {
        reject(new Error('Invalid file data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Expose animation state globally for external tools (e.g., gallery generator)
declare global {
  // eslint-disable-next-line no-var
  var __ANQR_STATE__:
    | {
        isLoading: boolean;
        isAnimationReady: boolean;
        animationFrameCount: number;
        currentFrame: number;
        animationFrames: HTMLCanvasElement[];
        animationSpeedMs: number;
        frameDelays: number[]; // Original frame delays from source GIF in ms
      }
    | undefined;
}

export function useQRGenerator(): UseQRGeneratorResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRendering, setIsRendering] = useState(false); // Active rendering state
  const [isPending, setIsPending] = useState(false); // Config changed, waiting for debounce
  const [error, setError] = useState<string | null>(null);
  const [overlayCanvas, setOverlayCanvas] = useState<HTMLCanvasElement | null>(null);

  // Animation state
  const [gifFrames, setGifFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationDirection = useRef<1 | -1>(1);
  const lastFrameTime = useRef(0);
  const animationRef = useRef<number | null>(null);

  // GIF Compositor for optimal patch-only decoding (no per-frame canvas allocation)
  const [gifCompositor, setGifCompositor] = useState<GifCompositor | null>(null);

  // Store raw overlay canvas before preprocessing
  const [rawOverlayCanvas, setRawOverlayCanvas] = useState<HTMLCanvasElement | null>(null);

  // Track when we're loading/parsing an overlay file (prevents busy overlay flickering)
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // QR matrix for vector SVG export
  const [qrMatrix, setQrMatrix] = useState<boolean[][] | null>(null);

  // Store generated frames for GIF export and playback cache
  const [animationFrames, setAnimationFrames] = useState<HTMLCanvasElement[]>([]);
  const [isAnimationCacheReady, setIsAnimationCacheReady] = useState(false);

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
    const warnings: string[] = [];
    let adjustedModulePx = render.modulePx;
    let adjustedQuietZone = qr.quietZoneModules;
    let adjustedIntensity = overlay.intensity;
    const effectiveEcc = auto.pickEcc ? autoPickedEcc : qr.ecc;

    // Apply safety mode constraints
    if (safety.mode !== 'off') {
      // Enforce minimum module size
      if (render.modulePx < safety.minModulePx) {
        adjustedModulePx = safety.minModulePx;
        warnings.push(`Module size increased to ${safety.minModulePx}px for scannability`);
      }

      // Enforce minimum quiet zone
      if (qr.quietZoneModules < safety.minQuietZoneModules) {
        adjustedQuietZone = safety.minQuietZoneModules;
        warnings.push(`Quiet zone increased to ${safety.minQuietZoneModules} modules`);
      }

      // Check overlay intensity against ECC capacity
      const maxIntensityByEcc: Record<string, number> = { L: 30, M: 50, Q: 70, H: 85 };
      const maxSafeIntensity = maxIntensityByEcc[effectiveEcc] || 50;

      if (safety.mode === 'strict' && overlay.enabled && overlay.intensity > maxSafeIntensity) {
        adjustedIntensity = maxSafeIntensity;
        warnings.push(
          `Overlay intensity reduced to ${maxSafeIntensity}% for ECC level ${effectiveEcc}`
        );
      } else if (
        safety.mode === 'balanced' &&
        overlay.enabled &&
        overlay.intensity > maxSafeIntensity
      ) {
        warnings.push(
          `Overlay intensity (${overlay.intensity}%) may reduce scannability with ECC ${effectiveEcc}`
        );
      }

      // Auto-reduce intensity if enabled
      if (
        auto.reduceIntensityUntilSafe &&
        overlay.enabled &&
        overlay.intensity > maxSafeIntensity
      ) {
        adjustedIntensity = maxSafeIntensity;
        warnings.push(`Auto-reduced overlay intensity to ${maxSafeIntensity}% for safe scanning`);
      }

      // Warn about risky style combinations
      if (render.moduleGapPercent > 20) {
        warnings.push('Large module gaps may affect QR readability');
      }

      if (render.moduleStyle === 'dots' && render.moduleGapPercent > 10) {
        warnings.push('Dots with large gaps may be hard to scan');
      }
    }

    // Show auto-pick ECC info
    if (auto.pickEcc && autoPickedEcc !== qr.ecc) {
      warnings.push(`Auto-selected ECC level ${autoPickedEcc} for optimal balance`);
    }

    return {
      safetyAdjustedConfig: {
        modulePx: adjustedModulePx,
        quietZone: adjustedQuietZone,
        intensity: adjustedIntensity,
        ecc: effectiveEcc,
      },
      safetyWarnings: warnings,
    };
  }, [
    safety.mode,
    safety.minModulePx,
    safety.minQuietZoneModules,
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

  // Build comprehensive config object for QRGenerator
  // CRITICAL: We must depend on `payload` to trigger re-renders when payload changes
  // getPayloadText is a stable function reference - it doesn't change when payload changes
  const config = useMemo(() => {
    // Force dependency on payload by accessing it (even if getPayloadText reads it internally)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _payloadDep = payload;
    const content = getPayloadText();

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
      overlayMode: overlay.enabled ? overlay.mode : undefined,
      overlayIntensity: safetyAdjustedConfig.intensity,
      colorMode: overlay.colorMode,
      invertImage: overlay.invert,
      preserveFinders: overlay.preserveFinders || safety.lockFinders,
      preserveTiming: overlay.preserveTiming || safety.lockTiming,
      preserveAlignment: overlay.preserveAlignment || safety.lockAlign,
      protectFormatInfo: overlay.protectFormatInfo || safety.lockFormat,
      protectVersionInfo: overlay.protectVersionInfo || safety.lockVersion,
      logoSize: 25, // For center mode

      // Overlay preprocessing
      overlayBrightness: overlay.brightness,
      overlayContrast: overlay.contrast,
      overlayGamma: overlay.gamma,
      overlaySaturation: overlay.saturation,
      overlayHueRotate: overlay.hueRotateDeg,
      overlayBlur: overlay.blurPx,
      overlaySharpen: overlay.sharpen,
      overlayPosterize: overlay.posterizeLevels,
      overlayThreshold: overlay.threshold,
      overlayEdgeDetect: overlay.edgeDetect,
      // NOTE: Geometric transforms (rotate, flip, crop, fit) are applied in
      // applyGeometricTransforms() BEFORE passing to qr-generator.
      // We intentionally do NOT pass these values to avoid double-application.
      // overlayRotate, overlayFlipX, overlayFlipY, overlayCrop, overlayFit are omitted.

      // Dither options - on mobile, use cheap default unless user explicitly changed it
      ditherKind: getEffectiveDitherKind(
        overlay.ditherKind,
        overlay.ditherKind === STORE_DEFAULT_DITHER
      ),
      ditherStrength: overlay.ditherStrength,
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
    getPayloadText,
    payload, // CRITICAL: Must depend on payload to trigger updates when content changes
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
  ]);

  // Debounce config changes to prevent excessive regeneration
  // 300ms is a good balance for slow phones while remaining responsive
  const debouncedConfig = useDebounce(config, 300);

  // Create stable content hashes for change detection
  // This avoids false triggers from object reference changes on remount
  const configHash = useMemo(() => JSON.stringify(config), [config]);
  const debouncedConfigHash = useMemo(() => JSON.stringify(debouncedConfig), [debouncedConfig]);

  // Track when config changes but debounce hasn't settled yet
  // Uses content hashing instead of object reference comparison
  // isPending is true when config has changed but debounce hasn't caught up yet
  useEffect(() => {
    setIsPending(configHash !== debouncedConfigHash);
  }, [configHash, debouncedConfigHash]);

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
    (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
      // Check if any geometric transforms are needed
      const needsTransform =
        overlay.rotateDeg !== 0 ||
        overlay.flipX ||
        overlay.flipY ||
        overlay.cropEnabled ||
        !!overlay.fit;

      if (!needsTransform) {
        return sourceCanvas;
      }

      // First apply crop if enabled
      let workingCanvas = sourceCanvas;
      if (overlay.cropEnabled && overlay.cropRegion) {
        const { x, y, size } = overlay.cropRegion;
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return sourceCanvas;

        const srcWidth = sourceCanvas.width;
        const srcHeight = sourceCanvas.height;
        const cropW = srcWidth * size;
        const cropH = srcHeight * size;
        const cropX = Math.max(0, (x - size / 2) * srcWidth);
        const cropY = Math.max(0, (y - size / 2) * srcHeight);

        const outputSize = Math.min(cropW, cropH);
        cropCanvas.width = outputSize;
        cropCanvas.height = outputSize;

        cropCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, outputSize, outputSize);
        workingCanvas = cropCanvas;
      }

      // Apply fit mode if specified
      if (overlay.fit) {
        const fitCanvas = document.createElement('canvas');
        const fitCtx = fitCanvas.getContext('2d');
        if (!fitCtx) return workingCanvas;
        const srcW = workingCanvas.width;
        const srcH = workingCanvas.height;
        const targetSize = Math.max(srcW, srcH);

        fitCanvas.width = targetSize;
        fitCanvas.height = targetSize;

        let drawX = 0,
          drawY = 0,
          drawW = srcW,
          drawH = srcH;

        if (overlay.fit === 'cover') {
          const scale = Math.max(targetSize / srcW, targetSize / srcH);
          drawW = srcW * scale;
          drawH = srcH * scale;
          drawX = (targetSize - drawW) / 2;
          drawY = (targetSize - drawH) / 2;
        } else if (overlay.fit === 'contain') {
          const scale = Math.min(targetSize / srcW, targetSize / srcH);
          drawW = srcW * scale;
          drawH = srcH * scale;
          drawX = (targetSize - drawW) / 2;
          drawY = (targetSize - drawH) / 2;
          fitCtx.fillStyle = 'transparent';
          fitCtx.fillRect(0, 0, targetSize, targetSize);
        } else if (overlay.fit === 'stretch') {
          drawW = targetSize;
          drawH = targetSize;
        }

        fitCtx.drawImage(workingCanvas, drawX, drawY, drawW, drawH);
        workingCanvas = fitCanvas;
      }

      // Apply rotation and flip if needed
      if (overlay.rotateDeg !== 0 || overlay.flipX || overlay.flipY) {
        const processedCanvas = document.createElement('canvas');
        const ctx = processedCanvas.getContext('2d');
        if (!ctx) return workingCanvas;
        const angle = (overlay.rotateDeg * Math.PI) / 180;
        const isRightAngle = overlay.rotateDeg === 90 || overlay.rotateDeg === 270;

        if (isRightAngle) {
          processedCanvas.width = workingCanvas.height;
          processedCanvas.height = workingCanvas.width;
        } else {
          processedCanvas.width = workingCanvas.width;
          processedCanvas.height = workingCanvas.height;
        }

        ctx.save();
        ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);

        if (overlay.rotateDeg !== 0) {
          ctx.rotate(angle);
        }
        if (overlay.flipX) {
          ctx.scale(-1, 1);
        }
        if (overlay.flipY) {
          ctx.scale(1, -1);
        }

        ctx.drawImage(workingCanvas, -workingCanvas.width / 2, -workingCanvas.height / 2);
        ctx.restore();
        workingCanvas = processedCanvas;
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
      // Use GIF compositor for optimal patch-only decoding
      // Use modern Blob#arrayBuffer() API instead of FileReader
      overlay.file
        .arrayBuffer()
        .then((arrayBuffer) => {
          try {
            const compositor = createGifCompositor(arrayBuffer);
            setGifCompositor(compositor);
            setGifFrames([]); // Clear legacy frames
            setCurrentFrame(0);

            // Apply first frame to get initial canvas
            compositor.reset();
            compositor.apply(0);
            setRawOverlayCanvas(compositor.canvas);
            // Note: Don't clear isLoadingOverlay here - wait for animation cache to be ready
          } catch (err) {
            console.error('Failed to create GIF compositor:', err);
            setGifCompositor(null);
            // Fall back to static image loading
            const file = overlay.file;
            if (!file) return;
            loadFileAsCanvas(file)
              .then((canvas) => {
                setRawOverlayCanvas(canvas);
                setGifFrames([{ canvas, delay: 100, disposalType: 0 }]);
                setIsLoadingOverlay(false);
              })
              .catch(() => {
                setRawOverlayCanvas(null);
                setIsLoadingOverlay(false);
              });
          }
        })
        .catch((err) => {
          console.error('Failed to read GIF file:', err);
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    } else if (isAnimatedWebP) {
      // Use legacy parseAnimatedImage for WebP (compositor only supports GIF)
      // Use modern Blob#arrayBuffer() API instead of FileReader
      overlay.file
        .arrayBuffer()
        .then(async (arrayBuffer) => {
          try {
            const frames = await parseAnimatedImage(arrayBuffer);
            setGifFrames(frames);
            setGifCompositor(null);
            setCurrentFrame(0);
            if (frames.length > 0) {
              setRawOverlayCanvas(frames[0].canvas);
            }
            // Note: Don't clear isLoadingOverlay here for multi-frame - wait for animation cache
            if (frames.length <= 1) {
              setIsLoadingOverlay(false);
            }
          } catch (err) {
            console.error('Failed to parse animated WebP:', err);
            const file = overlay.file;
            if (!file) return;
            loadFileAsCanvas(file)
              .then((canvas) => {
                setRawOverlayCanvas(canvas);
                setGifFrames([{ canvas, delay: 100, disposalType: 0 }]);
                setIsLoadingOverlay(false);
              })
              .catch(() => {
                setRawOverlayCanvas(null);
                setIsLoadingOverlay(false);
              });
          }
        })
        .catch((err) => {
          console.error('Failed to read WebP file:', err);
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    } else {
      // Static image (PNG, JPG, etc.)
      setGifFrames([]);
      setGifCompositor(null);
      loadFileAsCanvas(overlay.file)
        .then((canvas) => {
          setRawOverlayCanvas(canvas);
          setIsLoadingOverlay(false);
        })
        .catch((err) => {
          console.error('Failed to load overlay:', err);
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    }
  }, [overlay.file]);

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
    setIsLoading(true);
    setError(null);

    // CRITICAL: Yield to browser to allow React to render the loading state
    // before starting expensive QR generation. Without this, the busy overlay
    // may not appear because the heavy computation blocks the UI thread.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        // Double-RAF ensures the browser has completed painting
        requestAnimationFrame(() => resolve());
      });
    });

    setIsRendering(true);

    try {
      // Generate QR code
      let result = await qrGenerator.generate(
        debouncedConfig,
        overlay.enabled ? overlayCanvas : null
      );

      // Apply watermark if enabled
      if (watermark.enabled && result) {
        let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;

        if ((watermark.kind === 'image' || watermark.kind === 'pattern') && watermark.image) {
          // Load watermark image (used for both image and pattern types)
          watermarkImage = await loadFileAsCanvas(watermark.image);
        }

        const watermarked = applyWatermark(result, {
          enabled: watermark.enabled,
          kind: watermark.kind,
          text: watermark.text,
          image: watermarkImage,
          position: watermark.position,
          opacity: watermark.opacity,
          blend: watermark.blend,
        });

        result = watermarked.canvas;
      }

      setCanvas(result);

      // Capture the QR matrix for vector SVG export
      const matrixData = qrGenerator.getLastMatrix();
      if (matrixData) {
        setQrMatrix(matrixData.matrix);
      }

      // Copy to display canvas if ref exists
      if (canvasRef.current && result) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = result.width;
          canvasRef.current.height = result.height;
          ctx.drawImage(result, 0, 0);
        }
      }

      // Validate the generated QR code (skip during animation playback for performance)
      // Validation will run when animation is paused or for static QR codes
      const isCurrentlyAnimating = animationFrames.length > 1 && animation.playing;
      const shouldValidate = result && debouncedConfig.content && !isCurrentlyAnimating;
      if (shouldValidate) {
        setIsValidating(true);
        // Use setTimeout to not block the main thread
        setTimeout(() => {
          try {
            const validationResult = validateQRCodeRobust(result, debouncedConfig.content);
            setValidation(validationResult);
          } catch (err) {
            console.error('Validation error:', err);
            setValidation(null);
          } finally {
            setIsValidating(false);
          }
        }, 50);
      }
    } catch (err) {
      console.error('QR generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      // Dispatch render-complete event with error
      document.dispatchEvent(
        new CustomEvent('anqr:render-complete', {
          detail: { success: false, error: errorMessage },
        })
      );
    } finally {
      setIsRendering(false);
      setIsLoading(false);
      // Dispatch render-complete event on success (no error was thrown)
      if (!error) {
        document.dispatchEvent(
          new CustomEvent('anqr:render-complete', {
            detail: { success: true, error: null },
          })
        );
      }
    }
  }, [
    debouncedConfig,
    overlay.enabled,
    overlayCanvas,
    watermark.enabled,
    watermark.kind,
    watermark.text,
    watermark.image,
    watermark.position,
    watermark.opacity,
    watermark.blend,
    animation.playing,
    animationFrames.length,
    error,
  ]);

  // Regenerate when config changes
  // Skip if we're playing from cached animation frames
  useEffect(() => {
    // If we have cached animation frames and animation is playing, don't regenerate
    // The cached frames will be displayed by the animation playback effect
    if (isAnimationCacheReady && animationFrames.length > 1 && animation.playing) {
      return;
    }
    generate();
  }, [generate, isAnimationCacheReady, animationFrames.length, animation.playing]);

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
    if (candidateIndices.length > 1 && overlay.gifMaxFps > 0 && gifCompositor) {
      // Use compositor-based decimation for GIFs
      const allIndices = decimateCompositorFrames(gifCompositor, overlay.gifMaxFps);
      // Filter to only keep indices that are in our candidate set
      candidateIndices = candidateIndices.filter((i) => allIndices.includes(i));
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
      return effectiveFrameIndices.map((i) => ({
        canvas: gifCompositor.canvas, // Note: this is the same canvas, caller must use compositor.apply(i)
        delay: gifCompositor.delayMs(i),
        disposalType: 0, // Compositor handles disposal internally
      }));
    }
    // Legacy path for WebP
    return effectiveFrameIndices.map((i) => gifFrames[i]).filter(Boolean);
  }, [gifCompositor, gifFrames, effectiveFrameIndices]);

  // Expose state to window for external tools (gallery generator)
  // NOTE: We intentionally DON'T store animationFrames directly to avoid pinning
  // large canvases in memory. External tools should use getAnimationFrames() getter.
  useEffect(() => {
    // Get original frame delays from parsed GIF frames
    const frameDelays = effectiveFrames.map((f) => f.delay || 100);

    globalThis.__ANQR_STATE__ = {
      isLoading,
      isAnimationReady: isAnimationCacheReady && animationFrames.length > 1,
      animationFrameCount: animationFrames.length,
      currentFrame,
      // Use getter function instead of direct reference to allow GC when not actively used
      get animationFrames() {
        return animationFrames;
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
    animationFrames,
    currentFrame,
    animation.speedMs,
    effectiveFrames,
  ]);

  // Determine the total frame count for animation playback
  // This handles both overlay-based animations (effectiveFrames) and base QR animations (animationFrames)
  const playbackFrameCount = useMemo(() => {
    if (effectiveFrames.length > 1) return effectiveFrames.length;
    if (isAnimationCacheReady && animationFrames.length > 1) return animationFrames.length;
    return 0;
  }, [effectiveFrames.length, isAnimationCacheReady, animationFrames.length]);

  // Animation loop for both overlay-based and base QR animations
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

    const tick = (now: number) => {
      const elapsed = now - lastFrameTime.current;
      // Use configured speed (frames have their own delays but we use speedMs for consistency)
      const frameDelay = animation.speedMs;

      if (elapsed >= frameDelay) {
        lastFrameTime.current = now;

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
  }, [playbackFrameCount, animation.playing, animation.speedMs, animation.loop, animation.bounce]);

  // Update overlay canvas when current frame changes (for animation preview)
  // Uses compositor for GIFs (optimal), legacy frames for WebP
  // OPTIMIZATION: Track last rendered frame to avoid O(n²) replay from frame 0
  const lastRenderedFrameRef = useRef<number>(-1);

  useEffect(() => {
    // If we have cached animation frames, skip - we'll draw from cache
    if (isAnimationCacheReady && animationFrames.length > 0) {
      return;
    }

    const frameIdx = effectiveFrameIndices[currentFrame];
    if (frameIdx === undefined) return;

    if (gifCompositor) {
      // Use compositor for GIF - apply frame patch to canvas
      // OPTIMIZATION: Only replay from lastRenderedFrame instead of always from 0
      // This reduces O(n²) to O(n) for sequential playback
      const lastRendered = lastRenderedFrameRef.current;

      if (lastRendered < 0 || frameIdx < lastRendered) {
        // Need to reset and replay from start (seeking backward or first frame)
        gifCompositor.reset();
        for (let i = 0; i <= frameIdx; i++) {
          if (i > 0) gifCompositor.dispose(i - 1);
          gifCompositor.apply(i);
        }
      } else if (frameIdx > lastRendered) {
        // Playing forward - only apply frames from lastRendered+1 to frameIdx
        for (let i = lastRendered + 1; i <= frameIdx; i++) {
          if (i > 0) gifCompositor.dispose(i - 1);
          gifCompositor.apply(i);
        }
      }
      // If frameIdx === lastRendered, no work needed

      lastRenderedFrameRef.current = frameIdx;
      // Trigger re-render with updated compositor canvas
      setRawOverlayCanvas(gifCompositor.canvas);
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
    animationFrames.length,
  ]);

  // Reset the frame tracking when compositor changes (new GIF loaded)
  useEffect(() => {
    lastRenderedFrameRef.current = -1;
  }, []);

  // Display cached animation frames during playback (fast path - no re-encoding)
  useEffect(() => {
    if (isAnimationCacheReady && animationFrames.length > 1 && animationFrames[currentFrame]) {
      const cachedFrame = animationFrames[currentFrame];

      // Draw directly to display canvas (skip setCanvas during playback to avoid re-renders)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = cachedFrame.width;
          canvasRef.current.height = cachedFrame.height;
          ctx.drawImage(cachedFrame, 0, 0);
        }
      }
    }
  }, [currentFrame, isAnimationCacheReady, animationFrames]);

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

      // Scale canvas to output dimensions if different
      let exportCanvas = canvas;
      if (output.widthPx !== canvas.width || output.heightPx !== canvas.height) {
        exportCanvas = document.createElement('canvas');
        exportCanvas.width = output.widthPx;
        exportCanvas.height = output.heightPx;
        const exportCtx = exportCanvas.getContext('2d');
        if (exportCtx) {
          // Use high-quality scaling
          exportCtx.imageSmoothingEnabled = !render.crispEdges;
          exportCtx.imageSmoothingQuality = 'high';
          exportCtx.drawImage(canvas, 0, 0, output.widthPx, output.heightPx);
        }
      }

      const exportConfig = {
        outputFormat: output.format,
        outputWidth: output.widthPx,
        outputHeight: output.heightPx,
        outputQuality: output.quality,
        filename: output.filename,
        dpi: output.dpi,
        // Output options
        includeQuietZone: output.includeQuietZone,
        bgOverride: output.bgOverride,
        // GIF options
        gifPaletteSize: output.gifPaletteSize,
        gifQuantizer: output.gifQuantizer,
        gifDither: output.gifDither,
        gifTransparentColor: output.gifTransparentColor,
        gifDisposal: output.gifDisposal,
        // SVG options
        svgTrueVector: output.svgTrueVector,
        svgShapePrecision: output.svgShapePrecision,
        svgEmbedRasterOverlay: output.svgEmbedRasterOverlay,
        // Metadata
        metadata: {
          title: metadata.title || undefined,
          author: metadata.author || undefined,
          copyright: metadata.copyright || undefined,
          license: metadata.license || undefined,
          description: metadata.description || undefined,
          creationTime: metadata.creationTime,
          customKv: metadata.customKv.filter((kv) => kv.k && kv.v),
        },
      };

      // Build PNG metadata object for embedding
      const pngMetadata =
        metadata.title || metadata.author || metadata.copyright || metadata.description
          ? {
              title: metadata.title || undefined,
              author: metadata.author || undefined,
              copyright: metadata.copyright || undefined,
              description: metadata.description || undefined,
              creationTime: metadata.creationTime ? new Date().toISOString() : undefined,
              software: 'ANQR - https://anqr.link',
            }
          : undefined;

      if (output.format === 'svg') {
        // Use true vector SVG export if enabled and matrix is available
        if (output.svgTrueVector) {
          if (!qrMatrix) {
            console.warn(
              'Vector SVG export requested but QR matrix is unavailable. ' +
                'Falling back to raster SVG. This can happen with special render modes.'
            );
            await downloadSvg(exportCanvas, exportConfig);
            return;
          }
          // Calculate module size to match desired output dimensions
          const moduleCount = qrMatrix.length;
          // Use the same margin calculation as generate() in qr-generator.js
          // config.margin = safetyAdjustedConfig.quietZone + qr.borderModulesExtra
          const totalMargin = qr.quietZoneModules + qr.borderModulesExtra;
          // SVG viewBox size = (moduleCount + 2*margin) * moduleSize
          const svgModuleSize = Math.floor(output.widthPx / (moduleCount + totalMargin * 2)) || 10;

          // True vector SVG - uses styled path elements
          downloadVectorSvg(qrMatrix, {
            moduleSize: svgModuleSize,
            margin: totalMargin,
            fgColor: render.fgColor,
            bgColor: render.bgTransparent ? 'transparent' : render.bgColor,
            filename: output.filename,
            // Pass styling options for vector SVG
            moduleStyle: render.moduleStyle,
            cornerRadius: render.cornerRadius,
            finderStyle: render.finderStyle,
            eyeOuterStyle: render.eyeOuterStyle,
            eyeInnerStyle: render.eyeInnerStyle,
            alignmentStyle: render.alignmentStyle,
            timingStyle: render.timingStyle,
            gradient: render.gradient,
            // Pass metadata for SVG embedding
            metadata:
              metadata.title || metadata.author || metadata.copyright || metadata.description
                ? {
                    title: metadata.title || undefined,
                    author: metadata.author || undefined,
                    copyright: metadata.copyright || undefined,
                    description: metadata.description || undefined,
                    creationTime: metadata.creationTime,
                    software: 'ANQR - https://anqr.link',
                  }
                : undefined,
          });
        } else {
          // Raster SVG (embedded PNG) - preserves all styling including dithering
          await downloadSvg(exportCanvas, exportConfig);
        }
      } else if (output.format === 'gif' && animationFrames.length > 1) {
        // Scale animation frames to output dimensions
        // Use canvas pool for temporary scaled frames to reduce GC pressure
        const scaledFrames = animationFrames.map((frame) => {
          if (frame.width === output.widthPx && frame.height === output.heightPx) {
            return frame;
          }
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = output.widthPx;
          scaledCanvas.height = output.heightPx;
          const scaledCtx = scaledCanvas.getContext('2d');
          if (scaledCtx) {
            scaledCtx.imageSmoothingEnabled = !render.crispEdges;
            scaledCtx.imageSmoothingQuality = 'high';
            scaledCtx.drawImage(frame, 0, 0, output.widthPx, output.heightPx);
          }
          return scaledCanvas;
        });

        // Calculate frame delays - use original GIF delays if enabled, otherwise use animation speed
        let frameDelays: number[] | undefined;
        if (overlay.gifUseFrameDelays && effectiveFrames.length > 0) {
          // Use original frame delays from source GIF, capped by maxFps
          const minDelayMs = overlay.gifMaxFps > 0 ? Math.floor(1000 / overlay.gifMaxFps) : 0;
          frameDelays = effectiveFrames.map((f) =>
            Math.max(f.delay || animation.speedMs, minDelayMs)
          );
        } else if (animationFrames.length > 1 && effectiveFrames.length === 0) {
          // For base QR animations (no overlay), use uniform animation speed
          frameDelays = animationFrames.map(() => animation.speedMs);
        }

        // Export animated GIF with all frames
        await downloadGif(
          scaledFrames,
          {
            ...exportConfig,
            animationSpeed: animation.speedMs,
            loopAnimation: animation.loop,
          },
          frameDelays
        );

        // Note: We intentionally don't release scaled canvases back to the pool here
        // because downloadGif is async and may still be using the canvas data.
        // The canvases will be garbage collected naturally after export completes.
      } else if (output.format === 'gif') {
        // Single frame GIF
        await downloadGif([exportCanvas], exportConfig);
      } else {
        await downloadImage(exportCanvas, exportConfig, pngMetadata, output.dpi);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [
    canvas,
    output,
    render.crispEdges,
    render.fgColor,
    render.bgColor,
    render.bgTransparent,
    render.moduleStyle,
    render.cornerRadius,
    render.finderStyle,
    render.eyeOuterStyle,
    render.eyeInnerStyle,
    render.alignmentStyle,
    render.timingStyle,
    render.gradient,
    qr.quietZoneModules,
    qr.borderModulesExtra,
    qrMatrix,
    animationFrames,
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

    // ==========================================
    // ANIMATION EFFECT FLAGS - only true when actually enabled
    // ==========================================
    const hasColorCycle = animation.colorCycle === true;
    const hasPattern = animation.pattern !== 'none';
    const hasTemporalDither = animation.temporalDither !== 'off';
    const hasInterpolation = animation.interpolate !== 'none';
    const hasJitter = animation.moduleJitterPx > 0;

    // True only if at least one animation effect is actually enabled
    const hasAnyAnimationEffect = hasColorCycle || hasPattern || hasTemporalDither || hasJitter;

    // Check if we should generate pattern-based animation from static overlay image
    const shouldGeneratePatternAnimation =
      hasPattern && overlay.enabled && effectiveFrames.length === 1;

    // Check if we should generate animation from base QR (no overlay)
    // Only when at least one effect is actually enabled
    const shouldGenerateBaseAnimation = hasAnyAnimationEffect && !overlay.enabled;

    // Check if we should generate animation effects on a static overlay image
    // This handles colorCycle, temporalDither, jitter on single-frame overlays
    const shouldGenerateStaticOverlayAnimation =
      hasAnyAnimationEffect && overlay.enabled && effectiveFrames.length === 1;

    // Early return only if no animation is needed
    // For multi-frame overlays (animated GIFs), we need to generate frames regardless of other animation effects
    const hasMultiFrameOverlay = effectiveFrames.length > 1 && overlay.enabled;

    // OPTIMIZATION: If we have a single static overlay with NO animation effects enabled,
    // skip batch frame generation entirely - the normal generate() path handles this
    if (
      !(
        hasMultiFrameOverlay ||
        shouldGeneratePatternAnimation ||
        shouldGenerateBaseAnimation ||
        shouldGenerateStaticOverlayAnimation
      )
    ) {
      setAnimationFrames([]);
      setIsAnimationCacheReady(false);
      return;
    }

    // Mark cache as not ready while generating
    setIsAnimationCacheReady(false);
    setIsLoading(true);

    // Generate QR for each frame (batch generation)
    const generateAllFrames = async () => {
      let frames: HTMLCanvasElement[] = [];

      // Create yield controller for time-based yielding
      const yieldCtrl = new YieldController();
      yieldCtrl.reset();

      // Load watermark image once if needed (for both image and pattern types)
      let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;
      if (
        watermark.enabled &&
        (watermark.kind === 'image' || watermark.kind === 'pattern') &&
        watermark.image
      ) {
        try {
          watermarkImage = await loadFileAsCanvas(watermark.image);
        } catch (err) {
          console.error('Error loading watermark:', err);
        }
      }

      // Calculate temporal dither mode - only if enabled
      const temporalMode = animation.temporalDither as TemporalDitherMode;
      const useTemporalDither = hasTemporalDither && isTemporalDitherActive(temporalMode);

      // Determine frames to process
      // For GIF compositor, we need to process frames sequentially using apply/dispose
      let framesToProcess = effectiveFrames;
      const useCompositor = gifCompositor && effectiveFrameIndices.length > 0 && overlay.enabled;

      // Generate animation frames for base QR (no overlay)
      if (shouldGenerateBaseAnimation) {
        const frameCount = 24;

        // Check if we need per-frame QR generation (for moduleJitter)
        const needsPerFrameQR = hasJitter;

        if (hasPattern && !needsPerFrameQR) {
          // Generate base QR once, then apply pattern animation
          const baseQR = await qrGenerator.generate(debouncedConfig, null);
          if (!baseQR || isCancelled) return;

          const patternFrames = generatePatternFrames(
            baseQR,
            animation.pattern as AnimationPattern,
            frameCount,
            animation.seed
          );
          framesToProcess = patternFrames.map((canvas) => ({
            canvas,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else if (hasPattern && needsPerFrameQR) {
          // Generate QR per frame for jitter, then apply pattern
          // First generate all pattern frames from a base QR to get the pattern progression
          const baseQR = await qrGenerator.generate(debouncedConfig, null);
          if (!baseQR || isCancelled) return;

          const _basePatternFrames = generatePatternFrames(
            baseQR,
            animation.pattern as AnimationPattern,
            frameCount,
            animation.seed
          );

          // Now generate jittered QR frames and combine with pattern effects
          const combinedFrames: HTMLCanvasElement[] = [];
          for (let i = 0; i < frameCount; i++) {
            if (isCancelled) return;

            // Time-based yielding for smoother UI
            if (await yieldCtrl.yieldIfNeeded()) {
              if (isCancelled) return;
            }

            // Generate QR with jitter for this frame
            const frameConfig = { ...debouncedConfig, frameIndex: i };
            const jitteredQR = await qrGenerator.generate(frameConfig, null);
            if (!jitteredQR) continue;

            // Apply the same pattern effect that would be at this frame index
            // by generating pattern frames for this specific jittered QR
            const patternForFrame = generatePatternFrames(
              jitteredQR,
              animation.pattern as AnimationPattern,
              frameCount,
              animation.seed
            );
            // Pick the frame at index i to match the animation progression
            combinedFrames.push(patternForFrame[i] || jitteredQR);
          }

          framesToProcess = combinedFrames.map((canvas) => ({
            canvas,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else if (hasJitter) {
          // Just moduleJitter without pattern - generate frames with jitter
          const jitteredFrames: HTMLCanvasElement[] = [];
          for (let i = 0; i < frameCount; i++) {
            if (isCancelled) return;

            // Time-based yielding for smoother UI
            if (await yieldCtrl.yieldIfNeeded()) {
              if (isCancelled) return;
            }

            const frameConfig = { ...debouncedConfig, frameIndex: i };
            const qrFrame = await qrGenerator.generate(frameConfig, null);
            if (qrFrame) jitteredFrames.push(qrFrame);
          }

          framesToProcess = jitteredFrames.map((canvas) => ({
            canvas,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else {
          // For colorCycle/temporalDither without pattern or jitter
          // Generate base QR once, then create placeholder frames for post-processing
          const staticBaseQR = await qrGenerator.generate(debouncedConfig, null);
          if (!staticBaseQR || isCancelled) return;

          framesToProcess = Array.from({ length: frameCount }, () => ({
            canvas: staticBaseQR,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        }
      }
      // Generate pattern animation frames from static overlay image
      else if (shouldGeneratePatternAnimation && effectiveFrames.length === 1) {
        // Generate 24 frames of pattern animation from single frame
        const patternFrameCount = 24;
        const baseCanvas = applyGeometricTransforms(effectiveFrames[0].canvas);
        const patternFrames = generatePatternFrames(
          baseCanvas,
          animation.pattern as AnimationPattern,
          patternFrameCount,
          animation.seed
        );
        // Convert to AnimationFrame format
        framesToProcess = patternFrames.map((canvas) => ({
          canvas,
          delay: animation.speedMs,
          disposalType: 0,
        }));
      }
      // Generate animation frames from static overlay with non-pattern effects (colorCycle, temporalDither, jitter)
      else if (shouldGenerateStaticOverlayAnimation && effectiveFrames.length === 1) {
        // Generate 24 frames of animation effects on the static overlay
        const frameCount = 24;
        const baseCanvas = applyGeometricTransforms(effectiveFrames[0].canvas);

        // Create placeholder frames - the actual effects (colorCycle, temporalDither) are applied per-frame below
        framesToProcess = Array.from({ length: frameCount }, () => ({
          canvas: baseCanvas,
          delay: animation.speedMs,
          disposalType: 0,
        }));
      }

      // If using GIF compositor, reset it before processing frames
      if (useCompositor && gifCompositor) {
        gifCompositor.reset();
      }

      for (let frameIdx = 0; frameIdx < framesToProcess.length; frameIdx++) {
        const frame = framesToProcess[frameIdx];
        // Check if cancelled before each expensive operation
        if (isCancelled) return;

        // Time-based yielding: yield when we've used up our frame budget
        // This is more efficient than fixed-interval yielding
        if (await yieldCtrl.yieldIfNeeded()) {
          if (isCancelled) return;
        }

        try {
          let result: HTMLCanvasElement | null = null;

          if (shouldGenerateBaseAnimation) {
            // For base QR animation, the frame.canvas is either:
            // - A pattern-processed frame (if pattern enabled)
            // - The base QR itself (for colorCycle/temporalDither only)
            if (hasPattern || hasJitter) {
              // Pattern and/or jitter already applied during frame generation, just use the frame directly
              result = frame.canvas;
            } else {
              // Re-render QR with different frameIndex for temporal effects
              const frameConfig = {
                ...debouncedConfig,
                frameIndex: frameIdx,
                temporalOffset: useTemporalDither
                  ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                  : 0,
              };
              result = await qrGenerator.generate(frameConfig, null);
            }
          } else if (useCompositor && gifCompositor) {
            // OPTIMAL PATH: Use GIF compositor for overlay animation
            // This avoids per-frame canvas allocation - compositor.canvas is reused
            const actualFrameIdx = effectiveFrameIndices[frameIdx];
            const prevActualFrameIdx = frameIdx > 0 ? effectiveFrameIndices[frameIdx - 1] : -1;

            // CRITICAL: GIF frames are delta patches that build on each other.
            // We cannot skip intermediate frames - we must apply ALL frames from
            // the previous target frame to the current target frame.
            // e.g., if effectiveFrameIndices = [0, 5, 10] and we want frame 5,
            // we need to apply frames 1, 2, 3, 4, 5 (not just jump from 0 to 5)
            for (let i = prevActualFrameIdx + 1; i <= actualFrameIdx; i++) {
              if (i > 0) {
                gifCompositor.dispose(i - 1);
              }
              gifCompositor.apply(i);
            }

            // Apply geometric transforms only (color adjustments at moduleCount resolution)
            const processedOverlay = applyGeometricTransforms(gifCompositor.canvas);

            // Apply temporal dithering if enabled (reduced strength for preview)
            let overlayToUse = processedOverlay;
            if (useTemporalDither) {
              const temporalOffset = calculateTemporalOffset(
                frameIdx,
                temporalMode,
                animation.seed
              );
              overlayToUse = applyTemporalNoiseToCanvas(processedOverlay, temporalOffset, 0.008);
            }

            const frameConfig = {
              ...debouncedConfig,
              frameIndex: frameIdx,
              temporalOffset: useTemporalDither
                ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                : 0,
            };
            result = await qrGenerator.generate(frameConfig, overlayToUse);
          } else {
            // Legacy path for WebP or pattern animation
            // NOTE: Color adjustments (brightness/contrast/etc) are now done at moduleCount
            // resolution inside qr-generator.js - we only apply geometric transforms here
            let processedOverlay = shouldGeneratePatternAnimation
              ? frame.canvas // Already processed for pattern animation
              : applyGeometricTransforms(frame.canvas);

            // Apply temporal dithering offset to the overlay image
            // This varies the input slightly per frame for smoother perceived quality
            // NOTE: Use reduced strength (0.008) during preview generation for speed
            // Full strength (0.015) is applied during export
            if (useTemporalDither) {
              const temporalOffset = calculateTemporalOffset(
                frameIdx,
                temporalMode,
                animation.seed
              );
              processedOverlay = applyTemporalNoiseToCanvas(
                processedOverlay,
                temporalOffset,
                0.008
              );
            }

            // Pass frame index for temporal dithering (also used in qr-generator for dither pattern offset)
            const frameConfig = {
              ...debouncedConfig,
              frameIndex: frameIdx,
              temporalOffset: useTemporalDither
                ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                : 0,
            };
            result = await qrGenerator.generate(frameConfig, processedOverlay);
          }

          if (isCancelled) return;

          if (result) {
            let finalResult = result;

            // Apply color cycle as post-processing - ONLY if actually enabled
            if (hasColorCycle) {
              finalResult = applyColorCycle(finalResult, frameIdx, framesToProcess.length);
            }

            // Apply watermark if enabled
            if (watermark.enabled) {
              const watermarked = applyWatermark(finalResult, {
                enabled: watermark.enabled,
                kind: watermark.kind,
                text: watermark.text,
                image: watermarkImage,
                position: watermark.position,
                opacity: watermark.opacity,
                blend: watermark.blend,
              });
              frames.push(watermarked.canvas);
            } else {
              frames.push(finalResult);
            }
          }
        } catch (err) {
          console.error('Error generating frame:', err);
        }
      }

      // Apply interpolation - ONLY if actually enabled
      if (hasInterpolation && frames.length > 1) {
        frames = interpolateFrames(frames, animation.interpolate, 2);
      }

      // Only update state if not cancelled
      if (isCancelled) return;

      setAnimationFrames(frames);
      setIsAnimationCacheReady(true);
      setIsLoading(false);
      setIsLoadingOverlay(false); // Clear overlay loading state when animation cache is ready

      // Set the first frame as current canvas
      if (frames.length > 0) {
        setCanvas(frames[0]);
        if (canvasRef.current) {
          const finalCtx = canvasRef.current.getContext('2d');
          if (finalCtx) {
            canvasRef.current.width = frames[0].width;
            canvasRef.current.height = frames[0].height;
            finalCtx.drawImage(frames[0], 0, 0);
          }
        }
      }
    };

    generateAllFrames();

    // Cleanup: cancel in-flight generation if deps change
    // IMPORTANT: Reset loading states to prevent stuck spinner when navigating away and back
    return () => {
      isCancelled = true;
      setIsLoading(false);
      setIsLoadingOverlay(false);
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
    animation.interpolate,
    animation.speedMs,
    animation.colorCycle,
    animation.moduleJitterPx,
    applyGeometricTransforms,
  ]);

  // Determine if we're still preparing animation
  // This covers: GIF overlays, static overlays with animation effects, and base QR animation effects
  const hasMultiFrameContent = (gifCompositor?.frameCount || 0) > 1 || gifFrames.length > 1;
  const hasAnimationEffectsEnabled =
    animation.colorCycle ||
    animation.pattern !== 'none' ||
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
      animationFrames.length === 0 &&
      isLoading);

  return {
    canvasRef,
    canvas,
    isLoading,
    isExporting,
    isRendering,
    isPending,
    error,
    regenerate: generate,
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
    // Animation frames for GIF export
    animationFrames,
  };
}

export default useQRGenerator;
