import { createQRInstance } from '@/modules/qr-encoder';
import { computeCanvasSizing } from './compute-canvas-sizing';
import { computeMarginModules } from './compute-margin-modules';
import { drawCanvasError } from './draw-canvas-error';
import { logReproductionResult } from './log-reproduction-result';
import { nowMs } from './now-ms';
import { renderQRModules } from './render-qr-modules';
import { resolveColors } from './resolve-reproduction-colors';
import { runMatrixDiagnostics } from './run-matrix-diagnostics';
export { computeMarginModules } from './compute-margin-modules';
export { computeCanvasSizing } from './compute-canvas-sizing';

export function renderQRToCanvas(
  ctx: CanvasRenderingContext2D,
  qr: ReturnType<typeof createQRInstance>,
  moduleCount: number,
  marginModules: number,
  modulePx: number,
  size: number,
  fg: string,
  bg: string
) {
  const renderStartMs = nowMs();
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;
  renderQRModules(ctx, qr, moduleCount, marginModules, modulePx);
  return Math.round((nowMs() - renderStartMs) * 100) / 100;
}

export { resolveColors } from './resolve-reproduction-colors';

export { drawCanvasError } from './draw-canvas-error';
export { logReproductionResult } from './log-reproduction-result';
export { runMatrixDiagnostics } from './run-matrix-diagnostics';
