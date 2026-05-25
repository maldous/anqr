import { z } from "zod";

export const qrApiQuerySchema = z.object({
  data: z.string().min(1).max(4096).describe("Content to encode into the QR code"),
  size: z.coerce
    .number()
    .int()
    .min(50)
    .max(4096)
    .optional()
    .describe("Square output size in pixels"),
  errorCorrection: z
    .enum(["L", "M", "Q", "H"])
    .optional()
    .describe("Error correction level: L, M, Q, or H"),
  foreground: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Foreground color as a 6-digit hex value without #"),
  background: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Background color as a 6-digit hex value without #"),
  // L8: was limited to ["png", "svg"] while renderBasicServerQROutput
  // already supports the full OutputFormat enum (png, webp, gif, svg).
  // gif here is single-frame; the animated path is /api/qr with
  // animPattern=... (the contract endpoint is the type-safe, non-
  // animated surface).
  format: z
    .enum(["png", "webp", "gif", "svg"])
    .optional()
    .describe("Output format. gif is single-frame; use /api/qr for animation."),
  margin: z.coerce
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Quiet-zone margin in modules"),
});

export type QrApiQuery = z.infer<typeof qrApiQuerySchema>;
