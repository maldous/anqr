import type { QRAnalysisResult } from "@/modules/qr-analyzer";
import type { ValidEncoderMode } from "./reproduction-types";

export function buildEncoderInput(
  result: QRAnalysisResult,
  modeToUse: ValidEncoderMode | undefined,
): { kind: "bytes" | "string"; data: string } {
  const bytes = result.payloadBytes;
  const wantsByte = modeToUse === "byte" || result.encodingMode === "byte";
  if (!(bytes?.length && wantsByte)) {
    return { kind: "string", data: result.payload! };
  }

  let data = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.slice(i, i + chunk);
    for (const byte of slice) data += String.fromCodePoint(byte);
  }
  return { kind: "bytes", data };
}
