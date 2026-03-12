import { useContext } from 'react';
import { SearchContext } from './search-context-2';

export function useSearch() {
  return useContext(SearchContext);
}
