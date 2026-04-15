import { loadEvidenceRecord } from "./load-evidence-record.mjs";

/**
 * Query routing evidence for a request — answers "for request X, why was
 * provider Y chosen?"
 *
 * Reconstructs the full routing decision path from the evidence record,
 * including provider selection, fallback chain, context reductions, and
 * safety-net activation.
 *
 * @param {string} correlationId
 * @returns {{ found: boolean, summary: object|null }}
 */
export function queryRoutingEvidence(correlationId) {
  const record = loadEvidenceRecord(correlationId);
  if (!record) return { found: false, summary: null };

  const providerSelection = record.providerSelection || null;
  const providerRouting = record.providerRouting || null;
  const contextReduction = record.contextReduction || null;
  const safetyNet = record.safetyNet || null;

  const summary = {
    correlationId,
    recordedAt: record.createdAt || record.updatedAt || null,

    // Provider selection: which provider was initially chosen
    selection: providerSelection
      ? {
          providerName: providerSelection.providerName,
          model: providerSelection.model,
        }
      : null,

    // Routing: full cascade details
    routing: providerRouting
      ? {
          routeModelId: providerRouting.routeModelId,
          allowedProviders: providerRouting.allowedProviders,
          selectedProvider: providerRouting.selectedProvider,
          attempts: providerRouting.attempts,
          triedProviders: providerRouting.triedProviders,
          hasFallback: providerRouting.hasFallback,
          fallbackChain: providerRouting.fallbackChain || [],
        }
      : null,

    // Context reduction: adaptive context budget changes during cascade
    contextReduction: contextReduction
      ? {
          reductionCount: contextReduction.reductionCount,
          finalCap: contextReduction.finalCap,
          reductions: contextReduction.reductions || [],
        }
      : null,

    // Safety-net: all providers exhausted
    safetyNet: safetyNet
      ? {
          activatedAt: safetyNet.activatedAt,
          totalAttempts: safetyNet.totalAttempts,
          triedProviders: safetyNet.triedProviders,
          lastError: safetyNet.lastError,
        }
      : null,

    // Human-readable explanation
    explanation: buildExplanation(providerSelection, providerRouting, contextReduction, safetyNet),
  };

  return { found: true, summary };
}

/** Build a human-readable explanation of the routing decision. */
function buildExplanation(selection, routing, contextReduction, safetyNet) {
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
