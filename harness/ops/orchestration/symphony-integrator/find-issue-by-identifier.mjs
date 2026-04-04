// Generated from ../../../scripts/ops/orchestration/symphony-integrator.mjs:186

export async function findIssueByIdentifier(identifier) {
  try {
    const { findOpenIssuesByIdentifier } = await import("../../linear-client.mjs");
    const results = await findOpenIssuesByIdentifier(identifier);
    return results?.[0] || null;
  } catch {
    return null;
  }
}
