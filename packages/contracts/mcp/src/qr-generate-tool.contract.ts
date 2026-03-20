import { z } from "zod";
export type { QrGenerateInput } from "./qr-generate-input.contract";
export const qrGenerateInputSchema = {
  data: z.string().describe("The content to encode in the QR code (URL, text, etc.)"),
  size: z
    .number()
    .int()
    .min(50)
    .max(4096)
    .optional()
    .describe("Output image size in pixels (default: 400)"),
  errorCorrection: z
    .enum(["L", "M", "Q", "H"])
    .optional()
    .describe("Error correction level: L(7%), M(15%), Q(25%), H(30%) (default: H)"),
  foreground: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Foreground color as 6-digit hex without # (default: 000000)"),
  background: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/)
    .optional()
    .describe("Background color as 6-digit hex without # (default: ffffff)"),
  format: z.enum(["png", "svg"]).optional().describe("Output image format (default: png)"),
  margin: z
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .describe("Quiet zone margin in modules (default: 4)"),
};
