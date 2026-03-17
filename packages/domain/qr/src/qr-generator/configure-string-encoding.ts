import { createShiftJISEncoder, resetStringToBytes, setStringToBytes } from "@/modules/qr-encoder";

export function configureStringEncoding(encoding: string): void {
  if (encoding === "utf8") {
    setStringToBytes((s: string) => {
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(s));
    });
    return;
  }

  if (encoding === "shift-jis") {
    setStringToBytes(createShiftJISEncoder());
    return;
  }

  resetStringToBytes();
}
