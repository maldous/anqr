import { createContext } from 'react';
import type { SearchContextValue } from './search-context-value';

export const SearchContext = createContext<SearchContextValue>({ searchQuery: '' });
