import { collectIncidentEvidence, formatEvidenceForIssue } from "../incident-evidence.mjs";
import { generateIncidentFingerprint } from "../incident-fingerprint.mjs";
import { createIssue, addComment } from "../linear-client.mjs";
import { STATES, LABELS } from "../linear-client.mjs";

import { INCIDENT_TYPES } from "./incident-types.mjs";
import { buildIncidentDescription } from "./build-incident-description.mjs";
import { buildIncidentTitle } from "./build-incident-title.mjs";
import { findExistingIncident } from "./find-existing-incident.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function createOrUpdateIncident(params) {
  const { type, service = null, trigger = null, issueRef = null } = params;
  let { evidence } = params;

  // Validate type
  if (!INCIDENT_TYPES[type]) {
    throw new Error(`Unknown incident type: ${type}`);
  }

  const config = INCIDENT_TYPES[type];

  // Collect evidence if not provided
  if (!evidence) {
    evidence = await collectIncidentEvidence(service, {
      type,
      service,
      trigger,
      issueRef,
    });
  }

  // Generate fingerprint for deduplication
  const fingerprint = generateIncidentFingerprint({
    type,
    service: service || "unknown",
    errorSignature: trigger || "",
  });

  logInfo(`[incident] Processing incident: ${type} (fingerprint: ${fingerprint})`);

  // Check for existing incident
  const existing = await findExistingIncident(fingerprint);

  if (existing) {
    // Add comment to existing incident instead of creating new one
    const commentLines = [
      `## Recurrence: ${new Date().toISOString()}`,
      "",
      `This incident occurred again.`,
      "",
    ];

    if (trigger) {
      commentLines.push(`**Trigger:** ${trigger}`);
      commentLines.push("");
    }

    commentLines.push("### Evidence");
    commentLines.push(formatEvidenceForIssue(evidence));

    await addComment(existing.id, commentLines.join("\n"));

    logInfo(`[incident] Added recurrence comment to ${existing.identifier}`);
    return existing;
  }

  // Create new incident
  const title = buildIncidentTitle(type, { service, trigger, issueRef });
  const description = buildIncidentDescription(
    type,
    { service, trigger, issueRef },
    evidence,
    fingerprint,
  );

  const issueInput = {
    title,
    description,
    stateId: STATES.todo,
    labelIds: [LABELS.incident, LABELS.harness],
    priority: config.priority,
    estimate: config.estimate,
  };

  try {
    const issue = await createIssue(issueInput);
    logInfo(`[incident] ✅ Created incident: ${issue.identifier} — ${issue.title}`);
    return issue;
  } catch (err) {
    logError(`[incident] ❌ Failed to create incident: ${err.message}`);
    throw err;
  }
}
