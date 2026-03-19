import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerQrGeneratePrompt } from "./prompts/register-qr-generate-prompt";
import { registerQrCapabilitiesResource } from "./resources/register-qr-capabilities-resource";
import { registerGenerateQrAdvancedTool } from "./tools/generate-qr-advanced-tool";
import { registerGenerateQrTool } from "./tools/generate-qr-tool";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "anqr-mcp",
    version: "1.0.0",
  });

  registerQrCapabilitiesResource(server);
  registerQrGeneratePrompt(server);
  registerGenerateQrAdvancedTool(server);
  registerGenerateQrTool(server);

  return server;
}
