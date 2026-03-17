// White ring: modules surrounding the dark core (row 1 and row 5 middle, col 1 and col 5 middle)
export const WHITE_RING_MODULES: ReadonlyArray<[number, number]> = [
  [1, 2],
  [1, 3],
  [1, 4], // left column of white ring
  [5, 2],
  [5, 3],
  [5, 4], // right column of white ring
  [2, 1],
  [3, 1],
  [4, 1], // top row of white ring
  [2, 5],
  [3, 5],
  [4, 5], // bottom row of white ring
];
