import { admobRuntime } from './admob-runtime-state';

export function isAdMobAvailable(): boolean {
  return admobRuntime.available;
}
