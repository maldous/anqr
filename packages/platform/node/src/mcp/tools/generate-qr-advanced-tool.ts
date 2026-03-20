import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { qrGenerateAdvancedInputSchema, type QrGenerateAdvancedInput } from "@/contracts/mcp";
import { renderConfiguredServerQROutput } from "@/application/generator/server";
import { buildAdvancedServerQRRequestParams } from "./build-advanced-server-qr-request-params";
import { registerRenderTool } from "./register-render-tool";

export function registerGenerateQrAdvancedTool(server: McpServer): void {
  registerRenderTool<
    QrGenerateAdvancedInput,
    ReturnType<typeof buildAdvancedServerQRRequestParams>
  >(server, {
    name: "generate_qr_advanced",
    description:
      "Generate advanced QR outputs including HTTPS-only overlays and animation formats using the full guarded server render pipeline.",
    shape: qrGenerateAdvancedInputSchema,
    toParams: (input) => buildAdvancedServerQRRequestParams(input),
    render: renderConfiguredServerQROutput,
    getLogContext: (params, extra) => ({
      outputFormat: params.outputFormat,
      hasOverlay: !!params.overlayUrl,
      hasAnimation: params.animationPattern !== "none" || params.animationPattern2 !== "none",
      hasSession: !!extra?.sessionId,
    }),
    getFailureMessage: (error) =>
      error instanceof Error ? error.message : "Advanced QR generation failed",
  });
}
