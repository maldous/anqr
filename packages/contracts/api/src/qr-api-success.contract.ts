import { z } from "zod";

export const qrApiSuccessSchema = z.object({
  ok: z.literal(true).describe("Success discriminator"),
  data: z
    .object({
      format: z.enum(["png", "svg"]).describe("Returned image format"),
      mimeType: z.string().min(1).describe("MIME type for the encoded content"),
      encoding: z.literal("base64").describe("Payload encoding"),
      content: z.string().min(1).describe("Base64-encoded image payload"),
    })
    .describe("Generated QR image payload"),
});

export type QrApiSuccess = z.infer<typeof qrApiSuccessSchema>;
