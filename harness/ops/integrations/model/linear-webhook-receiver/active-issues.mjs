import { createDurableSet } from "../../../lib/durable-kv.mjs";

export const activeIssues = createDurableSet("linear-active-issues");
