import { type ReactNode } from "react";

export function highlightText(text: string, searchQuery: string): ReactNode {
  if (!searchQuery || searchQuery.length < 2) {
    return text;
  }

  const query = searchQuery.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded px-0.5">
        {match}
      </span>
      {highlightText(after, searchQuery)}
    </>
  );
}
