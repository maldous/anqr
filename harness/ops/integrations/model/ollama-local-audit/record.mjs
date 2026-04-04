// Generated from ../../../../scripts/ops/integrations/model/ollama-local-audit.mjs:27

import { results } from "./results.mjs";
import { logInfo } from "./logger.mjs";

export function record(name, pass, detail) {
  const entry = { name, pass, detail, ts: new Date().toISOString() };
  results.push(entry);
  const icon = pass ? "✅" : "❌";
  logInfo(`${icon} ${name}: ${detail}`);
}
