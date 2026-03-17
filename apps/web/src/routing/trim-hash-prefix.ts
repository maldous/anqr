export function trimHashPrefix(hash: string): string {
  return hash.startsWith("#") ? hash.slice(1) : hash;
}
