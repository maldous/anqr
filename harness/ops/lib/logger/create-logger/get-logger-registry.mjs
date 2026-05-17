const LOGGER_REGISTRY_KEY = Symbol.for("anqr.logger.registry");

export function getLoggerRegistry() {
  if (!globalThis[LOGGER_REGISTRY_KEY]) {
    globalThis[LOGGER_REGISTRY_KEY] = new Set();
  }
  return globalThis[LOGGER_REGISTRY_KEY];
}
