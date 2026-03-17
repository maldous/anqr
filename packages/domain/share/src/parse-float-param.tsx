export function parseFloatParam(value: string | null): number | undefined {
  return value ? Number.parseFloat(value) : undefined;
}
