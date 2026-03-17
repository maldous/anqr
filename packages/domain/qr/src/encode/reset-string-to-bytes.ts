import { defaultStringToBytes } from "./default-string-to-bytes";
import { stringToBytesState } from "./string-to-bytes-state";

export function resetStringToBytes(): void {
  stringToBytesState.current = defaultStringToBytes;
}
