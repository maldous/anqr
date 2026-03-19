import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { qrGenerateAdvancedInputSchema, type QrGenerateAdvancedInput } from "@/contracts/mcp";
import { renderConfiguredServerQROutput } from "@/application/generator/server";
import { nodeCanvasFactory } from "../../server";
import { mcpLog } from "../log";
import { buildAdvancedServerQRRequestParams } from "./build-advanced-server-qr-request-params";
import { createMcpErrorResult } from "./create-mcp-error-result";
import { createMcpImageResult } from "./create-mcp-image-result";

export function registerGenerateQrAdvancedTool(server: McpServer): void {
  server.tool(
    "generate_qr_advanced",
    "Generate advanced QR outputs including HTTPS-only overlays and animation formats using the full guarded server render pipeline.",
    qrGenerateAdvancedInputSchema.shape,
    async (input, extra) => {
      try {
        const params = buildAdvancedServerQRRequestParams(input as QrGenerateAdvancedInput);

        mcpLog.info("generate_qr_advanced invoked", {
          tool: "generate_qr_advanced",
          outputFormat: params.outputFormat,
          hasOverlay: !!params.overlayUrl,
          hasAnimation: params.animationPattern !== "none" || params.animationPattern2 !== "none",
          hasSession: !!extra?.sessionId,
        });

        const { outputBuffer, contentType } = await renderConfiguredServerQROutput(
          params,
          nodeCanvasFactory,
        );

        return createMcpImageResult(outputBuffer, contentType);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Advanced QR generation failed";
        mcpLog.warn("generate_qr_advanced failed", {
          tool: "generate_qr_advanced",
          message,
        });
        return createMcpErrorResult(message);
      }
    },
  );
}
