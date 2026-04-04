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
