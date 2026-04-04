// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:669

import { execFileSync } from "node:child_process";
import {
  fetchAllSonarIssues,
  fetchAllSonarHotspots,
  fetchAllSonarDuplicationIssues,
  syncSonarToLinear,
  syncSonarHotspotsToLinear,
  syncSonarDuplicationsToLinear,
} from "../../lib/sonar-linear-sync.mjs";

import { ROOT } from "./root.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function runSonarPostCommit(issueIdentifier) {
  const SONAR_TOKEN = process.env.SONAR_TOKEN;
  const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
  const PROJECT_KEY = "anqr";
  if (!SONAR_TOKEN) return;
  try {
    execFileSync("sonar-scanner", [], {
      cwd: ROOT,
      timeout: 300_000,
      stdio: "pipe",
      env: {
        ...process.env,
        SONAR_TOKEN,
        SONAR_SCANNER_OPTS: "-Xms128m -Xmx256m",
        NODE_OPTIONS: "",
      },
    });
    await new Promise((r) => setTimeout(r, 10_000));
    const [issues, hotspots, dupIssues] = await Promise.all([
      fetchAllSonarIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
      fetchAllSonarHotspots(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
      fetchAllSonarDuplicationIssues(SONAR_TOKEN, SONAR_HOST, PROJECT_KEY),
    ]);
    await syncSonarToLinear({
      sonarIssues: issues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToTodo: false,
    });
    await syncSonarHotspotsToLinear({
      sonarHotspots: hotspots,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 1,
      resolveStale: true,
      requeueToTodo: false,
    });
    await syncSonarDuplicationsToLinear({
      sonarDupIssues: dupIssues,
      projectKey: PROJECT_KEY,
      sonarHost: SONAR_HOST,
      priority: 2,
      resolveStale: true,
      requeueToTodo: false,
    });
    logInfo(`[runner] Sonar post-commit complete for ${issueIdentifier}`);
  } catch (err) {
    logWarn(`[runner] Sonar post-commit scan failed (non-fatal): ${err.message}`);
  }
}
