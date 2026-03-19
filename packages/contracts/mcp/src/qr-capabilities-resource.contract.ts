import { z } from "zod";

export const qrCapabilitiesResourceUri = "anqr://qr/capabilities";

export const qrCapabilitiesResourceSchema = z.object({
  tools: z
    .array(z.enum(["generate_qr", "generate_qr_advanced"]).describe("Registered MCP QR tool name"))
    .describe("QR generation tools exposed by the MCP server"),
  formats: z
    .array(z.enum(["png", "svg", "webp", "gif"]).describe("Supported output format"))
    .describe("Output formats accepted by the QR tools"),
  errorCorrectionLevels: z
    .array(z.enum(["L", "M", "Q", "H"]).describe("Supported error-correction level"))
    .describe("Error-correction levels accepted by QR generation"),
  size: z
    .object({
      min: z.number().int().min(1).describe("Minimum supported output size in pixels"),
      max: z.number().int().min(1).describe("Maximum supported output size in pixels"),
      default: z.number().int().min(1).describe("Default output size in pixels"),
    })
    .describe("Supported output-size range"),
  margin: z
    .object({
      min: z.number().int().min(0).describe("Minimum supported quiet-zone margin in modules"),
      max: z.number().int().min(0).describe("Maximum supported quiet-zone margin in modules"),
      default: z.number().int().min(0).describe("Default quiet-zone margin in modules"),
    })
    .describe("Supported quiet-zone margin range"),
  overlay: z
    .object({
      httpsOnly: z.literal(true).describe("Overlay fetching is restricted to HTTPS URLs"),
      privateNetworkBlocked: z.literal(true).describe("Private, loopback, link-local, and metadata networks are blocked"),
      redirectsRevalidated: z.literal(true).describe("Every redirect hop is revalidated before fetching"),
      maxBytes: z.number().int().min(1).describe("Maximum overlay payload size in bytes"),
      timeoutMs: z.number().int().min(1).describe("Overlay fetch timeout in milliseconds"),
    })
    .describe("Overlay-fetch safety policy"),
  safety: z.array(z.string().describe("Human-readable safety guarantee")).describe("Safety guarantees enforced by the MCP QR tools"),
});

export type QrCapabilitiesResource = z.infer<typeof qrCapabilitiesResourceSchema>;
