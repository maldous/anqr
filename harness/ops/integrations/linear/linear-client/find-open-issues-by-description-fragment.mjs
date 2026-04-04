import { findOpenIssues } from "./find-open-issues.mjs";

export async function findOpenIssuesByDescriptionFragment(fragment) {
  return findOpenIssues({ description: { contains: fragment } });
}
