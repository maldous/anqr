import type { RGBA } from '../../../modules/core/types';

/** Apply alpha over blending (c1 over c2) */
export function alphaBlend(c1: RGBA, c2: RGBA): RGBA {
  const a = c1.a + c2.a * (1 - c1.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: Math.round((c1.r * c1.a + c2.r * c2.a * (1 - c1.a)) / a),
    g: Math.round((c1.g * c1.a + c2.g * c2.a * (1 - c1.a)) / a),
    b: Math.round((c1.b * c1.a + c2.b * c2.a * (1 - c1.a)) / a),
    a,
  };
}
