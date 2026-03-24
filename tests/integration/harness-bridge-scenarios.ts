export const symphonyTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok' if you can read this." }],
    model: "symphony/main",
    stream: false,
  },
  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count from 1 to 5." }],
    model: "symphony/main",
    stream: true,
  },
  withIssueContext: {
    messages: [{ role: "user" as const, content: "## Issue: ANQR-747 — Test\nPlease write ok." }],
    model: "symphony/main",
    stream: false,
  },
};
