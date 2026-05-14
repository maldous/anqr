import { addComment } from "../../linear-client.mjs";

const BRIDGE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319/v1";
const BRIDGE_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const CRITIQUE_TIMEOUT_MS = 90_000;
const MAX_DIFF_CHARS = 8_000;

const SYSTEM_PROMPT = `You are a code review assistant. Given a Linear issue and a git diff, determine whether the implementation satisfies the issue's requirements.

Respond with EXACTLY this format (no preamble):

VERDICT: APPROVE or REJECT

REASONING:
(2-4 sentences explaining the verdict)

ISSUES:
- (bullet list of specific problems, or "None" if approving)

Rules:
- APPROVE if the diff addresses the core goal, even if imperfect
- REJECT only if the diff is clearly wrong, off-topic, or missing the main requirement
- Do not nitpick style or minor issues — focus on correctness and completeness
- If you cannot determine correctness from the diff alone, APPROVE with a note`;

export async function critiqueDiff({ issueIdentifier, issueId, diff, planComment }) {
  const diffTruncated = diff.length > MAX_DIFF_CHARS
    ? diff.slice(0, MAX_DIFF_CHARS) + "\n... (truncated)"
    : diff;

  const userMsg = [
    `Issue: ${issueIdentifier}`,
    planComment ? `\nImplementation Plan:\n${planComment}` : "",
    `\nGit Diff:\n\`\`\`diff\n${diffTruncated}\n\`\`\``,
  ].join("").trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRITIQUE_TIMEOUT_MS);

  let critiqueText;
  try {
    const res = await fetch(`${BRIDGE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BRIDGE_API_KEY}`,
        "X-Symphony-Origin": "critique",
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        max_tokens: 600,
        temperature: 0.1,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Bridge ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    critiqueText = data.choices?.[0]?.message?.content?.trim();
    if (!critiqueText) throw new Error("Empty critique response");
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }

  const approved = /^VERDICT:\s*APPROVE/m.test(critiqueText);

  if (issueId) {
    const emoji = approved ? "✅" : "❌";
    await addComment(
      issueId,
      `${emoji} **Critique** (pre-integration review)\n\n${critiqueText}`,
    ).catch(() => {});
  }

  return { approved, critiqueText };
}

export function extractPlanComment(issue) {
  return (issue?.comments?.nodes || [])
    .filter((c) => c.body.startsWith("AI Hint:") && c.body.includes("ACCEPTANCE CRITERIA"))
    .map((c) => c.body)
    .join("\n\n") || null;
}
