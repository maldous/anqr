import { createDurableSet } from "../../../lib/durable-kv.mjs";

export const recentDeliveries = createDurableSet("linear-recent-deliveries");
