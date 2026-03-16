export function parseNumberedListItems(
  text: string,
  matches: RegExpMatchArray[],
): { num: string; content: string }[] {
  const items: { num: string; content: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const num = match[1];
    const matchIndex = match.index ?? 0;
    const startOfContent = matchIndex + match[0].length;
    const nextMatch = matches[i + 1];
    const endOfContent = nextMatch
      ? (nextMatch.index ?? 0) + (nextMatch[0].startsWith(" ") ? 1 : 0)
      : text.length;
    const content = text.slice(startOfContent, endOfContent).trim();
    if (content) items.push({ num, content });
  }

  return items;
}
