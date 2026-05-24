import { fetchCommits } from "./fetch-commits.mjs";

let cachedCommits = null;
let commitsAge = 0;

export function getCommits() {
  if (cachedCommits && Date.now() - commitsAge < 60_000) return cachedCommits;
  cachedCommits = fetchCommits();
  commitsAge = Date.now();
  return cachedCommits;
}
