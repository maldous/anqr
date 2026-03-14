import type { ReactNode } from 'react';
import { processHref } from './process-href';

export function renderTextContent(text: string, lang: string): ReactNode {
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
