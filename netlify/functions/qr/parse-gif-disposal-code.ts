export function parseGifDisposalCode(disposal: string): number {
  if (disposal === "none") return 0;
  if (disposal === "keep") return 1;
  if (disposal === "restore_previous") return 3;
  return 2;
}
