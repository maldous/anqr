import { isTruthy } from "./is-truthy.mjs";

export const INCLUDE_I18N = isTruthy(process.env.RAG_BUILD_INCLUDE_I18N);
