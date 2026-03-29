// Must be the first import in bridge entry points.
// ESM evaluates imports in dependency order, so this runs before
// heavier modules (AI SDK, Zod, etc.) register signal listeners.
process.setMaxListeners(0);
