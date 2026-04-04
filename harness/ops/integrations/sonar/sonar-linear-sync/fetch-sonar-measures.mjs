import { fetchWithTimeout } from "./fetch-with-timeout.mjs";
import { sonarAuthHeader } from "./sonar-auth-header.mjs";

export async function fetchSonarMeasures(sonarToken, sonarHost, projectKey) {
  const headers = { Authorization: sonarAuthHeader(sonarToken) };
  const res = await fetchWithTimeout(
    `${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=duplicated_lines_density,coverage`,
    headers,
  );
  const data = await res.json();
  return data.component?.measures || [];
}
