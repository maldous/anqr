// Generated from ../../../../scripts/ops/integrations/linear/github-linear-sync-audit.mjs:22

export function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN environment variable is not set");
  return token;
}
