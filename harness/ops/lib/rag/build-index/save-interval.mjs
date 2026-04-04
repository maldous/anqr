import { toPositiveInt } from "./to-positive-int.mjs";

export const SAVE_INTERVAL = toPositiveInt(process.env.RAG_BUILD_SAVE_INTERVAL, 25);
