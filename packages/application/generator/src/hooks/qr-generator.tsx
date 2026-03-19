import { QRGenerator } from "@/domain/qr/generator";
import { defaultBrowserCanvasFactory } from "@/platform/browser";

// Singleton QR generator instance
export const qrGenerator = new QRGenerator(defaultBrowserCanvasFactory);
