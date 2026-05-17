import { createLogger } from "./logger.mjs";
import { stripNulls } from "./structured-log/strip-nulls.mjs";

export function createStructuredLogger(service, defaultFields = {}) {
  const logger = createLogger(service);

  function withFields(fields) {
    return {
      correlationId: fields.correlationId || defaultFields.correlationId || null,
      service: fields.service || defaultFields.service || service,
      worktreeId: fields.worktreeId || defaultFields.worktreeId || null,
      issueIdentifier: fields.issueIdentifier || defaultFields.issueIdentifier || null,
      requestIdentifier: fields.requestIdentifier || defaultFields.requestIdentifier || null,
      providerName: fields.providerName || defaultFields.providerName || null,
      route: fields.route || defaultFields.route || null,
      attempt: fields.attempt ?? defaultFields.attempt ?? null,
      stateTransition: fields.stateTransition || defaultFields.stateTransition || null,
    };
  }

  return {
    debug(msg, fields = {}) {
      logger.logDebug(msg, stripNulls(withFields(fields)));
    },
    info(msg, fields = {}) {
      logger.logInfo(msg, stripNulls(withFields(fields)));
    },
    warn(msg, fields = {}) {
      logger.logWarn(msg, stripNulls(withFields(fields)));
    },
    error(msg, fields = {}) {
      logger.logError(msg, stripNulls(withFields(fields)));
    },
    child(extraFields) {
      return createStructuredLogger(service, { ...defaultFields, ...extraFields });
    },
  };
}
