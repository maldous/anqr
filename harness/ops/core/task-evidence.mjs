import fs from "node:fs";
import path from "node:path";

function getEvidenceDir() {
  const base =
    process.env.ANQR_EVIDENCE_DIR ||
    path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-task-evidence");
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function getEvidencePath(correlationId) {
  return path.join(getEvidenceDir(), `${correlationId}.json`);
}

export function createEvidenceRecord(correlationId, ingressMetadata) {
  const record = {
    correlationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ingress: {
      source: ingressMetadata.source || null,
      receivedAt: ingressMetadata.receivedAt || new Date().toISOString(),
      issueIdentifier: ingressMetadata.issueIdentifier || null,
      requestIdentifier: ingressMetadata.requestIdentifier || null,
      webhookDeliveryId: ingressMetadata.webhookDeliveryId || null,
      discordThreadId: ingressMetadata.discordThreadId || null,
    },
    routing: null,
    worktreeSelection: null,
    providerSelection: null,
    execution: null,
    validation: null,
    push: null,
    integration: null,
    watchdog: [],
    events: [],
  };
  saveEvidence(correlationId, record);
  return record;
}

export function loadEvidenceRecord(correlationId) {
  try {
    return JSON.parse(fs.readFileSync(getEvidencePath(correlationId), "utf-8"));
  } catch {
    return null;
  }
}

export function updateEvidenceRecord(correlationId, patch) {
  const record = loadEvidenceRecord(correlationId);
  if (!record) return null;
  const updated = { ...record, ...patch, updatedAt: new Date().toISOString() };
  saveEvidence(correlationId, updated);
  return updated;
}

export function recordRoutingDecision(correlationId, routing) {
  return updateEvidenceRecord(correlationId, {
    routing: {
      decidedAt: new Date().toISOString(),
      targetWorktreePool: routing.targetWorktreePool || null,
      routingStrategy: routing.routingStrategy || null,
      queuePosition: routing.queuePosition ?? null,
    },
  });
}

export function recordWorktreeSelection(correlationId, selection) {
  return updateEvidenceRecord(correlationId, {
    worktreeSelection: {
      selectedAt: new Date().toISOString(),
      worktreeId: selection.worktreeId,
      reason: selection.reason || null,
    },
  });
}

export function recordProviderSelection(correlationId, provider) {
  return updateEvidenceRecord(correlationId, {
    providerSelection: {
      selectedAt: new Date().toISOString(),
      providerName: provider.providerName,
      model: provider.model || null,
      isFallback: provider.isFallback || false,
      fallbackReason: provider.fallbackReason || null,
    },
  });
}

export function recordExecutionResult(correlationId, execution) {
  return updateEvidenceRecord(correlationId, {
    execution: {
      startedAt: execution.startedAt || null,
      completedAt: execution.completedAt || new Date().toISOString(),
      durationMs: execution.durationMs ?? null,
      success: execution.success,
      error: execution.error || null,
      filesChanged: execution.filesChanged || [],
    },
  });
}

export function recordValidationResult(correlationId, validation) {
  return updateEvidenceRecord(correlationId, {
    validation: {
      ranAt: new Date().toISOString(),
      passed: validation.passed,
      typecheckPassed: validation.typecheckPassed ?? null,
      testsPassed: validation.testsPassed ?? null,
      lintPassed: validation.lintPassed ?? null,
      errors: validation.errors || [],
    },
  });
}

export function recordPushResult(correlationId, push) {
  return updateEvidenceRecord(correlationId, {
    push: {
      pushedAt: new Date().toISOString(),
      branch: push.branch || null,
      sha: push.sha || null,
      success: push.success,
      error: push.error || null,
    },
  });
}

export function recordIntegrationResult(correlationId, integration) {
  return updateEvidenceRecord(correlationId, {
    integration: {
      integratedAt: new Date().toISOString(),
      mainSha: integration.mainSha || null,
      success: integration.success,
      method: integration.method || null,
      error: integration.error || null,
    },
  });
}

export function recordWatchdogEvent(correlationId, event) {
  const record = loadEvidenceRecord(correlationId);
  if (!record) return null;
  const watchdogEntry = {
    recordedAt: new Date().toISOString(),
    service: event.service || null,
    action: event.action || null,
    reason: event.reason || null,
    worktreeId: event.worktreeId || null,
    success: event.success ?? null,
  };
  const updated = {
    ...record,
    watchdog: [...(record.watchdog || []), watchdogEntry],
    updatedAt: new Date().toISOString(),
  };
  saveEvidence(correlationId, updated);
  return updated;
}

export function recordRecoveryEvent(correlationId, event) {
  const record = loadEvidenceRecord(correlationId);
  if (!record) return null;
  const recoveryEntry = {
    recordedAt: new Date().toISOString(),
    worktreeId: event.worktreeId || null,
    action: event.action || null,
    reason: event.reason || null,
    success: event.success ?? null,
    error: event.error || null,
  };
  const events = record.events || [];
  events.push({ type: "recovery", ...recoveryEntry });
  const updated = {
    ...record,
    events,
    updatedAt: new Date().toISOString(),
  };
  saveEvidence(correlationId, updated);
  return updated;
}

function saveEvidence(correlationId, record) {
  const filePath = getEvidencePath(correlationId);
  const tmpFile = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(record, null, 2) + "\n");
  fs.renameSync(tmpFile, filePath);
}
