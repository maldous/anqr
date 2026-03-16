export function generateQArtUrl(
  baseUrl: string,
  numericLength: number = 200,
  seed?: number,
): string {
  let rng = seed ?? Date.now();
  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  let numeric = "";
  for (let i = 0; i < numericLength; i++) {
    numeric += Math.floor(random() * 10).toString();
  }

  return `${baseUrl}#${numeric}`;
}
