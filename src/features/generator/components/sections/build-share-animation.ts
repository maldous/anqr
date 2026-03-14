import type { StoreState } from './share-config-store-state.type';

export function buildShareAnimation(animation: StoreState['animation']) {
  return {
    speed: animation.speedMs === 100 ? undefined : animation.speedMs,
    loop: animation.loop === false ? false : undefined,
    reverse: animation.bounce ? true : undefined,
    startFrame: animation.startFrame === 0 ? undefined : animation.startFrame,
    maxFrames: animation.maxFrames === 0 ? undefined : animation.maxFrames,
    frameStep: animation.frameStep === 1 ? undefined : animation.frameStep,
    interpolate: animation.interpolate === 'none' ? undefined : animation.interpolate,
    temporalDither: animation.temporalDither === 'off' ? undefined : animation.temporalDither,
    pattern: animation.pattern === 'none' ? undefined : animation.pattern,
    target: animation.target === 'result' ? undefined : animation.target,
    waveAxis:
      animation.pattern !== 'wave' || animation.waveAxis === 'y' ? undefined : animation.waveAxis,
    pattern2: animation.pattern2 === 'none' ? undefined : animation.pattern2,
    target2:
      animation.pattern2 === 'none' || animation.target2 === 'result'
        ? undefined
        : animation.target2,
    waveAxis2:
      animation.pattern2 !== 'wave' || animation.waveAxis2 === 'x'
        ? undefined
        : animation.waveAxis2,
    moduleJitter: animation.moduleJitterPx === 0 ? undefined : animation.moduleJitterPx,
    colorCycle: animation.colorCycle ? true : undefined,
    seed: animation.seed === 0 ? undefined : animation.seed,
    animationSeed: animation.seed === 0 ? undefined : animation.seed,
  };
}
