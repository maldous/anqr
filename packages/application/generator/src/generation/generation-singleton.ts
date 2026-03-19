/**
 * Shared QRGenerator singleton instance.
 * Extracted from useQRGenerator.ts for use by split scaffold files.
 */

import { QRGenerator } from "@/modules/qr-generator";
import { defaultBrowserCanvasFactory } from "@/platform/browser";

export const qrGenerator = new QRGenerator(defaultBrowserCanvasFactory);
