// Generated from ../../../../scripts/ops/integrations/linear/incident-manager.mjs:135

import { buildFingerprintMarker } from "../incident-fingerprint.mjs";
import { formatEvidenceForIssue } from "../incident-evidence.mjs";

export function buildIncidentDescription(type, context, evidence, fingerprint) {
  const lines = [];

  // Add fingerprint marker (hidden in UI, used for deduplication)
  lines.push(buildFingerprintMarker(fingerprint));
  lines.push("");

  lines.push(`# ${type}`);
  lines.push("");

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
  lines.push("---");
  lines.push("");
  lines.push("## Resolution");
  lines.push("");
  lines.push("This incident will auto-close when:");
  lines.push("1. Service health checks pass consistently for >1 hour");
  lines.push("2. Related issue (if any) moves to Done state");
  lines.push("");
  lines.push("To manually resolve, add evidence of root cause fix and move to Done.");

  return lines.join("\n");
}
