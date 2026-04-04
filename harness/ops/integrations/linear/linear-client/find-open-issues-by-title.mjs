import { findOpenIssues } from "./find-open-issues.mjs";

export async function findOpenIssuesByTitle(fragment) {
  return findOpenIssues({ title: { contains: fragment } });
}
