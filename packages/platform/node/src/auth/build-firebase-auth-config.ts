import type { McpAuthConfig } from "./mcp-auth-config.types";

export function buildFirebaseAuthConfig(projectId: string): McpAuthConfig {
  const normalizedProjectId = projectId.trim();
  return {
    mode: "firebase",
    bearerTokens: [],
    jwksUrl:
      process.env.MCP_FIREBASE_JWKS_URL ||
      process.env.AUTH_FIREBASE_JWKS_URL ||
      "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
    issuer:
      process.env.MCP_JWT_ISSUER ||
      process.env.AUTH_JWT_ISSUER ||
      `https://securetoken.google.com/${normalizedProjectId}`,
    audience:
      process.env.MCP_JWT_AUDIENCE || process.env.AUTH_JWT_AUDIENCE || normalizedProjectId,
    requiredScope: process.env.MCP_JWT_SCOPE || process.env.AUTH_JWT_SCOPE,
  };
}
