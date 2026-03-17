import type { StoreState } from "./share-config-store.types";
import { buildShareAnimationPatternFields } from "./build-share-animation-pattern-fields";
import { omitWhenEqual, undefinedIfEqual } from "./share-config-field-helpers";

export function buildShareAnimation(animation: StoreState["animation"]) {
  return {
    speed: undefinedIfEqual(animation.speedMs, 100),
    loop: omitWhenEqual(animation.loop, true),
    reverse: omitWhenEqual(animation.bounce, false),
    startFrame: undefinedIfEqual(animation.startFrame, 0),
    maxFrames: undefinedIfEqual(animation.maxFrames, 0),
    frameStep: undefinedIfEqual(animation.frameStep, 1),
    interpolate: undefinedIfEqual(animation.interpolate, "none"),
    temporalDither: undefinedIfEqual(animation.temporalDither, "off"),
    ...buildShareAnimationPatternFields(animation),
    moduleJitter: undefinedIfEqual(animation.moduleJitterPx, 0),
    colorCycle: omitWhenEqual(animation.colorCycle, false),
    seed: undefinedIfEqual(animation.seed, 0),
    animationSeed: undefinedIfEqual(animation.seed, 0),
  };
}
