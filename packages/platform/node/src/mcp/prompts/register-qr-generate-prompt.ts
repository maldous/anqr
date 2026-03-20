import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { qrGeneratePromptArgsSchema, type QrGeneratePromptArgs } from "@/contracts/mcp";
import { buildIntentGuidance } from "./build-intent-guidance";

export function registerQrGeneratePrompt(server: McpServer): void {
  server.registerPrompt(
    "qr_generation_guidance",
    {
      title: "QR generation guidance",
      description: "Prompt template for producing a safe, scan-friendly generate_qr request.",
      argsSchema: qrGeneratePromptArgsSchema,
    },
    async (args) => {
      const promptArgs = args as QrGeneratePromptArgs;
      const format = promptArgs.format ?? "png";
      const sampleData = promptArgs.data
        ? `Source data: ${promptArgs.data}`
        : "Source data: <provide data>";

      return {
        description:
          "Guidance for constructing a safe generate_qr or generate_qr_advanced MCP tool call.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Prepare a generate_qr tool call for intent '${promptArgs.intent}'. ` +
                `${buildIntentGuidance(promptArgs.intent)} ` +
                `Default to format '${format}', ECC 'H', and a margin of 4 unless the caller says otherwise. ` +
                `If the request needs overlays or animation, switch to generate_qr_advanced and keep overlay URLs on https only. ` +
                `${sampleData}`,
            },
          },
        ],
      };
    },
  );
}
