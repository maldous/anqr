import { createIssue, STATES } from "../../../linear-client.mjs";
import {
  addExternalKey,
  markIssueHumanOnly,
  patchIssueState,
  recordTransition,
} from "../../../symphony-state.mjs";
import { sendNotification, formatIssueLine } from "../../../lib/notify.mjs";

import { ALLOWED_SENDERS } from "./allowed-senders.mjs";
import { DRY_RUN } from "./dry-run.mjs";
import { INGEST_EMAIL } from "./ingest-email.mjs";
import { findExistingByExternalKey } from "./find-existing-by-external-key.mjs";
import { getMessageContent } from "./get-message-content.mjs";
import { indexMail } from "./index-mail.mjs";
import { lookupHumanAssignee } from "./lookup-human-assignee.mjs";
import { searchUnprocessed } from "./search-unprocessed.mjs";
import { syncMail } from "./sync-mail.mjs";
import { tagMessage } from "./tag-message.mjs";
import { writeReport } from "./write-report.mjs";

export async function main() {
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

    const senderAddr = (email.from.match(/<([^>]*)>/)?.[1] || email.from).trim().toLowerCase();
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
