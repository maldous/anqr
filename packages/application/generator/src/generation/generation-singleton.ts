/**
 * Shared QRGenerator singleton instance.
 * Extracted from useQRGenerator.ts for use by split scaffold files.
 */

import { QRGenerator } from "@/domain/qr/generator";
import { getGeneratorCanvasFactory } from "../runtime/generator-runtime";

let qrGenerator: QRGenerator | null = null;

export function getQRGenerator(): QRGenerator {
  qrGenerator ??= new QRGenerator(getGeneratorCanvasFactory());
  return qrGenerator;
}
