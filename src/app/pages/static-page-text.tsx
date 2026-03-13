import type { ReactNode } from 'react';

function processHref(href: string, lang: string): string {
  return href.replaceAll('${lang}', lang);
}

function parseNumberedListItems(
  text: string,
  matches: RegExpMatchArray[]
): { num: string; content: string }[] {
  const items: { num: string; content: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const num = match[1];
    const matchIndex = match.index ?? 0;
    const startOfContent = matchIndex + match[0].length;
    const nextMatch = matches[i + 1];
    const endOfContent = nextMatch
      ? (nextMatch.index ?? 0) + (nextMatch[0].startsWith(' ') ? 1 : 0)
      : text.length;
    const content = text.slice(startOfContent, endOfContent).trim();
    if (content) items.push({ num, content });
  }

  return items;
}

function renderTextContent(text: string, lang: string): ReactNode {
  const combinedRegex = /(https?:\/\/[^\s]+)|\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = combinedRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      result.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {match[1]}
        </a>
      );
    } else if (match[2] && match[3]) {
      const href = processHref(match[2], lang);
      const label = match[3];
      const isExternal = href.startsWith('http');

      result.push(
        <a
          key={`link-${keyIndex++}`}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-primary hover:underline"
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex)}</span>);
  }

  return result.length > 0 ? result : text;
}

export function renderTextWithLinks(text: string, lang: string): ReactNode {
  const numberedListRegex = /(?:^|\s)(\d+)\.\s/g;
  const matches = [...text.matchAll(numberedListRegex)];

  if (matches.length >= 2) {
    const items = parseNumberedListItems(text, matches);

    if (items.length >= 2) {
      return (
        <ol className="list-decimal pl-5 space-y-1.5 text-left">
          {items.map((item) => (
            <li key={`${item.num}-${item.content.slice(0, 20)}`} className="leading-relaxed">
              {renderTextContent(item.content, lang)}
            </li>
          ))}
        </ol>
      );
    }
  }

  return renderTextContent(text, lang);
}
