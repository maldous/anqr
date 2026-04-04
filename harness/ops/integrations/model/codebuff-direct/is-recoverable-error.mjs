import { isPaymentRequiredError } from "./is-payment-required-error.mjs";
import { isRateLimitError } from "./is-rate-limit-error.mjs";

export function isRecoverableError(errStr) {
  return isRateLimitError(errStr) || isPaymentRequiredError(errStr);
}
