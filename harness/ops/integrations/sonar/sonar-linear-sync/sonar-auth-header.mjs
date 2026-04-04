export function sonarAuthHeader(token) {
  return `Basic ${Buffer.from(token + ":").toString("base64")}`;
}
