// In-memory set: avoids re-planning across dispatch cycles in the same process.
// On restart, issues get re-planned — that's acceptable (idempotent).
export const plannedThisSession = new Set();
