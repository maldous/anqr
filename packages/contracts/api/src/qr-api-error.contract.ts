import { z } from "zod";

export const qrApiErrorSchema = z.object({
  error: z.string().min(1).describe("Human-readable error message"),
  code: z.string().min(1).optional().describe("Stable machine-readable error code when available"),
  status: z.number().int().min(400).max(599).optional().describe("HTTP status code associated with the error"),
});

export type QrApiError = z.infer<typeof qrApiErrorSchema>;
