export function extractCheckName(issue) {
  const match = issue.description?.match(/\*\*Check:\*\* `([^`]+)`/);
  return match ? match[1] : null;
}
