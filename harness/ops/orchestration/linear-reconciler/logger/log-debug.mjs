import { PREFIX } from "./prefix.mjs";
export const logDebug = (msg) => {
  if (process.env.ANQR_DEBUG) console.log(`${PREFIX} [debug] ${msg}`);
};
