import type { ReactNode } from 'react';
import { parseNumberedListItems } from './parse-numbered-list-items';
import { renderTextContent } from './render-text-content';

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
