import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { qrGenerateInputSchema, type QrGenerateInput } from "@/contracts/mcp";
import { renderBasicServerQROutput } from "@/application/generator/server";
import { nodeCanvasFactory } from "../../server";
import { mcpLog } from "../log";
import { createMcpErrorResult } from "./create-mcp-error-result";
import { createMcpImageResult } from "./create-mcp-image-result";

export function registerGenerateQrTool(server: McpServer): void {
  server.tool(
    "generate_qr",
    "Generate a QR code image from text or URL data. Returns a PNG or SVG image.",
    qrGenerateInputSchema.shape,
    async (input, extra) => {
      try {
        const params = input as QrGenerateInput;

        mcpLog.info("generate_qr invoked", {
          tool: "generate_qr",
          outputFormat: params.format ?? "png",
          size: params.size,
          hasSession: !!extra?.sessionId,
        });

        const { outputBuffer, contentType } = await renderBasicServerQROutput(
          params,
          nodeCanvasFactory,
        );

        return createMcpImageResult(outputBuffer, contentType);
      } catch (error) {
        const message = error instanceof Error ? error.message : "QR generation failed";
        mcpLog.warn("generate_qr failed", {
          tool: "generate_qr",
          message,
        });
        return createMcpErrorResult(message);
      }
    },
  );
}
