/**
 * Helper to spawn bridge servers on dynamic ports for testing
 * Prevents "address already in use" errors when running tests
 */

export { spawnSymphonyBridge } from "./spawn-symphony-bridge";
/** @deprecated Standalone Codebuff bridge retired per ADR-0003. Use spawnSymphonyBridge. */
export { spawnCodebuffBridge } from "./spawn-codebuff-bridge";
