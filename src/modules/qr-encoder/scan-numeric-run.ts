import { isNumeric } from './is-numeric';

export function scanNumericRun(text: string, start: number): number {
  let i = start;
  while (i < text.length && isNumeric(text[i])) i++;
  return i;
}
