export function isMissingFromLocalExecution(issueIdentifier, activeLeases, activeIssueIdentifiers) {
  return !activeLeases.has(issueIdentifier) && !activeIssueIdentifiers.has(issueIdentifier);
}
