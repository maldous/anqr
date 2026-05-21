export async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesCacheAge < ISSUES_REFRESH_MS) {
    return cachedIssues;
  }
  let cachedIssues = await fetchLinearIssues();
  issuesCacheAge = Date.now();
  return cachedIssues;
}