export function getCommits() {
  if (cachedCommits && Date.now() - commitsCacheAge < COMMITS_REFRESH_MS) {
    return cachedCommits;
  }
  cachedCommits = fetchCommits();
  commitsCacheAge = Date.now();
  return cachedCommits;
}