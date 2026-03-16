export function serpentineRowParams(
  y: number,
  scaledSize: number,
  serpentine: boolean,
): { leftToRight: boolean; startX: number; endX: number; deltaX: number } {
  const leftToRight = serpentine ? y % 2 === 0 : true;
  const startX = leftToRight ? 0 : scaledSize - 1;
  const endX = leftToRight ? scaledSize : -1;
  const deltaX = leftToRight ? 1 : -1;
  return { leftToRight, startX, endX, deltaX };
}
