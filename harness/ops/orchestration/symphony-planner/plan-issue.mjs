import { addComment } from "../../linear-client.mjs";

const BRIDGE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319/v1";
const BRIDGE_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const PLAN_TIMEOUT_MS = 60_000;

const SYSTEM_PROMPT = `You are a software planning assistant. Given a Linear issue, produce a concise implementation plan.

Output ONLY the following sections (plain text, no preamble):

ACCEPTANCE CRITERIA:
- (bullet list of what "done" looks like — testable, observable outcomes)

IMPLEMENTATION STEPS:
1. (ordered steps a developer should take)

SCOPE BOUNDARY:
- IN: (what IS in scope)
- OUT: (what is NOT in scope — prevents scope creep)

FILES LIKELY AFFECTED:
- (file paths or directories, based on the description)

Keep each section short. If the issue is already concrete and specific, keep the plan minimal.`;

export async function planIssue(issue) {
  const userMsg = [
    `Issue: ${issue.identifier} — ${issue.title}`,
    issue.description ? `\nDescription:\n${issue.description}` : "",
  ]
    .join("")
    .trim();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PLAN_TIMEOUT_MS);

  let planText;
  try {
    const res = await fetch(`${BRIDGE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BRIDGE_API_KEY}`,
        "X-Symphony-Origin": "planner",
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        max_tokens: 800,
        temperature: 0.3,
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
    planText = data.choices?.[0]?.message?.content?.trim();
    if (!planText) throw new Error("Empty plan response");
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }

  const comment = `AI Hint: Implementation plan generated at dispatch time.\n\n${planText}`;
  await addComment(issue.id, comment);
  return planText;
}

// In-memory set: avoids re-planning across dispatch cycles in the same process.
// On restart, issues get re-planned — that's acceptable (idempotent).
const plannedThisSession = new Set();

export function issueAlreadyPlanned(issue) {
  return plannedThisSession.has(issue.identifier);
}

export function markPlanned(identifier) {
  plannedThisSession.add(identifier);
}
