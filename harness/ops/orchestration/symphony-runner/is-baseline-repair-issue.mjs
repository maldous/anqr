export function isBaselineRepairIssue(issue) {
  return issue.title?.startsWith("Harness");
}
