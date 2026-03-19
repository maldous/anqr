import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  qrCapabilitiesResourceSchema,
  qrCapabilitiesResourceUri,
} from "@/contracts/mcp";
import { QR_CAPABILITIES } from "./qr-capabilities-resource";

export function registerQrCapabilitiesResource(server: McpServer): void {
  server.registerResource(
    "qr_capabilities",
    qrCapabilitiesResourceUri,
    {
      title: "QR generation capabilities",
      description: "Supported formats, limits, and safety constraints for the generate_qr tool.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: qrCapabilitiesResourceUri,
          mimeType: "application/json",
          text: JSON.stringify(qrCapabilitiesResourceSchema.parse(QR_CAPABILITIES), null, 2),
        },
      ],
    }),
  );
}
