import {
  DARK_DESIRE_MAX,
  DARK_DESIRE_MIN,
  LIGHT_DESIRE_MAX,
  LIGHT_DESIRE_MIN,
} from './dithering-constants';

export function computeDitheredModuleValue(
  qrIsDark: boolean,
  brightness: number,
  error: number,
  mix: number
): { newValue: boolean; quantError: number } {
  const originalValue = qrIsDark ? 1 : 0;
  const overlayDark = 1 - brightness;
  let targetValue = originalValue * (1 - mix) + overlayDark * mix;

  if (qrIsDark) {
    targetValue = DARK_DESIRE_MIN + targetValue * (DARK_DESIRE_MAX - DARK_DESIRE_MIN);
  } else {
    targetValue = LIGHT_DESIRE_MIN + targetValue * (LIGHT_DESIRE_MAX - LIGHT_DESIRE_MIN);
  }

  const adjustedValue = targetValue + error;
  const threshold = qrIsDark ? 0.4 : 0.6;
  const newValue = adjustedValue >= threshold;
  return { newValue, quantError: adjustedValue - (newValue ? 1 : 0) };
}
