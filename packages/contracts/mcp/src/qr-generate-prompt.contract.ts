import { z } from "zod";
export type { QrGeneratePromptArgs } from "./qr-generate-prompt-args.contract";

export const qrGeneratePromptArgsSchema = {
  intent: z.enum(["url", "wifi", "contact", "payment", "plain_text"]).describe(
    "High-level QR use case to optimize the prompt guidance",
  ),
  data: z.string().optional().describe("Optional source data to embed into the example prompt"),
  format: z.enum(["png", "svg"]).optional().describe("Preferred output format"),
};
