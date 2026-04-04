// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:36

export function sonarAuthHeader(token) {
  return `Basic ${Buffer.from(token + ":").toString("base64")}`;
}
