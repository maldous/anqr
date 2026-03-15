import type { ReactNode } from 'react';
import { findNextTextToken } from './find-next-text-token';
import { processHref } from './process-href';

export function renderTextContent(text: string, lang: string): ReactNode {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  let match = findNextTextToken(text, 0);

  while (match) {
    if (match.start > lastIndex) {
      result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex, match.start)}</span>);
    }

    if (match.kind === 'url') {
      result.push(
        <a
          key={`link-${keyIndex++}`}
          href={match.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {match.value}
        </a>
      );
    } else {
      const href = processHref(match.href, lang);
      const label = match.label;
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

    lastIndex = match.end;
    match = findNextTextToken(text, lastIndex);
  }

  if (lastIndex < text.length) {
    result.push(<span key={`text-${keyIndex++}`}>{text.slice(lastIndex)}</span>);
  }

  return result.length > 0 ? result : text;
}
