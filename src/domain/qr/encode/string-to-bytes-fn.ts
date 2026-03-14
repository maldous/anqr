import { stringToBytesState } from './string-to-bytes-state';

export function stringToBytesFn(s: string): number[] {
  return stringToBytesState.current(s);
}
