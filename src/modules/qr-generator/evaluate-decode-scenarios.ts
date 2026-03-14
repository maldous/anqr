import type { CanvasPool } from '../../platform/browser/canvas/canvas-factory';
import { computeScanGateRasterMetrics, roundtripToFinalRaster } from './qr-generator-helpers';
import { runRobustnessScenarios } from './run-robustness-scenarios';
import type { ScanGateCtx } from './scan-gate-ctx.interface';

export async function evaluateDecodeScenarios(
  ctx: ScanGateCtx,
  pool: CanvasPool,
  moduleCount: number,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  prevEdgeImprint: number | null,
  thresholds: { edge: number; toneStd: number; edgeWorsen: number },
  scenarioSeed: number,
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>
): Promise<{
  ok: boolean;
  baseDecodeOk: boolean;
  metrics: { edgeImprint: number; toneStd: number } | null;
  evaluatedCanvas: HTMLCanvasElement | OffscreenCanvas;
}> {
  const { effectiveConfig, isPreviewScanGate, isScanGateDisabled, skipScanGateEscalation } = ctx;
  if (isScanGateDisabled) {
    return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: canvas };
  }
  const finalRaster = isPreviewScanGate ? canvas : await roundtripToFinalRaster(pool, canvas);
  if (!(await runDecode(finalRaster))) {
    return { ok: false, baseDecodeOk: false, metrics: null, evaluatedCanvas: finalRaster };
  }
  if (skipScanGateEscalation) {
    const baseMetrics = isPreviewScanGate
      ? null
      : computeScanGateRasterMetrics(finalRaster, moduleCount, effectiveConfig);
    return { ok: true, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
  }
  if (isPreviewScanGate) {
    return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: finalRaster };
  }
  const baseMetrics = computeScanGateRasterMetrics(finalRaster, moduleCount, effectiveConfig);
  if (baseMetrics) {
    if (baseMetrics.edgeImprint > thresholds.edge || baseMetrics.toneStd < thresholds.toneStd) {
      return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
    }
    if (
      prevEdgeImprint !== null &&
      baseMetrics.edgeImprint > prevEdgeImprint + thresholds.edgeWorsen
    ) {
      return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
    }
  }
  const seeded01 = (salt: number): number => {
    const n = Math.sin((scenarioSeed + salt) * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  };
  const scenarios = [
    {
      blur: 0.8 + seeded01(11) * 0.4,
      exposure: -0.24 + seeded01(13) * 0.08,
      skewX: finalRaster.width * 0.02,
      skewY: finalRaster.height * 0.012,
      downscale: 0.9,
    },
    {
      blur: 1 + seeded01(17) * 0.5,
      exposure: 0.18 + seeded01(19) * 0.12,
      skewX: finalRaster.width * 0.028,
      skewY: finalRaster.height * 0.018,
      downscale: 0.82,
    },
  ];
  const allScenariosPass = await runRobustnessScenarios(pool, finalRaster, scenarios, runDecode);
  if (!allScenariosPass) {
    return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
  }
  return { ok: true, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
}
