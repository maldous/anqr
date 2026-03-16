import type { StoreState } from "./share-config-store-state.type";

export function buildShareAnimationPatternFields(animation: StoreState["animation"]) {
  return {
    pattern: animation.pattern === "none" ? undefined : animation.pattern,
    target: animation.target === "result" ? undefined : animation.target,
    waveAxis:
      animation.pattern !== "wave" || animation.waveAxis === "y" ? undefined : animation.waveAxis,
    pattern2: animation.pattern2 === "none" ? undefined : animation.pattern2,
    target2:
      animation.pattern2 === "none" || animation.target2 === "result"
        ? undefined
        : animation.target2,
    waveAxis2:
      animation.pattern2 !== "wave" || animation.waveAxis2 === "x"
        ? undefined
        : animation.waveAxis2,
  };
}
