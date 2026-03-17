import type { FinderPattern } from "./types";
import { pointDistance } from "./utils";
import { orderByAngle } from "./order-by-angle";

/**
 * Order 3 finder patterns as [topLeft, topRight, bottomLeft]
 * The top-left pattern is at the right angle of the triangle
 */
export function orderFinderPatterns(
  p1: FinderPattern,
  p2: FinderPattern,
  p3: FinderPattern,
): [FinderPattern, FinderPattern, FinderPattern] | null {
  // Calculate distances
  const d12 = pointDistance(p1.center, p2.center);
  const d13 = pointDistance(p1.center, p3.center);
  const d23 = pointDistance(p2.center, p3.center);

  let topLeft: FinderPattern;
  let topRight: FinderPattern;
  let bottomLeft: FinderPattern;

  // The longest edge is the diagonal (not adjacent to top-left)
  if (d12 >= d13 && d12 >= d23) {
    // p3 is top-left
    topLeft = p3;
    [topRight, bottomLeft] = orderByAngle(p3, p1, p2);
  } else if (d13 >= d12 && d13 >= d23) {
    // p2 is top-left
    topLeft = p2;
    [topRight, bottomLeft] = orderByAngle(p2, p1, p3);
  } else {
    // p1 is top-left
    topLeft = p1;
    [topRight, bottomLeft] = orderByAngle(p1, p2, p3);
  }

  return [topLeft, topRight, bottomLeft];
}
