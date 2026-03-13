export function buildNavigationUrl(
  resolvedHref: string,
  language: string
): { fullHref: string; hash: string } {
  let path = resolvedHref;
  let hash = '';
  let query = '';

  const hashIndex = resolvedHref.indexOf('#');
  if (hashIndex !== -1) {
    hash = resolvedHref.substring(hashIndex);
    path = resolvedHref.substring(0, hashIndex);
  }

  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    query = path.substring(queryIndex);
    path = path.substring(0, queryIndex);
  }

  if (!query.includes('lang=')) {
    const separator = query ? '&' : '?';
    query = `${query}${separator}lang=${language}`;
  }

  return { fullHref: `${path}${query}${hash}`, hash };
}
