export function extractSonarKey(issue) {
  const match = issue.description?.match(/<!-- sonar-key:([a-f0-9-]+) -->/);
  return match ? match[1] : null;
}
