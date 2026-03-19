import { rgbToGray } from "../dither-algorithms/utils";

export function computeSobelEdgeMap(
  imageData: Float32Array[],
  width: number,
  height: number,
): number[][] {
  const edgeMap: number[][] = [];
  for (let y = 0; y < height; y++) {
    edgeMap.push(Array.from({ length: width }, () => 0));
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const getGray = (px: number, py: number) => {
        const idx = px * 3;
        return rgbToGray(imageData[py][idx], imageData[py][idx + 1], imageData[py][idx + 2]);
      };
      const gx =
        -getGray(x - 1, y - 1) +
        getGray(x + 1, y - 1) +
        -2 * getGray(x - 1, y) +
        2 * getGray(x + 1, y) +
        -getGray(x - 1, y + 1) +
        getGray(x + 1, y + 1);
      const gy =
        -getGray(x - 1, y - 1) -
        2 * getGray(x, y - 1) -
        getGray(x + 1, y - 1) +
        getGray(x - 1, y + 1) +
        2 * getGray(x, y + 1) +
        getGray(x + 1, y + 1);
      edgeMap[y][x] = Math.min(1, Math.hypot(gx, gy));
    }
  }
  return edgeMap;
}
