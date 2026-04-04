// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:121

export function buildCommentBody(check, report) {
  const lines = [
    `**Still failing** as of ${report.timestamp} (profile: ${report.profile})`,
    "",
    "```",
    check.detail,
    "```",
  ];
  return lines.join("\n");
}
