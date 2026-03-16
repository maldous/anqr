import type { DitherAttemptPatch } from "./dither-attempt-patch.types";
import type { ScanGateCallbacks } from "./scan-gate-callbacks.types";
import type { ScanGateLoopState } from "./scan-gate-loop.types";
import type { ScanGateMainLoopResult } from "./scan-gate-main-loop-result.types";

export function processEvaluatedAttempt(
  evaluated: {
    ok: boolean;
    baseDecodeOk: boolean;
    metrics: { edgeImprint: number; toneStd: number } | null;
    evaluatedCanvas: HTMLCanvasElement | OffscreenCanvas;
  },
  patch: DitherAttemptPatch,
  state: ScanGateLoopState,
  skipScanGateEscalation: boolean,
  cb: ScanGateCallbacks,
): ScanGateMainLoopResult | null {
  if (evaluated.baseDecodeOk && !state.bestBaseDecodable) {
    state.bestBaseDecodable = evaluated.evaluatedCanvas;
    state.bestBaseDecodablePatch = patch;
  }
  if (
    evaluated.metrics &&
    (state.prevEdgeImprint === null || evaluated.metrics.edgeImprint < state.prevEdgeImprint)
  ) {
    state.prevEdgeImprint = evaluated.metrics.edgeImprint;
  }
  if (evaluated.ok) {
    cb.rememberPatch(patch);
    return { earlyReturn: evaluated.evaluatedCanvas, lastCanvas: null };
  }
  if (skipScanGateEscalation && evaluated.baseDecodeOk) {
    cb.rememberPatch(patch);
    return { earlyReturn: evaluated.evaluatedCanvas, lastCanvas: null };
  }
  return null;
}
