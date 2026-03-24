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
  toolExecutionRead: {
    messages: [{ role: "user" as const, content: "Read the package.json file." }],
    model: "symphony/main",
    stream: false,
  },
  toolExecutionExec: {
    messages: [{ role: "user" as const, content: "Run 'echo hello'." }],
    model: "symphony/main",
    stream: false,
  },
  toolExecutionGlob: {
    messages: [{ role: "user" as const, content: "Find all .ts files." }],
    model: "symphony/main",
    stream: false,
  },
};
