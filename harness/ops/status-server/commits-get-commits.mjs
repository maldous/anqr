let cachedCommits = null;
let commitsCacheAge = 0;

export function getCommits() {
  if (cachedCommits && Date.now() - commitsCacheAge < COMMITS_REFRESH_MS) {
    return cachedCommits;
  }
  cachedCommits = fetchCommits();
  commitsCacheAge = Date.now();
  return cachedCommits;
}