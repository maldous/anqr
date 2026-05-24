import { fetchLinearIssues } from "./fetch-linear-issues.mjs";

let cachedIssues = null;
let issuesAge = 0;

export async function getLinearIssues() {
  if (cachedIssues && Date.now() - issuesAge < 60_000) return cachedIssues;
  cachedIssues = await fetchLinearIssues();
  issuesAge = Date.now();
  return cachedIssues;
}
