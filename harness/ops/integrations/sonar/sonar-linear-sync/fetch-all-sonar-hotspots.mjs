import { fetchWithTimeout } from "./fetch-with-timeout.mjs";
import { sonarAuthHeader } from "./sonar-auth-header.mjs";

export async function fetchAllSonarHotspots(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const hotspots = [];
  let page = 1;
  const pageSize = 100;

  for (;;) {
    const res = await fetchWithTimeout(
      `${sonarHost}/api/hotspots/search?projectKey=${projectKey}&status=TO_REVIEW&ps=${pageSize}&p=${page}`,
      headers,
    );
    const data = await res.json();
    hotspots.push(...(data.hotspots || []));
    if (hotspots.length >= (data.paging?.total || 0)) break;
    page++;
  }

  return hotspots;
}
