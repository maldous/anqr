// Generated from ../../../../scripts/ops/integrations/linear/incident-manager.mjs:108

import { INCIDENT_TYPES } from "./incident-types.mjs";

export function buildIncidentTitle(type, context) {
  const config = INCIDENT_TYPES[type];
  if (!config) {
    return `Incident: ${type}`;
  }

  const { titlePrefix } = config;
  const { service, issueRef, trigger } = context;

  if (service) {
    return `${titlePrefix}: ${service}`;
  }

  if (issueRef) {
    return `${titlePrefix}: ${issueRef}`;
  }

  if (trigger) {
    return `${titlePrefix}: ${trigger}`;
  }

  return titlePrefix;
}
