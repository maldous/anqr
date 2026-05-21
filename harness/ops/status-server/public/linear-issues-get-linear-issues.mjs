let cachedIssues = null;
let issuesCacheAge = 0;

export async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesCacheAge < ISSUES_REFRESH_MS) {
    return cachedIssues;
  }
  cachedIssues = await fetchLinearIssues();
  issuesCacheAge = Date.now();
  return cachedIssues;
}
