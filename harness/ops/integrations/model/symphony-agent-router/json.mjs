// Generated from ../../../../scripts/ops/integrations/model/symphony-agent-router.mjs:90

export function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
