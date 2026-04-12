import { createDurableMap } from "../../../lib/durable-kv.mjs";

export const sessionThreadNames = createDurableMap("discord-session-routes");
