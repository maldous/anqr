// Helper functions to reduce code duplication
export function parseIntParam(value: string | null): number | undefined {
  return value ? Number.parseInt(value, 10) : undefined;
}
