import type { StoreState } from './share-config-store-state.type';
import { buildShareAnimationPatternFields } from './build-share-animation-pattern-fields';
import { falseIfFalse, trueIfTrue, undefinedIfEqual } from './share-config-field-helpers';

export function buildShareAnimation(animation: StoreState['animation']) {
  return {
    speed: undefinedIfEqual(animation.speedMs, 100),
    loop: falseIfFalse(animation.loop),
    reverse: trueIfTrue(animation.bounce),
    startFrame: undefinedIfEqual(animation.startFrame, 0),
    maxFrames: undefinedIfEqual(animation.maxFrames, 0),
    frameStep: undefinedIfEqual(animation.frameStep, 1),
    interpolate: undefinedIfEqual(animation.interpolate, 'none'),
    temporalDither: undefinedIfEqual(animation.temporalDither, 'off'),
    ...buildShareAnimationPatternFields(animation),
    moduleJitter: undefinedIfEqual(animation.moduleJitterPx, 0),
    colorCycle: trueIfTrue(animation.colorCycle),
    seed: undefinedIfEqual(animation.seed, 0),
    animationSeed: undefinedIfEqual(animation.seed, 0),
  };
}
