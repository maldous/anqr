import { describe, it, expect, beforeEach } from "vitest";
import { createEvidenceRecord, loadEvidenceRecord, recordRoutingDecision, recordWorktreeSelection, recordProviderSelection, recordExecutionResult, appendEvidenceEvent } from "../../harness/ops/core/task-evidence.mjs";
import { generateCorrelationId } from "../../harness/ops/lib/correlation-id.mjs";

// NOTE: These tests verify the task-evidence module API for Discord flow scenarios.
// They are NOT true end-to-end runtime tests — they call the evidence helpers
// directly in-process rather than driving real HTTP requests through the live
// Discord router, worktree proxy, and executor.
describe("Task evidence: Discord/OpenClaw flow scenarios", () => {
  let correlationId: string;

  beforeEach(() => {
    correlationId = generateCorrelationId("discord");
  });

  it("happy path: discord request → route → execute → respond", () => {
    createEvidenceRecord(correlationId, {
      source: "discord-router",
      discordThreadId: "thread-abc-123",
      requestIdentifier: "msg-12345",
    });

    recordRoutingDecision(correlationId, {
      targetWorktreePool: "wt5-wt8",
      routingStrategy: "sticky-session",
    });

    recordWorktreeSelection(correlationId, {
      worktreeId: "wt5",
      reason: "sticky-match-thread",
    });

    recordProviderSelection(correlationId, {
      providerName: "codebuff-direct",
      model: "codebuff-sdk",
    });

    recordExecutionResult(correlationId, {
      startedAt: new Date().toISOString(),
      durationMs: 8000,
      success: true,
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record).not.toBeNull();
    expect(record!.ingress.source).toBe("discord-router");
    expect(record!.routing?.routingStrategy).toBe("sticky-session");
    expect(record!.worktreeSelection?.worktreeId).toBe("wt5");
    expect(record!.execution?.success).toBe(true);
  });

  it("sticky routing reuse returns same worktree", () => {
    createEvidenceRecord(correlationId, {
      source: "discord-router",
      discordThreadId: "thread-sticky-001",
    });

    recordWorktreeSelection(correlationId, {
      worktreeId: "wt6",
      reason: "first-available",
    });

    const secondId = generateCorrelationId("discord");
    createEvidenceRecord(secondId, {
      source: "discord-router",
      discordThreadId: "thread-sticky-001",
    });

    recordWorktreeSelection(secondId, {
      worktreeId: "wt6",
      reason: "sticky-match-thread",
    });

    const first = loadEvidenceRecord(correlationId);
    const second = loadEvidenceRecord(secondId);
    expect(first!.worktreeSelection?.worktreeId)
      .toBe(second!.worktreeSelection?.worktreeId);
  });

  it("provider fallback path is recorded", () => {
    createEvidenceRecord(correlationId, {
      source: "discord-router",
      discordThreadId: "thread-fallback-001",
    });

    recordProviderSelection(correlationId, {
      providerName: "openrouter",
      model: "claude-3.5-sonnet",
      isFallback: true,
      fallbackReason: "codebuff-direct returned 503",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.providerSelection?.isFallback).toBe(true);
  });

  it("worktree unavailable is recorded", () => {
    createEvidenceRecord(correlationId, {
      source: "discord-router",
      discordThreadId: "thread-noworktree-001",
    });

    appendEvidenceEvent(correlationId, {
      type: "worktree-unavailable",
      detail: "All Discord worktrees (wt5-wt8) busy",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.events).toHaveLength(1);
    expect(record!.events[0].type).toBe("worktree-unavailable");
  });

  it("partial failure reporting produces evidence", () => {
    createEvidenceRecord(correlationId, {
      source: "discord-router",
      discordThreadId: "thread-partial-001",
    });

    recordExecutionResult(correlationId, {
      startedAt: new Date().toISOString(),
      durationMs: 30000,
      success: false,
      error: "Connection reset during streaming response",
    });

    appendEvidenceEvent(correlationId, {
      type: "partial-failure-reported",
      detail: "User notified of partial failure via Discord",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.execution?.success).toBe(false);
    expect(record!.events).toHaveLength(1);
  });
});
