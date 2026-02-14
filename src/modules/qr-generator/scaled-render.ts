/**
 * Scaled QR Rendering
 * Handles all scaled overlay modes (dithered, blue-noise, subpixel)
 */

import { createLogger } from '../../lib/logger';
import {
  isAlignmentPattern as isAlignmentPatternSpec,
  isFinderPattern as isFinderPatternSpec,
  isFormatInfo as isFormatInfoSpec,
  isLocked as isLockedSpec,
  isTimingPattern as isTimingPatternSpec,
  isVersionInfo as isVersionInfoSpec,
} from '../qr-spec';
import type { CanvasFactory } from './canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawTimingModule,
} from './drawing';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { generatePixelDecisionMatrix } from './pixel-matrix';
import type { QRCodeInstance, QRGeneratorConfig, RGB } from './types';
import { validateColor } from './utils';

const log = createLogger('GENERATE');

function _isDarkModule(row: number, col: number, moduleCount: number): boolean {
  // Fixed dark module (always dark) per ISO/IEC 18004.
  // For any version, this is at (moduleCount - 8, 8).
  return row === moduleCount - 8 && col === 8;
}

type PixelColor = RGB;

/**
 * UNIFIED SCALED QR GENERATION
 * Handles ALL scaled overlay modes (dithered, blue-noise, subpixel, subpixel-size)
 * through a single code path with ALL settings applied uniformly.
 */
export async function generateScaledQR(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  scale: number,
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
  canvasFactory: CanvasFactory,
  storeMatrixFn: (qr: QRCodeInstance, moduleCount: number) => void
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // Get pixel decision matrix (unified for all scaled modes)
  const pixelData = await generatePixelDecisionMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    createCanvasFn,
    canvasFactory
  );
  const { matrix, colors } = pixelData;
  const scaledSize = matrix.length;

  // UNIFIED: Apply quietZoneMinEnforce setting
  const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
  const marginModules = Math.max(quietZoneMin, config.margin);

  // Calculate micro-pixel size with fractional support for smoother high-density rendering.
  const subPixelSize = Math.max(0.5, config.moduleSize / scale);
  const effectiveModuleSize = subPixelSize * scale;

  // UNIFIED: Apply frame settings
  const frameExtra =
    config.frameStyle && config.frameStyle !== 'none' && config.frameText
      ? effectiveModuleSize * 4
      : 0;
  const marginPx = marginModules * effectiveModuleSize;
  const size = Math.round(scaledSize * subPixelSize + marginPx * 2 + frameExtra);

  const canvas = await createCanvasFn(size, size);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;

  // IMPORTANT: Ensure bgColor has a fallback - undefined fillStyle becomes black
  // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
  const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
  const effectiveFgColor = validateColor(config.fgColor, '#000000');
  const needsExplicitLightModules = config.transparentBg === true;

  // Draw background
  if (!config.transparentBg) {
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Draw frame background (sticker) BEFORE QR modules so it appears behind
  drawFrameBackground(ctx, size, effectiveModuleSize, marginModules, config);

  // UNIFIED: Create gradient fill if configured
  const gradientFill = createGradientFill(ctx, config, size);
  const useGradient = config.gradient && config.gradient.type !== 'none';

  // Determine color rendering mode
  const useColorRendering = Boolean(overlayCanvas && config.colorMode !== 'bw');

  // Dithered mode is ink-dominant: render dark dots over mostly open paper.
  const isDitheredMode =
    config.overlayMode === 'dithered' ||
    config.overlayMode === 'blue_noise' ||
    config.overlayMode === 'blue-noise';
  const forceBinaryFunctionPatterns = isDitheredMode;
  const isSubpixelMode =
    config.overlayMode === 'subpixel' || config.overlayMode === 'subpixel-size';
  const needsBothDarkAndLightColors = isSubpixelMode;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  const preserveFinders = config.preserveFinders !== false;
  const preserveTiming = preserveFunctional
    ? config.preserveTiming !== false
    : config.preserveTiming === true;
  const preserveAlignment = preserveFunctional
    ? config.preserveAlignment !== false
    : config.preserveAlignment === true;
  const protectFormat = preserveFunctional
    ? config.protectFormatInfo !== false
    : config.protectFormatInfo === true;
  const protectVersion = preserveFunctional
    ? config.protectVersionInfo !== false
    : config.protectVersionInfo === true;
  const preserveFixedDark = preserveFunctional;
  const qrDrawSize = scaledSize * subPixelSize;
  const ditherBackdropAlpha = Math.max(0, Math.min(0.75, config.ditherBackdropAlpha ?? 0.4));
  const ditherBackdropWash = Math.max(0, Math.min(1, config.ditherBackdropWash ?? 0.18));

  const debug = config.debugOverlayDither === true;
  if (debug) {
    log.debug('ScaledRender start', {
      moduleCount,
      scale,
      scaledSize,
      overlayMode: config.overlayMode,
      colorMode: config.colorMode,
      useColorRendering,
      needsBothDarkAndLightColors,
      protectFormatInfo: config.protectFormatInfo,
      protectVersionInfo: config.protectVersionInfo,
      preserveFinders: config.preserveFinders,
      preserveTiming: config.preserveTiming,
      preserveAlignment: config.preserveAlignment,
      hasColors: !!(colors?.length && colors[0]?.length),
      sampleColor: colors?.[5]?.[5],
    });
  }

  if (isDitheredMode && overlayCanvas && useColorRendering) {
    ctx.save();
    ctx.globalAlpha = ditherBackdropAlpha;
    ctx.drawImage(overlayCanvas as CanvasImageSource, marginPx, marginPx, qrDrawSize, qrDrawSize);
    if (ditherBackdropWash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = ditherBackdropWash;
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(marginPx, marginPx, qrDrawSize, qrDrawSize);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  const adjustLumaPreserveChroma = (
    c: PixelColor,
    targetLuma: number,
    chromaScale: number
  ): { r: number; g: number; b: number } => {
    const gray = (c.r + c.g + c.b) / 3;
    let r = gray + (c.r - gray) * chromaScale;
    let g = gray + (c.g - gray) * chromaScale;
    let b = gray + (c.b - gray) * chromaScale;
    const currentLuma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const delta = (targetLuma - currentLuma) * 255;
    r = Math.max(0, Math.min(255, r + delta));
    g = Math.max(0, Math.min(255, g + delta));
    b = Math.max(0, Math.min(255, b + delta));
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };
  const defaultDotMin = subPixelSize * 0.14;
  const defaultDotMax = subPixelSize * 0.62;
  const dotMinRadiusPx = Math.max(
    0.02,
    Math.min(subPixelSize * 0.42, config.dotMinRadiusPx ?? defaultDotMin)
  );
  const dotMaxRadiusPx = Math.max(
    dotMinRadiusPx + Math.max(0.01, subPixelSize * 0.08),
    Math.min(subPixelSize * 0.78, config.dotMaxRadiusPx ?? defaultDotMax)
  );
  const maxRadiusBound = subPixelSize * 0.78;
  const qrFirstLightBoost = config.qrFirstMode ? 1.3 : 1;
  const lightGrainDensity = Math.max(
    0,
    Math.min(0.025, (config.lightGrainDensity ?? 0.004) * qrFirstLightBoost)
  );
  const lightGrainAlpha = Math.max(
    0,
    Math.min(0.1, (config.lightGrainAlpha ?? 0.05) * (config.qrFirstMode ? 1.15 : 1))
  );
  const seed = config.seed ?? 1337;
  const radiusBins = 9;

  const hash01 = (x: number, y: number, s: number): number => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453;
    return n - Math.floor(n);
  };

  const quantizeRadius = (r: number): number => {
    const t = Math.max(
      0,
      Math.min(1, (r - dotMinRadiusPx) / Math.max(1e-6, dotMaxRadiusPx - dotMinRadiusPx))
    );
    const q = Math.round(t * (radiusBins - 1)) / Math.max(1, radiusBins - 1);
    return dotMinRadiusPx + q * (dotMaxRadiusPx - dotMinRadiusPx);
  };

  const localVariance = (x: number, y: number): number => {
    const c = colors[y]?.[x] as PixelColor | undefined;
    if (!c) return 0;
    const luma = (p: PixelColor) => (0.299 * p.r + 0.587 * p.g + 0.114 * p.b) / 255;
    const center = luma(c);
    let sum = 0;
    let n = 0;
    const nb = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [ox, oy] of nb) {
      const p = colors[y + oy]?.[x + ox] as PixelColor | undefined;
      if (!p) continue;
      const d = luma(p) - center;
      sum += d * d;
      n++;
    }
    return n > 0 ? Math.min(1, Math.sqrt(sum / n) * 3.0) : 0;
  };

  const drawDitherDot = (x: number, y: number, radius: number, jitterN: number): void => {
    const jitterAmp = subPixelSize * 0.2;
    const jxA = hash01(x * 1.37, y * 0.83, seed + 11) - 0.5;
    const jxB = hash01(x * 0.61, y * 1.91, seed + 53) - 0.5;
    const jyA = hash01(x * 0.79, y * 1.23, seed + 29) - 0.5;
    const jyB = hash01(x * 1.71, y * 0.57, seed + 89) - 0.5;
    const jx = (jxA * 0.66 + jxB * 0.34) * 2 * jitterAmp * jitterN;
    const jy = (jyA * 0.66 + jyB * 0.34) * 2 * jitterAmp * jitterN;
    ctx.beginPath();
    ctx.arc(
      x + subPixelSize / 2 + jx,
      y + subPixelSize / 2 + jy,
      Math.min(radius, maxRadiusBound),
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  const isFinderSeparator = (row: number, col: number): boolean =>
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8);
  const isFinderRegion = (row: number, col: number): boolean =>
    isFinderPatternSpec(row, col, moduleCount) || isFinderSeparator(row, col);

  const shouldForceBinaryModule = (row: number, col: number): boolean => {
    if (!isLockedSpec(row, col, moduleCount, version)) return false;
    // Fixed dark module follows preserve/protect policy.
    if (row === moduleCount - 8 && col === 8) return preserveFixedDark;
    // Finder regions/separators follow preserveFinders explicitly.
    if (isFinderRegion(row, col)) {
      return preserveFinders;
    }
    if (isTimingPatternSpec(row, col, moduleCount)) return preserveTiming;
    if (isAlignmentPatternSpec(row, col, moduleCount, version)) return preserveAlignment;
    if (isFormatInfoSpec(row, col, moduleCount)) return protectFormat;
    if (isVersionInfoSpec(row, col, moduleCount, version)) return protectVersion;
    return false;
  };

  const enforceQuietZoneClean = (): void => {
    if (marginPx <= 0) return;
    const qrStart = marginPx;
    const qrSize = moduleCount * effectiveModuleSize;
    const qrEnd = qrStart + qrSize;
    if (config.transparentBg) {
      ctx.clearRect(0, 0, size, qrStart);
      ctx.clearRect(0, qrStart, qrStart, qrSize);
      ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
      ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
      return;
    }
    ctx.fillStyle = effectiveBgColor;
    ctx.fillRect(0, 0, size, qrStart);
    ctx.fillRect(0, qrStart, qrStart, qrSize);
    ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSize);
    ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
  };

  const drawStrictFunctionOverlay = (): void => {
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!shouldForceBinaryModule(row, col)) continue;
        const x = marginPx + col * effectiveModuleSize;
        const y = marginPx + row * effectiveModuleSize;
        ctx.fillStyle = qr.isDark(row, col) ? effectiveFgColor : effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
  };

  const finderContrastBoost = isDitheredMode && !preserveFinders;
  const alignmentContrastBoost = isDitheredMode && !preserveAlignment;

  // Render all pixels
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const isDark = matrix[y]?.[x];
      const color = (colors[y]?.[x] ?? null) as PixelColor | null;

      const shouldDrawLightPixel =
        !isDitheredMode &&
        (needsExplicitLightModules || (needsBothDarkAndLightColors && useColorRendering));

      if (
        debug &&
        y === Math.floor(scaledSize / 2) &&
        (x === Math.floor(scaledSize / 2) || x === Math.floor(scaledSize / 2) + 4)
      ) {
        log.debug('ScaledRender samplePixel', {
          y,
          x,
          isDark,
          color,
        });
      }

      const dx = marginPx + x * subPixelSize;
      const dy = marginPx + y * subPixelSize;
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const moduleLocked = shouldForceBinaryModule(moduleRow, moduleCol);
      const isFinderBoostModule = finderContrastBoost && isFinderRegion(moduleRow, moduleCol);
      const isAlignmentBoostModule =
        alignmentContrastBoost &&
        isAlignmentPatternSpec(moduleRow, moduleCol, moduleCount, version);
      const isPatternContrastBoostModule = isFinderBoostModule || isAlignmentBoostModule;

      if (!isDark) {
        if (isDitheredMode) {
          if (isPatternContrastBoostModule) {
            if (useColorRendering && color) {
              const light = adjustLumaPreserveChroma(color, 0.96, 0.62);
              ctx.fillStyle = `rgb(${light.r},${light.g},${light.b})`;
            } else {
              ctx.fillStyle = 'rgb(248,248,248)';
            }
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
            continue;
          }
          const sourceLuma = color
            ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
            : 1;
          const toneN = 1 - sourceLuma;
          const varN = localVariance(x, y);
          const noiseN = hash01(x, y, seed + 149);
          const grainChance = Math.max(
            0,
            Math.min(
              config.qrFirstMode ? 0.2 : 0.08,
              lightGrainDensity * (0.9 + toneN * 1.5 + varN * 1.1 + (noiseN - 0.5) * 0.3)
            )
          );
          if (grainChance > 0 && hash01(x, y, seed + 131) < grainChance) {
            const lightTarget = Math.max(
              0.32,
              Math.min(0.76, 0.46 + sourceLuma * 0.22 - varN * 0.06)
            );
            const grain = color
              ? adjustLumaPreserveChroma(color, lightTarget, 1.42)
              : { r: 226, g: 226, b: 226 };
            ctx.fillStyle = `rgb(${grain.r},${grain.g},${grain.b})`;
            const prevAlpha = ctx.globalAlpha;
            const alpha = Math.min(
              0.12,
              Math.max(
                0.02,
                lightGrainAlpha * (0.55 + toneN * 0.4 + varN * 0.18 + (noiseN - 0.5) * 0.08)
              )
            );
            ctx.globalAlpha = alpha;
            const grainRadius = Math.max(
              0.04,
              quantizeRadius(dotMinRadiusPx * (0.95 + toneN * 0.7 + varN * 0.22 + noiseN * 0.16))
            );
            drawDitherDot(dx, dy, grainRadius, 0.25 + 0.08 * noiseN);
            ctx.globalAlpha = prevAlpha;
          }
          continue;
        }
        if (!shouldDrawLightPixel) continue;
      }

      if (isDark) {
        if (isDitheredMode) {
          if (isPatternContrastBoostModule) {
            if (useColorRendering && color) {
              const dark = adjustLumaPreserveChroma(color, 0.06, 1.75);
              ctx.fillStyle = `rgb(${dark.r},${dark.g},${dark.b})`;
            } else {
              ctx.fillStyle = 'rgb(16,16,16)';
            }
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
            continue;
          }
          const sourceLuma = color
            ? (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255
            : 0.5;
          let drawLuma = sourceLuma;
          if (useColorRendering && color) {
            const tone = (1 - sourceLuma) ** 0.86;
            const targetLuma = Math.max(0.04, Math.min(0.21, 0.04 + (1 - tone) * 0.17));
            const dark = adjustLumaPreserveChroma(color, targetLuma, 1.62);
            const darkR = dark.r;
            const darkG = dark.g;
            const darkB = dark.b;
            ctx.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
            drawLuma = (0.299 * darkR + 0.587 * darkG + 0.114 * darkB) / 255;
          } else {
            const mono = Math.round(Math.max(8, Math.min(76, 8 + sourceLuma * 68)));
            ctx.fillStyle = `rgb(${mono},${mono},${mono})`;
            drawLuma = mono / 255;
          }

          const varN = localVariance(x, y);
          const noiseN = hash01(x, y, seed);
          const toneN = (1 - drawLuma) ** 0.9;
          if (!moduleLocked) {
            const dropoutNoise = hash01(x, y, seed + 257);
            const dropoutChance = Math.max(
              0,
              Math.min(0.05, 0.004 + (1 - toneN) * 0.03 + varN * 0.012)
            );
            if (dropoutNoise < dropoutChance) continue;
          }
          const radiusT = Math.max(
            0,
            Math.min(1, 0.16 + toneN * 0.68 + varN * 0.22 + (noiseN - 0.5) * 0.34)
          );
          const rawRadius = dotMinRadiusPx + radiusT * (dotMaxRadiusPx - dotMinRadiusPx);
          const radius = quantizeRadius(Math.max(dotMinRadiusPx, rawRadius));
          const jitterN = 0.66 + 0.34 * hash01(x, y, seed + 7);
          drawDitherDot(dx, dy, radius, jitterN);
        } else if (useColorRendering && color) {
          // For subpixel modes: use raw overlay color
          ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        } else {
          // B&W mode or no color data: use foreground color (with optional gradient)
          ctx.fillStyle = useGradient && gradientFill ? gradientFill : effectiveFgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      } else {
        // Non-dithered light rendering paths.
        if (needsBothDarkAndLightColors && useColorRendering && color) {
          ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        } else {
          ctx.fillStyle = effectiveBgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      }
    }
  }

  if (forceBinaryFunctionPatterns) {
    drawStrictFunctionOverlay();
  }

  // UNIFIED: Draw styled finder patterns on top of pixel rendering
  // Only draw finders separately if preserveFinders is true OR there's no overlay
  // When preserveFinders=false with overlay, finder modules were already rendered with overlay effects
  const shouldDrawFindersFirst =
    !forceBinaryFunctionPatterns && (config.preserveFinders !== false || !overlayCanvas);

  const finderPositions = [
    { row: 0, col: 0 }, // Top-left
    { row: 0, col: moduleCount - 7 }, // Top-right
    { row: moduleCount - 7, col: 0 }, // Bottom-left
  ];

  if (shouldDrawFindersFirst) {
    for (const pos of finderPositions) {
      // Position is in module coordinates, convert to pixels
      const x = marginPx + pos.col * effectiveModuleSize;
      const y = marginPx + pos.row * effectiveModuleSize;
      if (forceBinaryFunctionPatterns) {
        drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, {
          ...config,
          gradient: { type: 'none', stops: [] },
          fgColor: effectiveFgColor,
          bgColor: effectiveBgColor,
        });
      } else {
        drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, config);
      }
    }
  }

  // UNIFIED: Draw styled alignment patterns (for version 2+)
  // Only draw alignment patterns separately if preserveAlignment is true OR there's no overlay
  // When preserveAlignment=false with overlay, alignment modules were already rendered with overlay effects
  const shouldDrawAlignmentFirst =
    !forceBinaryFunctionPatterns && (config.preserveAlignment !== false || !overlayCanvas);
  if (version >= 2 && shouldDrawAlignmentFirst) {
    const alignPositions = getAlignmentPositionsCached(version, moduleCount);
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    for (const pos of alignPositions) {
      // pos.row/col is the CENTER module of the alignment pattern
      // Convert to pixel center position
      const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
      const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
      if (forceBinaryFunctionPatterns) {
        drawAlignmentPattern(ctx, centerX, centerY, effectiveModuleSize, alignmentStyle, {
          ...config,
          gradient: { type: 'none', stops: [] },
          fgColor: effectiveFgColor,
          bgColor: effectiveBgColor,
        });
      } else {
        drawAlignmentPattern(ctx, centerX, centerY, effectiveModuleSize, alignmentStyle, config);
      }
    }
  }

  // Preserve timing pattern modules on top (scan critical)
  // When preserveTiming is false, we intentionally leave timing modules subject to the overlay.
  const shouldPreserveTimingModules = !forceBinaryFunctionPatterns && preserveTiming;
  if (shouldPreserveTimingModules) {
    const timingStyle = config.timingStyle || 'match_module';
    // Horizontal timing (row 6, between finders)
    const timingRow = 6;
    for (let col = 8; col < moduleCount - 8; col++) {
      const isDark = qr.isDark(timingRow, col);
      const x = marginPx + col * effectiveModuleSize;
      const y = marginPx + timingRow * effectiveModuleSize;
      if (isDark) {
        ctx.fillStyle = forceBinaryFunctionPatterns
          ? effectiveFgColor
          : useGradient && gradientFill
            ? gradientFill
            : effectiveFgColor;
        drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
      } else {
        // Override any overlay color for light timing modules
        ctx.fillStyle = effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
    // Vertical timing (col 6, between finders)
    const timingCol = 6;
    for (let row = 8; row < moduleCount - 8; row++) {
      const isDark = qr.isDark(row, timingCol);
      const x = marginPx + timingCol * effectiveModuleSize;
      const y = marginPx + row * effectiveModuleSize;
      if (isDark) {
        ctx.fillStyle = forceBinaryFunctionPatterns
          ? effectiveFgColor
          : useGradient && gradientFill
            ? gradientFill
            : effectiveFgColor;
        drawTimingModule(ctx, x, y, effectiveModuleSize, timingStyle, config);
      } else {
        ctx.fillStyle = effectiveBgColor;
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
      }
    }
  }

  // Preserve format + version info modules on top (scan critical)
  // These are small fixed areas, and should be kept clean when protection is enabled.
  const shouldProtectFormatInfo = !forceBinaryFunctionPatterns && protectFormat;
  const shouldProtectVersionInfo = !forceBinaryFunctionPatterns && protectVersion;

  if (shouldProtectFormatInfo || shouldProtectVersionInfo) {
    let formatCount = 0;
    let versionCount = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const isFormat = shouldProtectFormatInfo && isFormatInfoSpec(row, col, moduleCount);
        const isVersion =
          shouldProtectVersionInfo && isVersionInfoSpec(row, col, moduleCount, version);
        if (!(isFormat || isVersion)) continue;

        const isDark = qr.isDark(row, col);
        const x = marginPx + col * effectiveModuleSize;
        const y = marginPx + row * effectiveModuleSize;

        if (isDark) {
          ctx.fillStyle = forceBinaryFunctionPatterns
            ? effectiveFgColor
            : useGradient && gradientFill
              ? gradientFill
              : effectiveFgColor;
        } else {
          ctx.fillStyle = effectiveBgColor;
        }
        ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);

        if (isFormat) formatCount++;
        if (isVersion) versionCount++;
      }
    }

    // Also preserve the fixed dark module (scan critical)
    // Spec location: (moduleCount - 8, 8)
    const dmRow = moduleCount - 8;
    const dmCol = 8;
    if (dmRow >= 0 && dmRow < moduleCount && dmCol >= 0 && dmCol < moduleCount) {
      const x = marginPx + dmCol * effectiveModuleSize;
      const y = marginPx + dmRow * effectiveModuleSize;
      ctx.fillStyle = forceBinaryFunctionPatterns
        ? effectiveFgColor
        : useGradient && gradientFill
          ? gradientFill
          : effectiveFgColor;
      ctx.fillRect(x, y, effectiveModuleSize, effectiveModuleSize);
    }

    if (debug) {
      log.debug('ScaledRender preserved', {
        protectFormat: shouldProtectFormatInfo,
        protectVersion: shouldProtectVersionInfo,
        formatCount,
        versionCount,
        preservedTiming: shouldPreserveTimingModules,
      });
    }
  }

  // Ensure quiet zone is clean after all module/pattern rendering.
  enforceQuietZoneClean();

  // UNIFIED: Draw frame if configured
  drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

  // Store the QR matrix for vector SVG export
  // Export should reflect the canonical QR modules, not the scaled pixel decision matrix.
  // The pixel matrix is used for rendering effects (dither/subpixel) and can introduce
  // ambiguity when collapsed back to module resolution.
  storeMatrixFn(qr, moduleCount);

  return canvas;
}
