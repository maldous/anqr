export function isNumericSlot(value: string | undefined | null): value is string {
  return !!value && /^\d+$/.test(value);
}
