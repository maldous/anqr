export function scanNumericRun(text: string, start: number): number {
  let i = start;
  while (i < text.length && /^\d$/.test(text[i])) i++;
  return i;
}
