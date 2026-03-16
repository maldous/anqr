/**
 * Copy array elements (like System.arraycopy in Java)
 */
export function arraycopy<T = number>(
  src: ArrayLike<T>,
  srcPos: number,
  dest: { [index: number]: T },
  destPos: number,
  length: number
): void {
  if ((src as unknown) === (dest as unknown) && srcPos < destPos) {
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
