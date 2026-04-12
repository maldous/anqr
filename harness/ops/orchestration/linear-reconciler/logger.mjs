const PREFIX = "[linear-reconciler]";

export const logInfo = (msg) => console.log(`${PREFIX} ${msg}`);
export const logWarn = (msg) => console.warn(`${PREFIX} ${msg}`);
export const logError = (msg) => console.error(`${PREFIX} ${msg}`);
export const logDebug = (msg) => {
  if (process.env.ANQR_DEBUG) console.log(`${PREFIX} [debug] ${msg}`);
};
