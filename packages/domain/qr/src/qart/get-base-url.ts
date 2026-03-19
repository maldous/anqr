export function getBaseUrl(url: string): string {
  const hashIndex = url.indexOf("#");
  return hashIndex >= 0 ? url.substring(0, hashIndex) : url;
}
