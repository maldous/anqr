import { fetchWithTimeout } from "./fetch-with-timeout.mjs";
import { sonarAuthHeader } from "./sonar-auth-header.mjs";

export async function fetchSonarHotspotCount(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const res = await fetchWithTimeout(
    `${sonarHost}/api/hotspots/search?projectKey=${projectKey}&ps=1`,
    headers,
  );
  const data = await res.json();
  return data.paging?.total || 0;
}
