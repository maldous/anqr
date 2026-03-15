export function isUrlBoundaryChar(char: string | undefined): boolean {
  return !char || /\s/.test(char);
}
