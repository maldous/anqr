import type { OverlayDitherOptions } from './processor.types';

// ============================================
// CONSTANTS
// ============================================

export const DEFAULT_MOBILE_DITHER: OverlayDitherOptions = {
  enabled: true,
  kind: 'floyd_steinberg',
  strength: 0.8,
  levels: 4,
  serpentine: true,
};
