// Generated from ../../../../scripts/ops/integrations/email/email-ingest.mjs:67

import { NOTMUCH_QUERY } from "./notmuch-query.mjs";
import { run } from "./run.mjs";

export function searchUnprocessed() {
  const proc = run("notmuch", ["search", "--output=messages", "--", NOTMUCH_QUERY]);
  if (proc.status !== 0) return [];
  return (proc.stdout || "").trim().split("\n").filter(Boolean);
}
