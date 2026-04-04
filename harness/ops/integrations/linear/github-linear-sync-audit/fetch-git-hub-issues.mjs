// Generated from ../../../../scripts/ops/integrations/linear/github-linear-sync-audit.mjs:28

import { GITHUB_API } from "./github-api.mjs";
import { GITHUB_REPO } from "./github-repo.mjs";
import { REQUEST_TIMEOUT_MS } from "./request-timeout-ms.mjs";
import { getGitHubToken } from "./get-git-hub-token.mjs";

export async function fetchGitHubIssues(state = "open") {
  const token = getGitHubToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const issues = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${GITHUB_API}/repos/${GITHUB_REPO}/issues?state=${state}&per_page=100&page=${page}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Filter out pull requests (they show up in the issues API)
      const actualIssues = data.filter((issue) => !issue.pull_request);
      issues.push(...actualIssues);

      hasMore = data.length === 100;
      page++;
    }

    return issues;
  } finally {
    clearTimeout(timer);
  }
}
