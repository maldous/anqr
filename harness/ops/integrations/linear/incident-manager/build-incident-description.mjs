import { buildFingerprintMarker } from "../incident-fingerprint.mjs";
import { formatEvidenceForIssue } from "../incident-evidence.mjs";

export function buildIncidentDescription(type, context, evidence, fingerprint) {
  const lines = [
    // Add fingerprint marker (hidden in UI, used for deduplication)
    buildFingerprintMarker(fingerprint),
    "",
    `# ${type}`,
    "",
  ];

  // Context
  if (context.service) {
    lines.push(`**Service:** ${context.service}`);
  }
  if (context.trigger) {
    lines.push(`**Trigger:** ${context.trigger}`);
  }
  if (context.issueRef) {
    lines.push(`**Related Issue:** ${context.issueRef}`);
  }
  lines.push("");

  // Evidence
  lines.push(formatEvidenceForIssue(evidence));

  // Resolution instructions
  lines.push("---", "", "## Resolution", "", "This incident will auto-close when:",
    "1. Service health checks pass consistently for >1 hour",
    "2. Related issue (if any) moves to Done state",
    "",
    "To manually resolve, add evidence of root cause fix and move to Done.");

  return lines.join("\n");
}
