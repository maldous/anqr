import type { CanvasPool } from '../../platform/browser/canvas/canvas-factory';
import { roundtripToFinalRaster } from './qr-generator-helpers';
import { resolveScanGateIntensity } from './qr-generator-scan-gate-patches';
import type { DitherAttemptPatch } from './dither-attempt-patch.type';
import type { ScanGateCallbacks } from './scan-gate-callbacks.interface';
import type { ScanGateCtx } from './scan-gate-ctx.interface';
import type { QRGeneratorConfig } from './types';

export async function runScanGateQRFirstFallback(
  pool: CanvasPool,
  sgctx: ScanGateCtx,
  isPreviewScanGate: boolean,
  requestedOverlayIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  lastPatch: DitherAttemptPatch,
  cb: ScanGateCallbacks
): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const qrFirstDrops = isPreviewScanGate ? [10, 16, 22, 28, 34] : [8, 14, 20, 26, 32, 38, 44];
  const qrFirstIntensities = qrFirstDrops
    .map((drop) => resolveScanGateIntensity(sgctx, drop, { minIntensity: 6, maxDrop: 46 }))
    .filter(
      (intensity, idx, values) =>
        intensity < requestedOverlayIntensity && values.indexOf(intensity) === idx
    );
  let qrFirstLast: HTMLCanvasElement | OffscreenCanvas | null = null;
  for (const intensity of qrFirstIntensities) {
    if (qrFirstLast) {
      pool.release(qrFirstLast);
      qrFirstLast = null;
    }
    const qrFirstFallback = await cb.renderScaled({
      ...cb.buildAttemptConfig(lastPatch),
      qrFirstMode: true,
      overlayIntensity: Math.min(intensity, effectiveConfig.overlayIntensity ?? 100),
    });
    const fallbackRaster = isPreviewScanGate
      ? qrFirstFallback
      : await roundtripToFinalRaster(pool, qrFirstFallback);
    qrFirstLast = fallbackRaster;
    if (await cb.runDecode(fallbackRaster)) {
      if (effectiveConfig.qrFirstMode === true) {
        cb.rememberPatch({ ...lastPatch, qrFirstMode: true, overlayIntensity: intensity });
      }
      return fallbackRaster;
    }
  }
  return qrFirstLast;
}
