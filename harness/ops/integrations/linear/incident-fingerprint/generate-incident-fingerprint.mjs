import { createHash } from "node:crypto";

export function generateIncidentFingerprint(incident) {
  const { type, service, errorSignature = "" } = incident;

  // Normalize error signature to first 100 chars to avoid minor variance
  const normalizedSignature = String(errorSignature).slice(0, 100).trim();

  // Create stable fingerprint: type:service:errorSignature
  const fingerprintInput = `${type}:${service}:${normalizedSignature}`;

  return createHash("sha256").update(fingerprintInput).digest("hex").slice(0, 16); // Use first 16 chars for readability
}
