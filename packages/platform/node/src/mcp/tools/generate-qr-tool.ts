import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { qrGenerateInputSchema, type QrGenerateInput } from "@/contracts/mcp";
import { renderBasicServerQROutput } from "@/application/generator/server";
import { registerRenderTool } from "./register-render-tool";

export function registerGenerateQrTool(server: McpServer): void {
  registerRenderTool<QrGenerateInput, QrGenerateInput>(server, {
    name: "generate_qr",
    description: "Generate a QR code image from text or URL data. Returns a PNG or SVG image.",
    shape: qrGenerateInputSchema,
    toParams: (input) => input,
    render: renderBasicServerQROutput,
    getLogContext: (params, extra) => ({
      outputFormat: params.format ?? "png",
      size: params.size,
      hasSession: !!extra?.sessionId,
    }),
    getFailureMessage: (error) => (error instanceof Error ? error.message : "QR generation failed"),
  });
}
