import { isAlphanumeric } from './is-alphanumeric';

export function scanAlphanumericRun(text: string, upperText: string, start: number): number {
  let i = start;
  while (i < text.length && isAlphanumeric(upperText[i]) && text[i] === upperText[i]) i++;
  return i;
}
