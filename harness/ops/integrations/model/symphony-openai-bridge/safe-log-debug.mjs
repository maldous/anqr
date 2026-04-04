export const safeLogDebug = typeof logDebug === "function" ? logDebug : () => {};
