import type { RouteAccessClassification } from "./route-access-classification.types";

export const MCP_ROUTE_POLICY: {
  route: "/api/mcp";
  classification: RouteAccessClassification;
  cacheControl: "no-store";
  perimeterControls: readonly ["rate-limit", "auth", "audit"];
} = {
  route: "/api/mcp",
  classification: "ai_tool",
  cacheControl: "no-store",
  perimeterControls: ["rate-limit", "auth", "audit"],
};
