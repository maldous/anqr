import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';

export function canUseFastPath(
  config: QRGeneratorConfig,
  hasOverlayData: boolean,
  gap: number
): boolean {
  const style = config.moduleStyle || 'square';
  if (style !== 'square') return false;
  if ((config.cornerRadius || 0) > 0) return false;
  if ((config.dotRotationDeg || 0) !== 0) return false;
  if (hasOverlayData) return false;
  if (config.gapMode === 'stroke') return false;
  if (gap > 0) return false;
  if (config.fastPreview) return true;
  if ((config.moduleJitterPx || 0) > 0) return false;
  const ts = config.timingStyle || 'match_module';
  if (ts !== 'match_module' && ts !== 'square') return false;
  if (config.palette && config.palette.length > 0) return false;
  if (config.contrastGuard && config.minContrastRatio) return false;
  return true;
}
