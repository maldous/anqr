import { defaultStringToBytes } from "./default-string-to-bytes";

export const stringToBytesState = {
  current: defaultStringToBytes as (s: string) => number[],
};
