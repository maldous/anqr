// Generated from ../../../../scripts/ops/integrations/linear/linear-client.mjs:124

import { findOpenIssues } from "./find-open-issues.mjs";

export async function findOpenIssuesByDescriptionFragment(fragment) {
  return findOpenIssues({ description: { contains: fragment } });
}
