import type { CanvasFactory } from "@/domain/render/canvas";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { nodeCanvasFactory } from "../../server";
import { mcpLog } from "../log";
import { createMcpErrorResult } from "./create-mcp-error-result";
import { createMcpImageResult } from "./create-mcp-image-result";
import type { RenderToolOptions } from "./register-render-tool.types";

export function registerRenderTool<TInput, TParams>(
  server: McpServer,
  options: RenderToolOptions<TInput, TParams>,
): void {
  server.tool(options.name, options.description, options.shape, async (input, extra) => {
    try {
      const params = options.toParams(input as TInput);
      mcpLog.info(`${options.name} invoked`, {
        tool: options.name,
        ...options.getLogContext(params, extra),
      });

      const { outputBuffer, contentType } = await options.render(
        params,
        nodeCanvasFactory as unknown as CanvasFactory,
      );
      return createMcpImageResult(outputBuffer, contentType);
    } catch (error) {
      const message = options.getFailureMessage(error);
      mcpLog.warn(`${options.name} failed`, {
        tool: options.name,
        message,
      });
      return createMcpErrorResult(message);
    }
  });
}
