import type { McpAuthConfig } from "./mcp-auth-config.types";
import { buildFirebaseAuthConfig } from "./build-firebase-auth-config";
import { buildJwksAuthConfig } from "./build-jwks-auth-config";
import { getConfiguredBearerTokens } from "./get-configured-bearer-tokens";

export function getMcpAuthConfig(): McpAuthConfig {
  const bearerTokens = getConfiguredBearerTokens();
  const mode = process.env.MCP_AUTH_MODE;
  const jwksUrl = process.env.MCP_JWKS_URL || process.env.AUTH_JWKS_URL;
  const firebaseProjectId =
    process.env.MCP_FIREBASE_PROJECT_ID ||
    process.env.AUTH_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID;

  if (mode === "firebase" || (!mode && firebaseProjectId)) {
    return buildFirebaseAuthConfig(firebaseProjectId || "anqr-link");
  }

  if (mode === "jwks" || (!mode && jwksUrl)) {
    return buildJwksAuthConfig(jwksUrl);
  }

  if (mode === "bearer" || (!mode && bearerTokens.length > 0)) {
    return {
      mode: "bearer",
      bearerTokens,
    };
  }

  return {
    mode: "disabled",
    bearerTokens: [],
  };
}
