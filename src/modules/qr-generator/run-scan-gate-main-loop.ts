import type { CanvasPool } from '../../platform/browser/canvas/canvas-factory';
import { evaluateDecodeScenarios } from './evaluate-decode-scenarios';
import { processEvaluatedAttempt } from './process-evaluated-attempt';
import type { DitherAttemptPatch } from './dither-attempt-patch.type';
import type { ScanGateCallbacks } from './scan-gate-callbacks.interface';
import type { ScanGateCtx } from './scan-gate-ctx.interface';
import type { ScanGateLoopState } from './scan-gate-loop-state.interface';
import type { ScanGateMainLoopResult } from './scan-gate-main-loop-result.interface';

export async function runScanGateMainLoop(
  pool: CanvasPool,
  sgctx: ScanGateCtx,
  moduleCount: number,
  attempts: DitherAttemptPatch[],
  thresholds: { edge: number; toneStd: number; edgeWorsen: number },
  scenarioSeed: number,
  skipScanGateEscalation: boolean,
  cb: ScanGateCallbacks
): Promise<ScanGateMainLoopResult> {
  let lastCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  const state: ScanGateLoopState = {
    bestBaseDecodable: null,
    bestBaseDecodablePatch: null,
    prevEdgeImprint: null,
  };
  for (const patch of attempts) {
    if (lastCanvas && lastCanvas !== state.bestBaseDecodable) {
      pool.release(lastCanvas);
      lastCanvas = null;
    }
    const attemptCanvas = await cb.renderScaled(cb.buildAttemptConfig(patch));
    try {
      const evaluated = await evaluateDecodeScenarios(
        sgctx,
        pool,
        moduleCount,
        attemptCanvas,
        state.prevEdgeImprint,
        thresholds,
        scenarioSeed,
        cb.runDecode
      );
      lastCanvas = evaluated.evaluatedCanvas;
      const result = processEvaluatedAttempt(evaluated, patch, state, skipScanGateEscalation, cb);
      if (result) return result;
    } catch {
      lastCanvas = attemptCanvas;
    }
  }
  if (state.bestBaseDecodable) {
    if (state.bestBaseDecodablePatch) cb.rememberPatch(state.bestBaseDecodablePatch);
    return { earlyReturn: state.bestBaseDecodable, lastCanvas: null };
  }
  return { earlyReturn: null, lastCanvas };
}
