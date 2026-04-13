import { createDurableSet } from "../../../lib/durable-kv.mjs";
import { DEDUP_WINDOW_MS } from "./dedup-window-ms.mjs";

export const recentDeliveries = createDurableSet("linear-recent-deliveries", DEDUP_WINDOW_MS);
