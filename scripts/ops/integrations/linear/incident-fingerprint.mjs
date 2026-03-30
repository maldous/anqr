#!/usr/bin/env node

/**
 * incident-fingerprint.mjs — Incident deduplication via fingerprinting
 *
 * Generates stable fingerprints for incidents to prevent duplicate issue creation.
 */

import { createHash } from "node:crypto";

/**
 * Generate a stable fingerprint for an incident
 * 
 * @param {object} incident - Incident data
 * @param {string} incident.type - Incident type (WATCHDOG_ROLLBACK, RETRY_EXHAUSTED, etc.)
 * @param {string} incident.service - Service name
 * @param {string} incident.errorSignature - Error signature or message
 * @returns {string} SHA-256 fingerprint
 */
export function generateIncidentFingerprint(incident) {
  const { type, service, errorSignature = "" } = incident;
  
  // Normalize error signature to first 100 chars to avoid minor variance
  const normalizedSignature = String(errorSignature).slice(0, 100).trim();
  
  // Create stable fingerprint: type:service:errorSignature
  const fingerprintInput = `${type}:${service}:${normalizedSignature}`;
  
  return createHash("sha256")
    .update(fingerprintInput)
    .digest("hex")
    .slice(0, 16); // Use first 16 chars for readability
}

/**
 * Extract fingerprint from issue description
 * 
 * @param {string} description - Issue description text
 * @returns {string|null} Fingerprint if found, null otherwise
 */
export function extractFingerprintFromDescription(description) {
  if (!description) return null;
  
  // Look for fingerprint marker in description
  const match = description.match(/<!-- incident-fingerprint: ([a-f0-9]{16}) -->/);
  return match ? match[1] : null;
}

/**
 * Build fingerprint marker for embedding in description
 * 
 * @param {string} fingerprint - Incident fingerprint
 * @returns {string} HTML comment marker
 */
export function buildFingerprintMarker(fingerprint) {
  return `<!-- incident-fingerprint: ${fingerprint} -->`;
}
