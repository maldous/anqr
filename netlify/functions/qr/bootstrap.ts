import * as Sentry from "@sentry/node";
import pkg from "../../package.json";
import { createCanvas, ImageData as NapiImageData } from "@napi-rs/canvas";

Sentry.init({
  dsn: "https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824",
  sendDefaultPii: true,
  release: `anqr@${pkg.version}`,
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  environment: "production",
});
if (globalThis.ImageData === undefined) {
  (globalThis as Record<string, unknown>).ImageData = NapiImageData;
}
if ((globalThis as Record<string, unknown>).HTMLCanvasElement === undefined) {
  (globalThis as Record<string, unknown>).HTMLCanvasElement = createCanvas(1, 1).constructor;
}
if ((globalThis as Record<string, unknown>).OffscreenCanvas === undefined) {
  (globalThis as Record<string, unknown>).OffscreenCanvas = (
    globalThis as Record<string, unknown>
  ).HTMLCanvasElement;
}
