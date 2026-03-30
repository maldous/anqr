#!/usr/bin/env node

/**
 * incident-manager.mjs — Auto-create and manage incidents with evidence
 */

import { createIssue, addComment, findOpenIssuesByDescriptionFragment } from "./linear-client.mjs";
import { STATES, LABELS } from "./linear-client.mjs";
import { generateIncidentFingerprint, buildFingerprintMarker } from "./incident-fingerprint.mjs";
import { collectIncidentEvidence, formatEvidenceForIssue } from "./incident-evidence.mjs";
import { createLogger } from "../../lib/logger.mjs";

const { logInfo, logWarn, logError } = createLogger();

// Deduplication window: don't create new incident if same fingerprint exists within 24h
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Incident type configuration
 */
const INCIDENT_TYPES = {
  WATCHDOG_ROLLBACK: {
    priority: 0, // P0
    titlePrefix: "Watchdog rollback",
    estimate: 3,
  },
  RAPID_RESTART: {
    priority: 1, // P1
    titlePrefix: "Rapid restart pattern",
    estimate: 3,
  },
  PROVIDERS_EXHAUSTED: {
    priority: 1, // P1
    titlePrefix: "All providers exhausted",
    estimate: 2,
  },
  RETRY_EXHAUSTED: {
    priority: 2, // P2
    titlePrefix: "Issue retry exhausted",
    estimate: 2,
  },
};

/**
 * Find existing incident by fingerprint within deduplication window
 */
async function findExistingIncident(fingerprint) {
  try {
    // Search for fingerprint marker in open incidents
    const openIssues = await findOpenIssuesByDescriptionFragment(`incident-fingerprint: ${fingerprint}`);
    
    if (openIssues.length === 0) {
      return null;
    }
    
    // Check if any match is within the dedup window
    const now = Date.now();
    for (const issue of openIssues) {
      const issueAge = now - new Date(issue.createdAt).getTime();
      if (issueAge < DEDUP_WINDOW_MS) {
        logInfo(`[incident] Found existing incident within 24h: ${issue.identifier}`);
        return issue;
      }
    }
    
    return null;
  } catch (err) {
    logWarn(`[incident] Failed to search for existing incident: ${err.message}`);
    return null;
  }
}

/**
 * Build incident title
 */
function buildIncidentTitle(type, context) {
  const config = INCIDENT_TYPES[type];
  if (!config) {
    return `Incident: ${type}`;
  }
  
  const { titlePrefix } = config;
  const { service, issueRef, trigger } = context;
  
  if (service) {
    return `${titlePrefix}: ${service}`;
  }
  
  if (issueRef) {
    return `${titlePrefix}: ${issueRef}`;
  }
  
  if (trigger) {
    return `${titlePrefix}: ${trigger}`;
  }
  
  return titlePrefix;
}

/**
 * Build incident description
 */
function buildIncidentDescription(type, context, evidence, fingerprint) {
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

/**
 * Create or update incident
 * 
 * @param {object} params - Incident parameters
 * @param {string} params.type - Incident type (WATCHDOG_ROLLBACK, etc.)
 * @param {string} params.service - Service name (optional)
 * @param {string} params.trigger - Trigger reason (optional)
 * @param {string} params.issueRef - Related issue identifier (optional)
 * @param {object} params.evidence - Evidence object (optional, will be collected if not provided)
 * @returns {Promise<object>} Created or updated issue
 */
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
  const description = buildIncidentDescription(type, { service, trigger, issueRef }, evidence, fingerprint);
  
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
