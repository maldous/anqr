// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:120

import { findOpenIssues } from "./find-open-issues.mjs";

export async function findOpenIssuesByTitle(fragment) {
  return findOpenIssues({ title: { contains: fragment } });
}
