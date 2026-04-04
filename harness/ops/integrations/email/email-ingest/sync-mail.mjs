// Generated from ../../../../scripts/ops/integrations/email/email-ingest.mjs:48

import { run } from "./run.mjs";

export function syncMail() {
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
