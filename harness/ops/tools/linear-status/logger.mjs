const PREFIX = "[linear-status]";

export const logInfo = (msg) => console.log(`${PREFIX} ${msg}`);
export const logWarn = (msg) => console.warn(`${PREFIX} ${msg}`);
export const logError = (msg) => console.error(`${PREFIX} ${msg}`);
