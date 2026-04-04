import { fetchWithTimeout } from "./fetch-with-timeout.mjs";
import { sonarAuthHeader } from "./sonar-auth-header.mjs";

export async function fetchAllSonarIssues(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const issues = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/issues/search?componentKeys=${projectKey}&resolved=false&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    issues.push(
      ...(data.issues || []).filter(
        (issue) =>
          !/too many parameters|Cognitive Complexity|top-level await/i.test(
            `${issue.message || ""} ${issue.rule || ""}`,
          ),
      ),
    );
    if (page * pageSize >= (data.total || 0)) break;
    page++;
  }

  return issues;
}
