import { GITHUB_API } from "./github-api.mjs";
import { GITHUB_REPO } from "./github-repo.mjs";
import { getGitHubToken } from "./get-git-hub-token.mjs";

export async function closeGitHubIssue(issueNumber, reason) {
  const token = getGitHubToken();
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/issues/${issueNumber}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state: "closed",
      state_reason: "not_planned",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to close issue #${issueNumber}: ${res.status} ${res.statusText}`);
  }

  // Add a comment explaining why it was closed
  const commentUrl = `${GITHUB_API}/repos/${GITHUB_REPO}/issues/${issueNumber}/comments`;
  await fetch(commentUrl, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: `Closed automatically: ${reason}\n\n**GitHub Issues are disabled for this repository.** All issue tracking is managed through [Linear](https://linear.app).`,
    }),
  });

  return res.json();
}
