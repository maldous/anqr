import { initContract } from "@ts-rest/core";
import { qrApiErrorSchema } from "./qr-api-error.contract";
import { qrApiQuerySchema } from "./qr-api-query.contract";
import { qrApiSuccessSchema } from "./qr-api-success.contract";

const c = initContract();

export const qrApiContract = c.router({
  generateQR: {
    method: "GET",
    path: "/api/contract/qr",
    query: qrApiQuerySchema,
    responses: {
      200: qrApiSuccessSchema,
      400: qrApiErrorSchema,
      500: qrApiErrorSchema,
    },
    summary: "Generate a QR code image",
  },
});
