import { qrApiContract, qrApiSuccessSchema } from "@/contracts/api";
import { renderBasicServerQROutput } from "@/application/generator/server";
import { nodeCanvasFactory } from "@/platform/node/server";
import { createErrorBody } from "./create-error-body";

export async function handler(request: Request): Promise<Response> {
  if (request.method !== qrApiContract.generateQR.method) {
    return Response.json(createErrorBody("Method not allowed", 405, "METHOD_NOT_ALLOWED"), {
      status: 405,
    });
  }

  const url = new URL(request.url);
  const parsedQuery = qrApiContract.generateQR.query.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsedQuery.success) {
    return Response.json(createErrorBody("Invalid query parameters", 400, "INVALID_QUERY"), {
      status: 400,
    });
  }

  try {
    const format = parsedQuery.data.format ?? "png";
    const { outputBuffer, contentType } = await renderBasicServerQROutput(parsedQuery.data, nodeCanvasFactory);
    const responseBody = qrApiSuccessSchema.parse({
      ok: true,
      data: {
        format,
        mimeType: contentType,
        encoding: "base64",
        content: outputBuffer.toString("base64"),
      },
    });

    return Response.json(responseBody, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "QR generation failed";
    return Response.json(createErrorBody(message, 500, "QR_GENERATION_FAILED"), {
      status: 500,
    });
  }
}
