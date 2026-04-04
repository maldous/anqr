import { listIntegrationCandidates, getFinalizationState } from "../../symphony-state.mjs";

export function showStatus() {
  const candidates = listIntegrationCandidates();
  console.log("\n=== Integration Queue ===");
  console.log(`Candidates: ${candidates.length}`);
  for (const id of candidates) {
    const fin = getFinalizationState(id);
    console.log(
      `  ${id}: state=${fin?.state || "unknown"} branch=${fin?.branch || "?"} head=${fin?.headSha?.slice(0, 8) || "?"}`,
    );
  }
  console.log();
}
