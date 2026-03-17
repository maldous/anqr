#!/usr/bin/env node
/* eslint-disable no-console */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  createIssue,
  query,
  TEAM_ID,
  STATES,
  findOpenIssuesByDescriptionFragment,
} from "./linear-client.mjs";
import { sendNotification, formatIssueLine } from "./lib/notify.mjs";
import {
  addExternalKey,
  markIssueHumanOnly,
  patchIssueState,
  recordTransition,
} from "./symphony-state.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const REPORTS_DIR = path.join(PROJECT_ROOT, "reports", "email-ingest");

const INGEST_EMAIL = process.env.ANQR_INGEST_EMAIL || "email@anqr.link";
const HUMAN_USER_NAME = "Matthew Aldous";
const ALLOWED_SENDERS = ["matthew.aldous@gmail.com", "alexander.emmalyn.thomas@gmail.com"];
const DRY_RUN = process.argv.includes("--dry-run");
const NOTMUCH_QUERY = `(from:${INGEST_EMAIL} OR to:${INGEST_EMAIL}) AND tag:inbox AND NOT tag:anqr-processed AND NOT tag:anqr-rejected`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: "utf-8",
    timeout: 60_000,
    ...opts,
  });
}

function syncMail() {
  const which = run("which", ["mbsync"]);
  if (which.status !== 0) return { ok: false, reason: "mbsync not installed" };
  const proc = run("mbsync", ["gmail"], { timeout: 120_000 });
  if (proc.status !== 0) {
    const err = (proc.stderr || "").trim();
    if (/lock/i.test(err)) return { ok: false, reason: "mbsync lock held (another sync running)" };
    return { ok: false, reason: `mbsync exit ${proc.status}: ${err.slice(0, 200)}` };
  }
  return { ok: true };
}

function indexMail() {
  const which = run("which", ["notmuch"]);
  if (which.status !== 0) return { ok: false, reason: "notmuch not installed" };
  const proc = run("notmuch", ["new"], { timeout: 30_000 });
  return { ok: proc.status === 0 };
}

function searchUnprocessed() {
  const proc = run("notmuch", ["search", "--output=messages", "--", NOTMUCH_QUERY]);
  if (proc.status !== 0) return [];
  return (proc.stdout || "").trim().split("\n").filter(Boolean);
}

function extractMessages(data) {
  const messages = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object" && !Array.isArray(item) && item.id && item.headers)
        messages.push(item);
      else if (Array.isArray(item)) messages.push(...extractMessages(item));
    }
  }
  return messages;
}

function extractTextContent(bodyParts) {
  if (!Array.isArray(bodyParts)) return "";
  for (const part of bodyParts) {
    if (part["content-type"] === "text/plain" && typeof part.content === "string")
      return part.content;
    if (Array.isArray(part.content)) {
      const text = extractTextContent(part.content);
      if (text) return text;
    }
  }
  for (const part of bodyParts) {
    if (part["content-type"] === "text/html" && typeof part.content === "string") {
      return part.content
        .replaceAll(/<[^>]+>/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();
    }
  }
  return "";
}

function getMessageContent(messageId) {
  const proc = run("notmuch", ["show", "--format=json", "--entire-thread=false", "--", messageId]);
  if (proc.status !== 0) return null;
  try {
    const data = JSON.parse(proc.stdout);
    const messages = extractMessages(data);
    if (messages.length === 0) return null;
    const msg = messages[0];
    return {
      id: msg.id,
      subject: msg.headers?.Subject || "",
      from: msg.headers?.From || "",
      to: msg.headers?.To || "",
      date: msg.headers?.Date || "",
      timestamp: msg.timestamp || 0,
      body: extractTextContent(msg.body || []),
      tags: msg.tags || [],
    };
  } catch {
    return null;
  }
}

function tagMessage(messageId, addTags = [], removeTags = []) {
  const args = [
    "tag",
    ...addTags.map((t) => `+${t}`),
    ...removeTags.map((t) => `-${t}`),
    "--",
    messageId,
  ];
  run("notmuch", args);
}

async function lookupHumanAssignee() {
  try {
    const teamData = await query(
      `query($teamId: String!) {
        team(id: $teamId) {
          members(first: 50) { nodes { id name active } }
        }
      }`,
      { teamId: TEAM_ID },
    );
    const member = teamData.team?.members?.nodes?.find(
      (m) => m.active && m.name === HUMAN_USER_NAME,
    );
    return member?.id || null;
  } catch {
    return null;
  }
}

async function findExistingByExternalKey(externalKey) {
  const marker = `<!-- external-key:${externalKey} -->`;
  const matches = await findOpenIssuesByDescriptionFragment(marker);
  return matches.find((issue) => issue.description?.includes(marker)) || null;
}

async function main() {
  const summary = {
    startedAt: new Date().toISOString(),
    syncResult: null,
    indexResult: null,
    messagesFound: 0,
    issuesCreated: [],
    issuesMatched: [],
    rejected: [],
    errors: [],
    dryRun: DRY_RUN,
  };

  summary.syncResult = syncMail();
  if (!summary.syncResult.ok && summary.syncResult.reason.includes("lock")) {
    writeReport(summary);
    return;
  }
  summary.indexResult = indexMail();

  const messageIds = searchUnprocessed();
  summary.messagesFound = messageIds.length;
  if (messageIds.length === 0) {
    writeReport(summary);
    return;
  }

  const humanAssigneeId = DRY_RUN ? null : await lookupHumanAssignee();

  for (const messageId of messageIds) {
    const email = getMessageContent(messageId);
    if (!email) {
      summary.errors.push(`Failed to parse message: ${messageId}`);
      continue;
    }

    const senderAddr = (email.from.match(/<([^>]+)>/)?.[1] || email.from).trim().toLowerCase();
    const senderAllowed = ALLOWED_SENDERS.some((addr) => senderAddr === addr.toLowerCase());
    if (!senderAllowed) {
      summary.rejected.push({ messageId: email.id, from: email.from, subject: email.subject });
      tagMessage(messageId, ["anqr-rejected"], []);
      continue;
    }

    const externalKey = `email:${email.id}`;
    const title = email.subject ? `[EMAIL] ${email.subject}` : "[EMAIL] Untitled email issue";
    const description = [
      `<!-- external-key:${externalKey} -->`,
      "",
      `From: ${email.from}`,
      `Date: ${email.date}`,
      "",
      email.body || "(empty body)",
    ].join("\n");

    if (DRY_RUN) {
      summary.issuesCreated.push({
        messageId: email.id,
        subject: email.subject,
        from: email.from,
        wouldCreate: true,
      });
      continue;
    }

    try {
      const existing = await findExistingByExternalKey(externalKey);
      if (existing) {
        summary.issuesMatched.push({
          messageId: email.id,
          identifier: existing.identifier,
          subject: email.subject,
        });
        tagMessage(messageId, ["anqr-processed"], ["inbox"]);
        continue;
      }

      const issue = await createIssue({
        title,
        description,
        stateId: STATES.backlog,
        priority: 2,
        ...(humanAssigneeId ? { assigneeId: humanAssigneeId } : {}),
      });

      patchIssueState(issue.identifier, {
        source: "email",
        human_only: true,
        blocked_reason: "human_only",
        external_keys: [externalKey],
      });
      addExternalKey(issue.identifier, externalKey);
      markIssueHumanOnly(issue.identifier, { source: "email" });
      recordTransition(issue.identifier, {
        actor: "email-ingest",
        reason: "email_create",
        from: null,
        to: "Backlog",
      });

      summary.issuesCreated.push({
        messageId: email.id,
        subject: email.subject,
        from: email.from,
        identifier: issue.identifier,
        title: issue.title,
        bodySnippet: (email.body || "").slice(0, 300),
      });
      tagMessage(messageId, ["anqr-processed"], ["inbox"]);
    } catch (err) {
      summary.errors.push(
        `Issue creation failed for ${email.subject || messageId}: ${err.message}`,
      );
    }
  }

  if (summary.issuesCreated.length > 0 && !DRY_RUN) {
    const issueBlocks = summary.issuesCreated.map((i) =>
      formatIssueLine({ identifier: i.identifier, title: i.subject, snippet: i.bodySnippet }),
    );
    sendNotification({
      subject: `Created ${summary.issuesCreated.length} human-routed issue(s) from email`,
      body: [
        `Processed ${summary.messagesFound} email(s) from ${INGEST_EMAIL}.`,
        "",
        "Issues created:",
        "",
        ...issueBlocks,
      ].join("\n"),
      severity: "info",
    });
  }
  if (summary.rejected.length > 0 && !DRY_RUN) {
    sendNotification({
      subject: `Rejected ${summary.rejected.length} unauthorized email(s)`,
      body: summary.rejected
        .map((item) => `• ${item.from} — ${item.subject || "(no subject)"}`)
        .join("\n"),
      severity: "warn",
    });
  }

  summary.finishedAt = new Date().toISOString();
  writeReport(summary);
}

function writeReport(summary) {
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, "latest.json"), JSON.stringify(summary, null, 2) + "\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (err) {
    console.error(`[email-ingest] Fatal: ${err.message}`);
    const failure = { ok: false, error: err.message, at: new Date().toISOString() };
    ensureDir(REPORTS_DIR);
    fs.writeFileSync(
      path.join(REPORTS_DIR, "latest.json"),
      JSON.stringify(failure, null, 2) + "\n",
    );
    process.exit(1);
  }
}
