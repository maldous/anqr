import { parseColor } from "./color";
import type { RGB } from "../../../modules/core/types";
import type { GradientConfig } from "./gradient.types";

// ============================================
// GRADIENT FUNCTIONS
// ============================================

/**
 * Get interpolated color at position in gradient
 */
export function getGradientColor(config: GradientConfig, position: number): RGB {
  if (!config.stops || config.stops.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  if (config.stops.length === 1) {
    return parseColor(config.stops[0].color) || { r: 0, g: 0, b: 0 };
  }

  // Sort stops by position
  const sorted = [...config.stops].sort((a, b) => a.pos - b.pos);

  // Find surrounding stops
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (position >= sorted[i].pos && position <= sorted[i + 1].pos) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  // Interpolate
  const range = upper.pos - lower.pos;
  const t = range > 0 ? (position - lower.pos) / range : 0;

  const lowerRgb = parseColor(lower.color) || { r: 0, g: 0, b: 0 };
  const upperRgb = parseColor(upper.color) || { r: 0, g: 0, b: 0 };

  return {
    r: Math.round(lowerRgb.r + (upperRgb.r - lowerRgb.r) * t),
    g: Math.round(lowerRgb.g + (upperRgb.g - lowerRgb.g) * t),
    b: Math.round(lowerRgb.b + (upperRgb.b - lowerRgb.b) * t),
  };
}
