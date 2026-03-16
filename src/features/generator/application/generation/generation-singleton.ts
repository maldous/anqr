/**
 * Shared QRGenerator singleton instance.
 * Extracted from useQRGenerator.ts for use by split scaffold files.
 */

import { QRGenerator } from "@/modules/qr-generator";

export const qrGenerator = new QRGenerator();
