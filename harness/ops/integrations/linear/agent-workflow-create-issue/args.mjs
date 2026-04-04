import { parseArgs } from "node:util";

export const args = parseArgs({
  options: {
    title: { type: "string", short: "t" },
    description: { type: "string", short: "d" },
    priority: { type: "string", short: "p", default: "3" },
    labels: { type: "string", short: "l", default: "harness" },
    stateId: { type: "string", short: "s", default: "backlog" },
    help: { type: "boolean", short: "h" },
  },
  allowPositionals: true,
});
