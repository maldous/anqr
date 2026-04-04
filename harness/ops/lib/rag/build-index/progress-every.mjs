import { toPositiveInt } from "./to-positive-int.mjs";

export const PROGRESS_EVERY = toPositiveInt(process.env.RAG_BUILD_PROGRESS_EVERY, 200);
