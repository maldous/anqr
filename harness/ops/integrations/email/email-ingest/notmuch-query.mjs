// Generated from ../../../../scripts/ops/integrations/email/email-ingest.mjs:33

import { INGEST_EMAIL } from "./ingest-email.mjs";

export const NOTMUCH_QUERY = `(from:${INGEST_EMAIL} OR to:${INGEST_EMAIL}) AND tag:inbox AND NOT tag:anqr-processed AND NOT tag:anqr-rejected`;
