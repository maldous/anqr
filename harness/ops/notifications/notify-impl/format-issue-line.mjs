import { linearIssueUrl } from "./linear-issue-url.mjs";

export function formatIssueLine({ identifier, title, snippet, meta = [] }) {
  const url = linearIssueUrl(identifier);
  const parts = [`• ${identifier}`];
  if (title) parts[0] += `: ${title}`;
  for (const line of meta) {
    const text = String(line || "").trim();
    if (text) parts.push(`  ${text}`);
  }
  parts.push(`  ${url}`);
  if (snippet) {
    const trimmed = snippet.replaceAll(/\s+/g, " ").trim();
    const preview = trimmed.length > 600 ? `${trimmed.slice(0, 597)}...` : trimmed;
    if (preview) parts.push(`  > ${preview}`);
  }
  return parts.join("\n");
}
