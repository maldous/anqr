import { getAdaptiveParams } from "./get-adaptive-params.mjs";
import { saveAdaptiveParams } from "./save-adaptive-params.mjs";
import { logInfo } from "./logger.mjs";

export function shouldTriggerEvalCycle() {
  const params = getAdaptiveParams();
  const now = Date.now();

  params.evalCycle.counter++;

  const timeSinceLastEval = now - params.evalCycle.lastEval;
  const shouldEval =
    params.evalCycle.counter >= params.evalCycle.requestThreshold ||
    timeSinceLastEval >= params.evalCycle.timeThreshold;

  if (shouldEval) {
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = now;
    saveAdaptiveParams(params);
    logInfo(
      `[session-state] 🔄 Triggering periodic evaluation cycle (all providers will be sampled)`,
    );
  } else {
    // Save incremented counter even if not triggering
    saveAdaptiveParams(params);
  }

  return shouldEval;
}
