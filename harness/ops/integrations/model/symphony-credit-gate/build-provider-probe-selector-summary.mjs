import { buildProviderProbeSequence } from "./build-provider-probe-sequence.mjs";

export function buildProviderProbeSelectorSummary(results) {
  const byName = new Map(results.map((result) => [result.providerName, result]));
  let wouldChoose = null;
  const sequence = buildProviderProbeSequence().map((entry) => {
    const result = byName.get(entry.name);
    const probeSelectable = Boolean(
      result && (result.status === "success" || result.status === "degraded"),
    );
    const bridgeSelectable = Boolean(result) && result.bridgeRoute?.status === "advertised";
    const toolingSelectable =
      !result?.routeInfo?.knownToolCapable ||
      ["capable", "inconclusive"].includes(result?.toolProbe?.toolStatus || "not_probed");
    const selectable = probeSelectable && bridgeSelectable && toolingSelectable;
    if (!wouldChoose && selectable) {
      wouldChoose = {
        providerName: entry.name,
        source: entry.source,
        status: result.status,
        reason: result.reason,
      };
    }
    return {
      providerName: entry.name,
      source: entry.source,
      status: result?.status || "missing",
      reason: result?.reason || "provider missing from probe results",
      bridgeStatus: result?.bridgeRoute?.status || "missing",
      bridgeReason: result?.bridgeRoute?.reason || "provider missing from probe results",
      probeSelectable,
      bridgeSelectable,
      selectable,
    };
  });
  return { wouldChoose, sequence };
}
