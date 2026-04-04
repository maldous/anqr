// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:111

import { fetchWithTimeout } from "./fetch-with-timeout.mjs";
import { sonarAuthHeader } from "./sonar-auth-header.mjs";

export async function fetchAllSonarDuplicationIssues(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const dupIssues = [];
  let page = 1;
  const pageSize = 100;

  // SonarQube duplication rules typically start with 'squid:' or have 'Duplication' in the rule name
  // We'll fetch all code smells and filter client-side for duplication-related ones
  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/issues/search?componentKeys=${projectKey}&types=CODE_SMELL&resolved=false&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    const fetchedIssues = data.issues || [];
    // Filter for duplication-related issues
    const filtered = fetchedIssues.filter(
      (i) => i.rule?.includes("Duplication") || i.message?.toLowerCase().includes("duplicate"),
    );
    dupIssues.push(...filtered);
    if (dupIssues.length >= (data.total || 0)) break;
    page++;
  }

  return dupIssues;
}
