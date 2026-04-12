import { createDurableQueue } from "../../../lib/durable-kv.mjs";

export const linearQueue = createDurableQueue("symphony-linear-queue");
