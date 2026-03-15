import { isUrlBoundaryChar } from './is-url-boundary-char';
import type { TextTokenMatch } from './text-token-match';

export function findNextTextToken(text: string, startIndex: number): TextTokenMatch | null {
  const urlIndex = text.indexOf('http', startIndex);
  const wikiIndex = text.indexOf('[[', startIndex);
  const candidates = [urlIndex, wikiIndex].filter((index) => index >= 0);
  if (candidates.length === 0) return null;

  const nextIndex = Math.min(...candidates);
  if (nextIndex === urlIndex) {
    const urlStart =
      text.startsWith('https://', urlIndex) || text.startsWith('http://', urlIndex) ? urlIndex : -1;
    if (urlStart >= 0 && isUrlBoundaryChar(text[urlStart - 1])) {
      let end = urlStart;
      while (end < text.length && !isUrlBoundaryChar(text[end])) end += 1;
      return { kind: 'url', start: urlStart, end, value: text.slice(urlStart, end) };
    }
  }

  if (nextIndex === wikiIndex) {
    const separatorIndex = text.indexOf('|', wikiIndex + 2);
    const closeIndex = text.indexOf(']]', wikiIndex + 2);
    if (separatorIndex > wikiIndex + 1 && closeIndex > separatorIndex + 1) {
      return {
        kind: 'wiki',
        start: wikiIndex,
        end: closeIndex + 2,
        href: text.slice(wikiIndex + 2, separatorIndex),
        label: text.slice(separatorIndex + 1, closeIndex),
      };
    }
  }

  return findNextTextToken(text, nextIndex + 1);
}
