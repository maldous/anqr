export function sanitizeForDiscordPreview(text) {
  if (!text || !text.trim()) return "";
  let s = text;

  // Strip "Conversation info (untrusted metadata):" + fenced JSON block
  s = s.replace(/Conversation info \(untrusted metadata\):\s*```json?[\s\S]*?```\s*/g, "");
  s = s.replace(/Conversation info \(untrusted metadata\):\s*\{[\s\S]*?\}\s*/g, "");

  // Strip system instruction preambles (memory flush, workspace bootstrap, etc.)
  s = s.replace(/Pre-compaction memory flush[\s\S]*?(?=\n\n|$)/i, "");
  s = s.replace(/Store durable memories only in[\s\S]*?(?=\n\n|$)/i, "");
  s = s.replace(/Treat workspace bootstrap\/reference files[\s\S]*?(?=\n\n|$)/i, "");

  // Strip voice transcript preamble, keep the actual transcript
  s = s.replace(/^Voice transcript from speaker\s+"[^"]*":\s*/i, "");

  // Strip remaining fenced code blocks (often JSON metadata)
  s = s.replace(/```[\s\S]*?```/g, "");

  // Strip "## Issue: ..." / "## System:" headers (internal routing)
  s = s.replace(/^##\s*(Issue|System|Task):[^\n]*/gm, "");

  // Strip provider fallback noise (internal routing that should never reach users)
  s = s.replace(/^⚠️\s+\S+\s+failed\s+\([^)]*\),\s*trying next provider[^\n]*/gm, "");
  s = s.replace(/^🎯\s+PROVIDER SELECTED[^\n]*/gm, "");
  s = s.replace(/^🔄\s+FALLBACK ATTEMPT[^\n]*/gm, "");

  // Collapse whitespace
  s = s.replace(/\n{2,}/g, "\n").trim();

  // Truncate at a natural boundary
  if (s.length > 120) {
    const cutoff = s.lastIndexOf(" ", 120);
    s = s.slice(0, cutoff > 60 ? cutoff : 120) + "\u2026";
  }

  return s;
}
