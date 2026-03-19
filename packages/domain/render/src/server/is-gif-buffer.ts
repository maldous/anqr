import { isGifSignature } from "../animation";

export function isGifBuffer(buffer: ArrayBuffer): boolean {
  return isGifSignature(buffer);
}
