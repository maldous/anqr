import type { CanvasPool } from "./canvas-pool";
import { roundtripToFinalRaster } from "./qr-generator-helpers";
import type { DitherAttemptPatch } from "./dither-attempt-patch.types";
import type { ScanGateCallbacks } from "./scan-gate-callbacks.types";
import type { AnyCanvas } from "./any-canvas";

export async function runScanGateRescueLoop(
  pool: CanvasPool,
  patches: DitherAttemptPatch[],
  isPreviewScanGate: boolean,
  cb: ScanGateCallbacks,
  lastCanvas: AnyCanvas | null,
): Promise<{
  found: AnyCanvas | null;
  lastCanvas: AnyCanvas | null;
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
