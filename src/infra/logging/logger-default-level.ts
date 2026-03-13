const envLevelRaw =
  typeof process === 'undefined' ? undefined : process.env.ANQR_LOG_LEVEL?.toLowerCase();

export const envLevel = (() => {
  switch (envLevelRaw) {
    case 'trace':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
    case 'silent':
      return envLevelRaw;
    default:
      return undefined;
  }
})();

const isDev =
  import.meta?.env?.DEV === undefined
    ? typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
    : import.meta.env.DEV;

export const defaultLevel = envLevel ?? (isDev ? 'debug' : 'error');
