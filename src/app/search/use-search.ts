import { useContext } from 'react';
import { SearchContext } from './search-context._internal';

export function useSearch() {
  return useContext(SearchContext);
}
