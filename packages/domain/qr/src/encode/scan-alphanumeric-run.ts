export function scanAlphanumericRun(text: string, upperText: string, start: number): number {
  let i = start;
  while (i < text.length && /^[0-9A-Z $%*+\-./:]$/.test(upperText[i]) && text[i] === upperText[i])
    i++;
  return i;
}
