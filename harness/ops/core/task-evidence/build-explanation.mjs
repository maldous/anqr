/** Build a human-readable explanation of the routing decision. */
export function buildExplanation(selection, routing, contextReduction, safetyNet) {
  const parts = [];

  if (safetyNet?.exhausted) {
    parts.push(
      `All ${safetyNet.totalAttempts} providers exhausted. ` +
        `Last error: ${safetyNet.lastError || "unknown"}`,
    );
  } else if (routing) {
    if (routing.hasFallback) {
      parts.push(
        `Provider ${routing.selectedProvider} succeeded after ${routing.attempts} attempts. ` +
          `Fallback chain: ${routing.triedProviders.join(" → ")}`,
      );
    } else {
      parts.push(`Provider ${routing.selectedProvider} succeeded on first attempt.`);
    }
  } else if (selection) {
    parts.push(`Provider ${selection.providerName} was selected.`);
  }

  if (contextReduction) {
    parts.push(
      `Context was reduced ${contextReduction.reductionCount} time(s), ` +
        `final cap: ${contextReduction.finalCap} tokens.`,
    );
  }

  return parts.join(" ") || "No routing evidence available.";
}
