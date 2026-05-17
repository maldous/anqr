// Re-export from core/ to keep orchestration callers working.
// New code should import directly from core/symphony-runner-exit-codes.mjs.
export { EXIT_LOCK_CONTENTION } from "../../core/symphony-runner-exit-codes.mjs";
