import type { ECCLevel } from "@/contracts/analyze";
import type { ValidEncoderMode } from "./reproduction-types";
import { tryCreateQr } from "./try-create-qr";

export function createQrWithVersionFallback(
  data: string,
  ecc: ECCLevel,
  version: number,
  maskToUse: number | undefined,
) {
  for (let nextVersion = version + 1; nextVersion <= 40; nextVersion += 1) {
    try {
      return tryCreateQr(data, ecc, nextVersion, "mixed" as ValidEncoderMode, maskToUse);
    } catch {
      // try next
    }
  }

  throw new Error(`Data too large: cannot fit in any QR version (1-40) with ECC ${ecc}`);
}
