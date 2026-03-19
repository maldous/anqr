import { QRGenerator } from "@/domain/render/generator";
import { defaultBrowserCanvasFactory } from "@/platform/browser";

// Singleton QR generator instance
export const qrGenerator = new QRGenerator(defaultBrowserCanvasFactory);
