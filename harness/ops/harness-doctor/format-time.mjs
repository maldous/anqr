/**
 * Format minutes-since-midnight as HH:MM.
 * @param {number} m
 * @returns {string}
 */
export function formatTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
