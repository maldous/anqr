import type { RenderCellCtx } from './render-cell-ctx.interface';

export function shouldApplyOverlayToModule(
  rctx: RenderCellCtx,
  isFinder: boolean,
  isTiming: boolean,
  isAlignment: boolean,
  isFormat: boolean,
  isVersion: boolean
): boolean {
  return (
    rctx.hasOverlayData &&
    !(rctx.preserveFinders && isFinder) &&
    !(rctx.preserveTiming && isTiming) &&
    !(rctx.preserveAlignment && isAlignment) &&
    !(rctx.protectFormat && isFormat) &&
    !(rctx.protectVersion && isVersion)
  );
}
