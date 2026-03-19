import type { RGBA } from "@/domain/share";

export function alphaBlend(top: RGBA, bottom: RGBA): RGBA {
  const outA = top.a + bottom.a * (1 - top.a);
  if (outA <= 0) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: Math.round((top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / outA),
    g: Math.round((top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / outA),
    b: Math.round((top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / outA),
    a: outA,
  };
}
