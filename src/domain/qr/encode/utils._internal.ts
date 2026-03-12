export { countSameNeighbors } from './count-same-neighbors';
export { penaltyLevel1AdjacentModules } from './penalty-level1-adjacent-modules';
export { count2x2DarkModules } from './count2x2-dark-modules';
export { penaltyLevel2Blocks } from './penalty-level2-blocks';
export { penaltyLevel3Horizontal } from './penalty-level3-horizontal';
export { penaltyLevel3Vertical } from './penalty-level3-vertical';
export { penaltyLevel3FinderLike } from './penalty-level3-finder-like';
export { penaltyLevel4Ratio } from './penalty-level4-ratio';

// Length bits lookup: mode -> [small, medium, large] version ranges
export const LENGTH_BITS: Record<number, [number, number, number]> = {
  1: [10, 12, 14],  // Numeric
  2: [9, 11, 13],   // Alphanumeric
  4: [8, 16, 16],   // Byte
  8: [8, 10, 12],   // Kanji
};
