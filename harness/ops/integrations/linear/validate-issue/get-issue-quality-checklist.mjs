// Generated from ../../../../scripts/ops/integrations/linear/validate-issue.mjs:216

export function getIssueQualityChecklist(input) {
  return [
    `✅ Title is clear and descriptive (${input.title?.length || 0}/200 chars)`,
    `✅ Description includes Problem section`,
    `✅ Description includes Root Cause section`,
    `✅ Description includes Impact section`,
    `✅ Description includes Solution section`,
    `✅ Description includes Acceptance Criteria section`,
    `✅ At least one label is set`,
    `✅ Valid label combination`,
    `✅ State ID is valid`,
    `✅ Priority is appropriate`,
    `✅ Estimate is provided`,
    `✅ No placeholder text (TODO/FIXME/PLACEHOLDER)`,
    `✅ Description is at least 50 characters`,
  ];
}
