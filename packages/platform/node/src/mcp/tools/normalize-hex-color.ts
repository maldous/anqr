export function normalizeHexColor(value: string): string {
  return value.startsWith("#") ? value : `#${value}`;
}
