/**
 * Clear all QR generator caches
 * Useful for testing or memory management
 */
// Additional cache-clearing callbacks registered by other modules
// (avoids circular imports: render-loop → color → utils → cache → render-loop)
const _registeredCleanups: Array<() => void> = [];

export { _registeredCleanups };
