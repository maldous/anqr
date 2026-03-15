/**
 * Copy array elements (like System.arraycopy in Java)
 */
export function arraycopy(
  src: any,
  srcPos: number,
  dest: any,
  destPos: number,
  length: number
): void {
  if (src === dest && srcPos < destPos) {
    // Copy backwards to avoid overwriting
    destPos += length - 1;
    srcPos += length - 1;
    while (length--) {
      dest[destPos--] = src[srcPos--];
    }
  } else {
    while (length--) {
      dest[destPos++] = src[srcPos++];
    }
  }
}
