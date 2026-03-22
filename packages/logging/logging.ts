import { Logger } from "./logger";
import { Redactor } from "./redactor";

export class StructuredLogger {
  private logger: Logger;
  private redactor: Redactor;

  constructor(logger: Logger, redactor: Redactor) {
    this.logger = logger;
    this.redactor = redactor;
  }

  public log(message: string): void {
    const redactedMessage = this.redactor.redact(message);
    this.logger.log(redactedMessage);
  }
}
