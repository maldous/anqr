import type { QrCapabilitiesResource } from "@/contracts/mcp";
import { FETCH_TIMEOUT_MS, MAX_OVERLAY_BYTES } from "../../server";

export const QR_CAPABILITIES: QrCapabilitiesResource = {
  tools: ["generate_qr", "generate_qr_advanced"],
  formats: ["png", "svg", "webp", "gif"],
  errorCorrectionLevels: ["L", "M", "Q", "H"],
  size: { min: 50, max: 4096, default: 400 },
  margin: { min: 0, max: 20, default: 4 },
  overlay: {
    httpsOnly: true,
    privateNetworkBlocked: true,
    redirectsRevalidated: true,
    maxBytes: MAX_OVERLAY_BYTES,
    timeoutMs: FETCH_TIMEOUT_MS,
  },
  safety: [
    "HTTPS-only overlay URLs for advanced tool use",
    "DNS resolution rejects private, link-local, loopback, and metadata ranges",
    "Redirects are re-validated before each fetch hop",
    "Overlay content-length, timeout, content type, and magic bytes are validated",
    "No file system access",
    "Stateless request handling",
    "Bounded size and margin inputs",
  ],
};
