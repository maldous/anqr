import { isGifSignature } from "../../src/modules/animation";

export function isGifBuffer(buffer: ArrayBuffer): boolean {
  return isGifSignature(buffer);
}
