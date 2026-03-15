import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';

export function applyArtworkMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, config } = context;
  // Artwork mode: True QR-Art rendering (Russ Cox algorithm)
  // The image appears through the DATA MODULE PATTERN, not visual effects.
  // The QR-Art fragment search finds URL fragments that produce QR data
  // modules matching the target image - we just render normally as pure B&W.
  //
  // This is fundamentally different from other overlay modes:
  // - Other modes: modify how modules LOOK (size, color, fill)
  // - Artwork mode: modify what DATA is encoded to control which modules are dark/light
  //
  // The overlay image is used only for SCORING during fragment search,
  // not for visual post-processing during rendering.
  result.shouldDrawCell = isDark; // Normal QR rendering - only draw dark modules
  result.moduleColor = isDark ? config.fgColor : config.bgColor; // Pure black/white
  result.moduleSizeModifier = 1; // Full size modules, no halftone
  // No fills, no tinting - the art IS the QR pattern itself
}
