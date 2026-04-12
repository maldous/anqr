import { createDurableSet } from "../../../lib/durable-kv.mjs";

export const activeIssues = createDurableSet("linear-active-issues", 2 * 60 * 60 * 1000);
