export function extractServiceName(issue) {
  const { title, description } = issue;

  // Check title for service mentions
  const titleMatch = title.match(/(?:symphony|codebuff)/i);
  if (titleMatch) {
    return titleMatch[0].toLowerCase();
  }

  // Check description for service field
  const descMatch = description?.match(/\*\*Service:\*\* (\w+)/);
  if (descMatch) {
    return descMatch[1].toLowerCase();
  }

  return null;
}
