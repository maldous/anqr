import { getAdaptiveParams } from "./get-adaptive-params.mjs";
import { saveAdaptiveParams } from "./save-adaptive-params.mjs";
import { logInfo } from "./logger.mjs";

export function getEvaluationSampleProvider(allProviderNames, providerStats) {
  // Check if evaluation cycle should trigger (peek without incrementing)
  const params = getAdaptiveParams();
  const now = Date.now();
  const timeSinceLastEval = now - params.evalCycle.lastEval;
  const shouldEval =
    params.evalCycle.counter >= params.evalCycle.requestThreshold ||
    timeSinceLastEval >= params.evalCycle.timeThreshold;

  if (!shouldEval) {
    return null;
  }

  // Reset the cycle since we're consuming it
  params.evalCycle.counter = 0;
  params.evalCycle.lastEval = now;
  saveAdaptiveParams(params);
  logInfo(
    `[session-state] 🔄 Triggering periodic evaluation cycle (all providers will be sampled)`,
  );

  // Handle empty provider list
  if (!allProviderNames || allProviderNames.length === 0) {
    return undefined;
  }

  // Find providers that haven't been selected recently or at all
  const providerScores = allProviderNames.map((name) => {
    const stats = providerStats[name] || { selections: 0, lastUsed: 0 };
    const timeSinceUsed = Date.now() - (stats.lastUsed || 0);
    const selectionsCount = stats.selections || 0;

    // Score: prefer providers with fewer selections and longer time since use
    return {
      name,
      score: timeSinceUsed / 1000 - selectionsCount * 1000,
    };
  });

  // Sort by score (highest = most underused)
  providerScores.sort((a, b) => b.score - a.score);

  const selected = providerScores[0]?.name;
  if (selected) {
    logInfo(
      `[session-state] 🎯 Evaluation cycle: forcing sample of underused provider "${selected}"`,
    );
  }

  return selected;
}
