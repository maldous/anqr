import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authorizeMcpRequest, enforceMcpRateLimit } from "@/platform/node";
import { auditMcpRequest, createMcpServer } from "@/platform/node/mcp";

export async function handler(request: Request): Promise<Response> {
  const unauthorized = await authorizeMcpRequest(request);
  if (unauthorized) {
    await auditMcpRequest(request, "unauthorized");
    return unauthorized;
  }

  const rateLimited = enforceMcpRateLimit(request);
  if (rateLimited) {
    await auditMcpRequest(request, "rate_limited");
    return rateLimited;
  }

  const server = createMcpServer();

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  try {
    const response = await transport.handleRequest(request);
    await auditMcpRequest(request, "allowed", { status: response.status });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP handler failed";
    await auditMcpRequest(request, "error", { message });
    throw error;
  }
}
