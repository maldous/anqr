export function prefixHash(value: string | null): string | undefined {
  return value ? `#${value}` : undefined;
}
