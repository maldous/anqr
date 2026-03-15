import { admobRuntime } from './admob-runtime-state';

export function isRewardedAdReady(): boolean {
  return admobRuntime.available && admobRuntime.preparedRewardedKeys.size > 0;
}
