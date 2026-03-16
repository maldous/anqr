import { blendColors, parseColor } from "../../domain/render/color/color";
import {
  getOverlayBrightness,
  getOverlayColor,
} from "../../domain/render/overlay/overlay-data-packed";
import { curveIntensity } from "../../domain/render/generator/pixel-matrix-utils";
import type { QRGeneratorConfig, OverlayData } from "./types";

/**
 * Apply per-module color mode
 */
export function applyPerModuleColor(
  mode: string,
  baseColor: string,
  overlayData: OverlayData,
  row: number,
  col: number,
  moduleCount: number,
  config: QRGeneratorConfig,
): string {
  const brightness = getOverlayBrightness(overlayData, row, col);
  const overlayColor = getOverlayColor(overlayData, row, col);
  const intensity = curveIntensity(config.overlayIntensity ?? 100);

  switch (mode) {
    case "by_brightness": {
      // Vary module color based on image brightness
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      const factor = 0.5 + brightness * 0.5; // 0.5 to 1.0
      return `rgb(${Math.round(parsed.r * factor)},${Math.round(parsed.g * factor)},${Math.round(parsed.b * factor)})`;
    }

    case "by_position": {
      // Color varies based on position in QR code
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      const xFactor = col / moduleCount;
      const yFactor = row / moduleCount;
      const r = Math.round(parsed.r * (0.5 + xFactor * 0.5));
      const g = Math.round(parsed.g * (0.5 + yFactor * 0.5));
      const b = Math.round(parsed.b * (0.5 + (1 - xFactor) * 0.5));
      return `rgb(${r},${g},${b})`;
    }

    case "by_overlay": {
      // Use overlay image color directly
      if (overlayColor) {
        // overlayColor is now {r, g, b} object, convert to rgb string for blending
        const colorStr = `rgb(${overlayColor.r},${overlayColor.g},${overlayColor.b})`;
        return blendColors(baseColor, colorStr, intensity);
      }
      return baseColor;
    }

    case "by_cluster": {
      // Group nearby modules with similar colors
      const blockSize = 3;
      const blockRow = Math.floor(row / blockSize);
      const blockCol = Math.floor(col / blockSize);
      const seed = blockRow * 100 + blockCol;
      const hueShift = (seed * 37) % 360;
      const parsed = parseColor(baseColor);
      if (!parsed) return baseColor;
      // Simple hue rotation approximation
      const angle = (hueShift * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const r = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 + cos * 0.787 - sin * 0.213) +
            parsed.g * (0.715 - cos * 0.715 - sin * 0.715) +
            parsed.b * (0.072 - cos * 0.072 + sin * 0.928),
        ),
      );
      const g = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 - cos * 0.213 + sin * 0.143) +
            parsed.g * (0.715 + cos * 0.285 + sin * 0.14) +
            parsed.b * (0.072 - cos * 0.072 - sin * 0.283),
        ),
      );
      const b = Math.max(
        0,
        Math.min(
          255,
          parsed.r * (0.213 - cos * 0.213 - sin * 0.787) +
            parsed.g * (0.715 - cos * 0.715 + sin * 0.715) +
            parsed.b * (0.072 + cos * 0.928 + sin * 0.072),
        ),
      );
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    }

    default:
      return baseColor;
  }
}
