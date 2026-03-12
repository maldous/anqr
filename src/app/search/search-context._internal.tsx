import { createContext } from 'react';

export interface SearchContextValue {
  searchQuery: string;
}

export const SearchContext = createContext<SearchContextValue>({ searchQuery: '' });
