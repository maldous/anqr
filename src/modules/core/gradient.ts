/**
 * Gradient Utilities
 * Gradient color interpolation and CSS generation
 */

import type { RGB } from './types';
import { parseColor } from './color';

// ============================================
// GRADIENT TYPES
// ============================================

export interface GradientStop {
  pos: number;
  color: string;
}

export type GradientType = 'none' | 'linear' | 'radial' | 'conic';

export interface GradientConfig {
  type: GradientType;
  angle?: number;
  stops: GradientStop[];
}

// ============================================
// GRADIENT FUNCTIONS
// ============================================

/**
 * Get interpolated color at position in gradient
 */
export function getGradientColor(
  config: GradientConfig,
  position: number
): RGB {
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

/**
 * Get gradient color at position (simplified interface)
 */
export function getGradientColorAt(
  stops: GradientStop[],
  position: number
): RGB {
  return getGradientColor({ type: 'linear', stops }, position);
}

/**
 * Create CSS gradient string from config
 */
export function createCssGradient(config: GradientConfig): string {
  if (config.type === 'none' || !config.stops || config.stops.length === 0) {
    return 'transparent';
  }
  
  const stopsStr = config.stops
    .map(s => `${s.color} ${s.pos * 100}%`)
    .join(', ');
  
  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle ?? 0}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${config.angle ?? 0}deg, ${stopsStr})`;
    default:
      return 'transparent';
  }
}
