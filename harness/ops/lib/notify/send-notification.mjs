// Generated from ../../../scripts/ops/lib/notify.mjs:96

import { spawnSync } from "node:child_process";

import { RECIPIENT } from "./recipient.mjs";
import { checkDedup } from "./check-dedup.mjs";
import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { logInfo, logError } from "./logger.mjs";

export function sendNotification({ subject, body, severity = "info" }) {
  const msmtpLookup = spawnSync("which", ["msmtp"], { encoding: "utf-8" });
  if (msmtpLookup.status !== 0) {
    return { sent: false, reason: "msmtp not found" };
  }
  const msmtpBin = msmtpLookup.stdout.trim();

  let severityTag;
  if (severity === "critical") severityTag = "[CRITICAL] ";
  else if (severity === "warn") severityTag = "[WARN] ";
  else severityTag = "";
  const formattedSubject = `[ANQR] ${severityTag}${subject}`;

  const state = loadState();
  const dedupCheck = checkDedup(state, formattedSubject);
  if (!dedupCheck.allowed) {
    logInfo(`[notify] Dedup: ${dedupCheck.reason} — skipping: ${formattedSubject}`);
    return { sent: false, reason: dedupCheck.reason };
  }

  const timestamp = new Date().toISOString();
  const email = [
    `To: ${RECIPIENT}`,
    `From: ${RECIPIENT}`,
    `Subject: ${formattedSubject}`,
    "Content-Type: text/plain; charset=utf-8",
    `X-ANQR-Severity: ${severity}`,
    `X-ANQR-Timestamp: ${timestamp}`,
    "",
    body,
    "",
    "---",
    `Sent by ANQR Ops at ${timestamp}`,
  ].join("\n");

  const proc = spawnSync(msmtpBin, [RECIPIENT], {
    input: email,
    encoding: "utf-8",
    timeout: 30_000,
  });

  if (proc.status !== 0) {
    const err = (proc.stderr || proc.error?.message || "unknown error").trim();
    logError(`[notify] msmtp failed (exit ${proc.status}): ${err}`);
    return { sent: false, reason: `msmtp exit ${proc.status}: ${err}` };
  }

  state.sends.push({ ts: Date.now(), subject: formattedSubject });
  saveState(state);
  logInfo(`[notify] Sent: ${formattedSubject}`);
  return { sent: true };
}
