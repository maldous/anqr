export async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesCacheAge < ISSUES_REFRESH_MS) {
    return cachedIssues;
  }
  cachedIssues = await fetchLinearIssues();
  const issuesCacheAge = Date.now();
  return cachedIssues;
}