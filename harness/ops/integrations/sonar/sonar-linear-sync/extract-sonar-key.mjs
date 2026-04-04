// Generated from ../../../../scripts/ops/integrations/sonar/sonar-linear-sync.mjs:227

import { SONAR_KEY_PATTERN } from "./sonar-key-pattern.mjs";

export function extractSonarKey(description) {
  const match = description?.match(SONAR_KEY_PATTERN);
  return match ? match[1] : null;
}
