/**
 * Shared helpers for E2E tests that run against live ANQR services.
 *
 * These helpers read evidence records from the same directory the services
 * write to (both run as the same user, so XDG_RUNTIME_DIR matches).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const LINEAR_WEBHOOK_URL = "http://127.0.0.1:18791";
export const DISCORD_ROUTER_URL = "http://127.0.0.1:18790";
export const SYMPHONY_ROUTER_URL = "http://127.0.0.1:4319";

export const EVIDENCE_DIR = path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-task-evidence");

export interface EvidenceRecord {
  correlationId: string;
  createdAt: string;
  updatedAt: string;
  ingress: {
    source: string | null;
    receivedAt: string | null;
    issueIdentifier: string | null;
    requestIdentifier: string | null;
    webhookDeliveryId: string | null;
    discordThreadId: string | null;
  };
  routing: {
    decidedAt: string;
    targetWorktreePool: string | null;
    routingStrategy: string | null;
    queuePosition: number | null;
  } | null;
  worktreeSelection: {
    selectedAt: string;
    worktreeId: string;
    reason: string | null;
  } | null;
  providerSelection: Record<string, unknown> | null;
  execution: Record<string, unknown> | null;
  validation: Record<string, unknown> | null;
  push: Record<string, unknown> | null;
  integration: Record<string, unknown> | null;
  watchdog: unknown[];
  events: unknown[];
}

function listEvidenceFiles(): string[] {
  try {
    return fs
      .readdirSync(EVIDENCE_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(EVIDENCE_DIR, f));
  } catch {
    return [];
  }
}

function loadEvidence(filePath: string): EvidenceRecord | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function findEvidenceByIssue(identifier: string): EvidenceRecord | null {
  for (const file of listEvidenceFiles()) {
    const record = loadEvidence(file);
    if (record?.ingress?.issueIdentifier === identifier) return record;
  }
  return null;
}

export function findEvidenceBySource(source: string, afterIso: string): EvidenceRecord | null {
  const candidates: EvidenceRecord[] = [];
  for (const file of listEvidenceFiles()) {
    const record = loadEvidence(file);
    if (!record || record.ingress?.source !== source) continue;
    if (record.createdAt < afterIso) continue;
    candidates.push(record);
  }
  candidates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return candidates[0] ?? null;
}

export function deleteEvidence(correlationId: string): void {
  const filePath = path.join(EVIDENCE_DIR, `${correlationId}.json`);
  try {
    fs.unlinkSync(filePath);
  } catch {
    /* already gone */
  }
}

export async function assertServiceHealthy(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${url}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

function resolveLinearWebhookSecret(): string {
  if (process.env.LINEAR_WEBHOOK_SECRET) return process.env.LINEAR_WEBHOOK_SECRET;
  const envPaths = [
    path.join(process.env.HOME || "/home/user", ".config/symphony/anqr.env"),
    path.join(process.env.HOME || "/home/user", ".config/systemd/user/anqr-ops.env"),
  ];
  for (const envPath of envPaths) {
    try {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^LINEAR_WEBHOOK_SECRET=(.+)$/m);
      if (match) return match[1].trim();
    } catch { /* env file not available */ }
  }
  return "";
}

export const LINEAR_WEBHOOK_SECRET = resolveLinearWebhookSecret();

export function computeWebhookSignature(rawBody: string): string {
  if (!LINEAR_WEBHOOK_SECRET) return "";
  return crypto.createHmac("sha256", LINEAR_WEBHOOK_SECRET).update(rawBody).digest("hex");
}

export async function sendSignedWebhook(
  url: string,
  payload: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const body = JSON.stringify(payload);
  const signature = computeWebhookSignature(body);
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(signature ? { "linear-signature": signature } : {}),
      ...extraHeaders,
    },
    body,
  });
}
