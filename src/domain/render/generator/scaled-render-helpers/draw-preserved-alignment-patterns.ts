import { drawAlignmentPattern } from '../drawing';
import { getAlignmentPositionsCached } from '../pattern-helpers';
import { resolveBinaryConfig } from './resolve-binary-config';
import type { StructuralPreservationCtx } from '../scaled-render-types';

export function drawPreservedAlignmentPatterns(spctx: StructuralPreservationCtx): void {
  const {
    ctx,
    marginPx,
    moduleCount,
    effectiveModuleSize,
    config,
    version,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor,
    overlayCanvas,
  } = spctx;
  if (forceBinaryFunctionPatterns || version < 2) return;
  if (config.preserveAlignment === false && overlayCanvas) return;
  const resolvedConfig = resolveBinaryConfig(
    config,
    forceBinaryFunctionPatterns,
    effectiveFgColor,
    effectiveBgColor
  );
  const alignPositions = getAlignmentPositionsCached(version, moduleCount);
  const alignmentStyle = config.alignmentStyle || 'match_finder';
  for (const pos of alignPositions) {
    drawAlignmentPattern(
      ctx,
      marginPx + (pos.col + 0.5) * effectiveModuleSize,
      marginPx + (pos.row + 0.5) * effectiveModuleSize,
      effectiveModuleSize,
      alignmentStyle,
      resolvedConfig
    );
  }
}
