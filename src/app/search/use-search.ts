import { useContext } from 'react';
import { SearchContext } from './search-context-instance';

export function useSearch() {
  return useContext(SearchContext);
}
