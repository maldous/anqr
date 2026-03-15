export function isGifSignature(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer);
  if (view.byteLength < 6) return false;
  return (
    view.getUint8(0) === 0x47 && view.getUint8(1) === 0x49 && view.getUint8(2) === 0x46 // GIF
  );
}
