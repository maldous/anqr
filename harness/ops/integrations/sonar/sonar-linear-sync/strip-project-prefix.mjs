// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:232

export function stripProjectPrefix(component, projectKey) {
  const prefix = `${projectKey}:`;
  return component.startsWith(prefix) ? component.slice(prefix.length) : component;
}
