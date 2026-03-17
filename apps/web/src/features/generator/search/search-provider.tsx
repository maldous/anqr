import { type ReactNode, useMemo } from "react";
import { SearchContext } from "./search-context-instance";

export function SearchProvider({
  children,
  searchQuery,
}: Readonly<{
  children: ReactNode;
  searchQuery: string;
}>) {
  const value = useMemo(() => ({ searchQuery }), [searchQuery]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
