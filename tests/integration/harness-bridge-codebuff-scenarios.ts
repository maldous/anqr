export const codebuffTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok'." }],
    model: "codebuff/base",
    stream: false,
  },
  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count to 3." }],
    model: "codebuff/base",
    stream: true,
  },
};
