import { stringToBytesState } from './string-to-bytes-state';

export function getStringToBytes(): (s: string) => number[] {
  return stringToBytesState.current;
}
