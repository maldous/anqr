import { stringToBytesState } from "./string-to-bytes-state";

export function setStringToBytes(fn: (s: string) => number[]): void {
  stringToBytesState.current = fn;
}
