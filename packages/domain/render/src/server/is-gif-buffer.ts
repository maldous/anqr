import { isGifSignature } from "@/modules/animation";

export function isGifBuffer(buffer: ArrayBuffer): boolean {
  return isGifSignature(buffer);
}
