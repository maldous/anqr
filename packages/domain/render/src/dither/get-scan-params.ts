export function getScanParams(
  y: number,
  width: number,
  serpentine: boolean,
): { startX: number; endX: number; deltaX: number; leftToRight: boolean } {
  const leftToRight = serpentine ? y % 2 === 0 : true;
  return {
    leftToRight,
    startX: leftToRight ? 0 : width - 1,
    endX: leftToRight ? width : -1,
    deltaX: leftToRight ? 1 : -1,
  };
}
