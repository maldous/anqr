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
  format: z.enum(["png", "svg"]).optional().describe("Output format"),
  margin: z.coerce
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Quiet-zone margin in modules"),
});

export type QrApiQuery = z.infer<typeof qrApiQuerySchema>;
