import { qrApiErrorSchema } from "@/contracts/api";

export function createErrorBody(error: string, status: number, code?: string) {
  return qrApiErrorSchema.parse({ error, status, code });
}
