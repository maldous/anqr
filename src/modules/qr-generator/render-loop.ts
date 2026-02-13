/**
 * Module Render Loop
 * Renders all QR modules with styling and overlay effects
 */

import { isFinderPattern, isTimingPattern } from '../qr-spec';

import { applyPaletteColor, applyPerModuleColor, ensureContrast } from './color';
import { drawHalftoneModule, drawModule, drawTimingModule } from './drawing';
import { isFormatInfo, isVersionInfo } from './pattern-helpers';
import { applyQROverlayMode } from './render-modes';
import type { OverlayData, QRCodeInstance, QRGeneratorConfig } from './types';
import { validateColor } from './utils';

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/**
 * Render all QR modules with styling and overlay effects
 */
export function renderModules(
  ctx: CanvasContext,
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  moduleCount: number,
  moduleSize: number,
  margin: number,
  overlayData: OverlayData | null,
  ditherPattern: boolean[][] | null,
  effectiveIntensity: number,
  drawnFinderPatterns: Set<string>,
  drawnAlignmentPatterns: Set<string>,
  version: number,
  gradientFill: CanvasGradient | null,
  useGradient: boolean
): void {
  // Render options
  const cornerRadius = config.cornerRadius || 0;
  const dotRotation = config.dotRotationDeg || 0;
  const timingStyle = config.timingStyle || 'match_module';

  // Draw QR modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip if this module is part of a finder pattern (already drawn)
      if (drawnFinderPatterns.has(`${row},${col}`)) continue;

      // Skip if this module is part of an alignment pattern (already drawn)
      if (drawnAlignmentPatterns.has(`${row},${col}`)) continue;

      // Use dithered pattern if available, otherwise use original QR
      const isDark = ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col);
      const x = (col + margin) * moduleSize;
      const y = (row + margin) * moduleSize;

      const isFinder = isFinderPattern(row, col, moduleCount);
      const isTiming = isTimingPattern(row, col, moduleCount);
      const isFormat = isFormatInfo(row, col, moduleCount);
      const isVersion = isVersionInfo(row, col, moduleCount, version);
      // Note: alignment pattern modules are already skipped via drawnAlignmentPatterns set
      const isInAlignmentSet = drawnAlignmentPatterns.has(`${row},${col}`);

      // Protection settings
      const protectFormat = config.protectFormatInfo;
      const protectVersion = config.protectVersionInfo;

      const applyOverlay =
        overlayData &&
        !(config.preserveFinders && isFinder) &&
        !(config.preserveTiming && isTiming) &&
        !(config.preserveAlignment && isInAlignmentSet) &&
        !(protectFormat && isFormat) &&
        !(protectVersion && isVersion);

      // Default rendering parameters
      // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
      const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
      const effectiveFgColor = validateColor(config.fgColor, '#000000');
      let moduleColor = isDark ? effectiveFgColor : effectiveBgColor;

      // Use explicit boolean check to handle truthy/falsy edge cases
      // Computed here for clarity, value is constant for all modules
      const needsExplicitLightModules = config.transparentBg === true;
      let moduleSizeModifier = 1;
      let moduleOpacity = 1;
      let waveOffsetX = 0;
      let waveOffsetY = 0;
      let drawOutlineOnly = false;
      let useHalftoneRendering = false;
      let halftoneBrightness = 0.5;
      // Draw dark modules always; draw light modules only when background is transparent
      // (otherwise light modules are provided by the background fill)
      let shouldDrawCell = isDark || needsExplicitLightModules;

      if (applyOverlay) {
        const brightness = (overlayData as number[][])[row][col];
        const modeResult = applyQROverlayMode(
          config.overlayMode,
          isDark,
          brightness,
          overlayData,
          row,
          col,
          moduleCount,
          effectiveIntensity,
          config
        );

        moduleColor = modeResult.moduleColor;
        moduleSizeModifier = modeResult.moduleSizeModifier;
        moduleOpacity = modeResult.moduleOpacity;
        waveOffsetX = modeResult.waveOffsetX;
        waveOffsetY = modeResult.waveOffsetY;
        drawOutlineOnly = modeResult.drawOutlineOnly;
        useHalftoneRendering = modeResult.useHalftoneRendering;
        halftoneBrightness = modeResult.halftoneBrightness;
        // Preserve transparentBg requirement: if background is transparent, light modules must be drawn
        shouldDrawCell = modeResult.shouldDrawCell || needsExplicitLightModules;
      }

      if (shouldDrawCell && moduleOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = moduleOpacity;

        // Apply per-module color mode
        let finalModuleColor = moduleColor;
        if (
          isDark &&
          config.perModuleColorMode &&
          config.perModuleColorMode !== 'solid' &&
          overlayData
        ) {
          finalModuleColor = applyPerModuleColor(
            config.perModuleColorMode,
            moduleColor,
            overlayData,
            row,
            col,
            moduleCount,
            config
          );
        }

        // Apply palette coloring if palette is provided
        const paletteBrightness = (overlayData as number[][])?.[row]?.[col] ?? 0.5;
        if (isDark && config.palette && config.palette.length > 0) {
          finalModuleColor = applyPaletteColor(
            row,
            col,
            moduleCount,
            paletteBrightness,
            config.palette,
            config
          );
        }

        // Apply contrast guard if enabled
        if (isDark && config.contrastGuard && config.minContrastRatio) {
          finalModuleColor = ensureContrast(
            finalModuleColor,
            config.bgColor,
            config.minContrastRatio
          );
        }

        // Note: colorCycle is now applied as post-processing in useQRGenerator.ts
        // using the applyColorCycle function from animation.ts for better results

        // Use gradient for dark modules if configured, otherwise use module color
        if (isDark && useGradient && gradientFill) {
          ctx.fillStyle = gradientFill;
        } else {
          ctx.fillStyle = finalModuleColor;
        }

        let gap = config.moduleGap ? (moduleSize * config.moduleGap) / 100 : 0;

        // Apply gap mode
        const gapMode = config.gapMode || 'none';
        let strokeWidth = 0;
        if (gapMode === 'inset') {
          // Inset mode: gap is applied as inset
          gap = Math.max(gap, moduleSize * 0.1);
        } else if (gapMode === 'stroke') {
          // Stroke mode: draw outline instead of fill
          strokeWidth = Math.max(1, moduleSize * 0.15);
          gap = strokeWidth;
        } else if (gapMode === 'negative_space') {
          // Negative space: larger gaps for artistic effect
          gap = Math.max(gap, moduleSize * 0.2);
        }

        const adjustedSize = (moduleSize - gap) * moduleSizeModifier;
        const offset = (moduleSize - adjustedSize) / 2;

        let drawX = x + offset + waveOffsetX;
        let drawY = y + offset + waveOffsetY;

        // Apply module jitter if configured (for animation effects)
        if (config.moduleJitterPx && config.moduleJitterPx > 0) {
          // Use deterministic jitter based on row, col, and frame index for consistency
          const jitterSeed = (row * 31 + col * 17 + (config.frameIndex || 0) * 13) % 1000;
          const jitterX = ((jitterSeed % 100) / 100 - 0.5) * 2 * config.moduleJitterPx;
          const jitterY = (((jitterSeed * 7) % 100) / 100 - 0.5) * 2 * config.moduleJitterPx;
          drawX += jitterX;
          drawY += jitterY;
        }

        // Apply pixel snap if configured
        const pixelSnap = config.pixelSnap || 'floor';
        if (pixelSnap === 'floor') {
          drawX = Math.floor(drawX);
          drawY = Math.floor(drawY);
        } else if (pixelSnap === 'round') {
          drawX = Math.round(drawX);
          drawY = Math.round(drawY);
        } else if (pixelSnap === 'ceil') {
          drawX = Math.ceil(drawX);
          drawY = Math.ceil(drawY);
        }

        if (drawOutlineOnly || (gapMode === 'stroke' && isDark)) {
          ctx.strokeStyle = finalModuleColor;
          ctx.lineWidth = strokeWidth || 1;
          ctx.strokeRect(
            drawX + ctx.lineWidth / 2,
            drawY + ctx.lineWidth / 2,
            adjustedSize - ctx.lineWidth,
            adjustedSize - ctx.lineWidth
          );
        } else if (useHalftoneRendering) {
          // Use advanced halftone rendering with htDot/htCurve params
          // Cast to CanvasRenderingContext2D for drawing functions (safe because we only use common 2D methods)
          // Pass row and col for line shape rotation variation
          drawHalftoneModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            halftoneBrightness,
            config,
            row,
            col
          );
        } else if (isTiming) {
          // Draw timing pattern module with timing style
          drawTimingModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            timingStyle,
            config
          );
        } else {
          drawModule(
            ctx as CanvasRenderingContext2D,
            drawX,
            drawY,
            adjustedSize,
            config.moduleStyle,
            {
              cornerRadius,
              rotation: dotRotation,
            }
          );
        }

        ctx.restore();
      }
    }
  }
}
