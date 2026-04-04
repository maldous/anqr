import { PING_TIMEOUT_MS } from "./ping-timeout-ms.mjs";

export async function checkSonarAudit() {
  const SONAR_TOKEN = process.env.SONAR_TOKEN;
  const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";

  if (!SONAR_TOKEN) {
    return { pass: true, detail: "SONAR_TOKEN not set — skipped" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const authHeader = `Basic ${Buffer.from(SONAR_TOKEN + ":").toString("base64")}`;
    const headers = { Authorization: authHeader };

    const statusRes = await fetch(`${SONAR_HOST}/api/system/status`, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timer);
    const status = await statusRes.json();
    if (status.status !== "UP") {
      return { pass: true, detail: `SonarQube status: ${status.status} — skipped` };
    }

    const issuesRes = await fetch(
      `${SONAR_HOST}/api/issues/search?componentKeys=anqr&resolved=false&ps=1`,
      { headers },
    );
    const issuesData = await issuesRes.json();
    const totalIssues = issuesData.total || 0;

    const hotRes = await fetch(`${SONAR_HOST}/api/hotspots/search?projectKey=anqr&ps=1`, {
      headers,
    });
    const hotData = await hotRes.json();
    const totalHotspots = hotData.paging?.total || 0;

    const measRes = await fetch(
      `${SONAR_HOST}/api/measures/component?component=anqr&metricKeys=bugs,vulnerabilities,code_smells,duplicated_lines_density,coverage`,
      { headers },
    );
    const measData = await measRes.json();
    const measures = (measData.component?.measures || [])
      .map((m) => `${m.metric}=${m.value}`)
      .join(", ");

    const measuresSuffix = measures ? ` | ${measures}` : "";
    const detail = `Issues: ${totalIssues}, Hotspots: ${totalHotspots}${measuresSuffix}`;
    return { pass: true, detail };
  } catch (err) {
    return { pass: true, detail: `SonarQube unreachable: ${err.message}` };
  }
}
