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
  const hasFirebaseProjectId =
    typeof firebaseProjectId === "string" && firebaseProjectId.length > 0;
  const useFirebase = mode === "firebase" || (!mode && hasFirebaseProjectId);
  const useJwks = (mode === "jwks" || !mode) && typeof jwksUrl === "string";
  const useBearer = mode === "bearer" || (!mode && bearerTokens.length > 0);

  if (useFirebase) {
    return buildFirebaseAuthConfig(hasFirebaseProjectId ? firebaseProjectId : "anqr-link");
  }

  if (useJwks) {
    return buildJwksAuthConfig(jwksUrl as string);
  }

  if (useBearer) {
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
