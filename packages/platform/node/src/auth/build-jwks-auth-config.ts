import type { McpAuthConfig } from "./mcp-auth-config.types";

export function buildJwksAuthConfig(jwksUrl: string): McpAuthConfig {
  return {
    mode: "jwks",
    bearerTokens: [],
    jwksUrl,
    issuer: process.env.MCP_JWT_ISSUER || process.env.AUTH_JWT_ISSUER,
    audience: process.env.MCP_JWT_AUDIENCE || process.env.AUTH_JWT_AUDIENCE,
    requiredScope: process.env.MCP_JWT_SCOPE || process.env.AUTH_JWT_SCOPE,
  };
}
