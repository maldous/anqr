/** Sample blue noise at position */
export function sampleBlueNoise(
  x: number,
  y: number,
  tile: ArrayLike<number>,
  tileSize: number
): number {
  const tx = ((x % tileSize) + tileSize) % tileSize;
  const ty = ((y % tileSize) + tileSize) % tileSize;
  return tile[ty * tileSize + tx];
}
