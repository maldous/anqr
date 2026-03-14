import type { CanvasPool } from '../../platform/browser/canvas/canvas-factory';
import { roundtripToFinalRaster } from './qr-generator-helpers';
import type { DitherAttemptPatch } from './dither-attempt-patch.type';
import type { ScanGateCallbacks } from './scan-gate-callbacks.interface';

export async function runScanGateRescueLoop(
  pool: CanvasPool,
  patches: DitherAttemptPatch[],
  isPreviewScanGate: boolean,
  cb: ScanGateCallbacks,
  lastCanvas: HTMLCanvasElement | OffscreenCanvas | null
): Promise<{
  found: HTMLCanvasElement | OffscreenCanvas | null;
  lastCanvas: HTMLCanvasElement | OffscreenCanvas | null;
}> {
  let tracking = lastCanvas;
  for (const patch of patches) {
    if (tracking) {
      pool.release(tracking);
      tracking = null;
    }
    const rescueCanvas = await cb.renderScaled(cb.buildAttemptConfig(patch));
    const rescueRaster = isPreviewScanGate
      ? rescueCanvas
      : await roundtripToFinalRaster(pool, rescueCanvas);
    if (await cb.runDecode(rescueRaster)) {
      cb.rememberPatch(patch);
      return { found: rescueRaster, lastCanvas: tracking };
    }
    tracking = rescueRaster;
  }
  return { found: null, lastCanvas: tracking };
}
