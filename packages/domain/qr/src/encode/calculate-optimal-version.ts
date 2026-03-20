import type { ECCLevel } from "./encoder-api.types";
import { createQRInstance } from "./create-qr-instance";

export function calculateOptimalVersion(
  data: string,
  errorCorrectionLevel: ECCLevel = "M",
): number {
  for (let v = 1; v <= 40; v++) {
    try {
      createQRInstance(data, errorCorrectionLevel, v);
      return v;
    } catch {
      // Version too small, try next.
    }
  }
  return 40;
}
