import { createDurableSet } from "../../../lib/durable-kv.mjs";

export const recentDeliveries = createDurableSet("linear-recent-deliveries", 60 * 60 * 1000);
