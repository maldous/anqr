import { useSearch } from "./use-search";
import { highlightText } from "./highlight-text";

export function HighlightedLabel({ children }: Readonly<{ children: string }>) {
  const { searchQuery } = useSearch();
  return <>{highlightText(children, searchQuery)}</>;
}
