import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { formatTime } from "./format-time.mjs";

/** Minimum gap between calendar-based timer schedules (minutes). */
const MIN_TIMER_GAP_MINUTES = 15;

/**
 * Parse OnCalendar daily schedules from .timer files and detect dangerous overlaps.
 *
 * Only handles the common `*-*-* HH:MM:SS` format — complex calendar specs are
 * skipped (they require full systemd calendar parsing which is out of scope).
 *
 * @param {string} servicesDir
 * @returns {string[]} issues found
 */
export function validateTimerSchedules(servicesDir) {
  const issues = [];
  const timerFiles = readdirSync(servicesDir).filter((f) => f.endsWith(".timer"));
  const schedules = [];

  for (const timer of timerFiles) {
    const content = readFileSync(join(servicesDir, timer), "utf-8");
    const match = content.match(/OnCalendar=\*-\*-\*\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      schedules.push({
        timer,
        minutes: parseInt(match[1], 10) * 60 + parseInt(match[2], 10),
      });
    }
  }

  schedules.sort((a, b) => a.minutes - b.minutes);

  for (let i = 0; i < schedules.length - 1; i++) {
    const gap = schedules[i + 1].minutes - schedules[i].minutes;
    if (gap < MIN_TIMER_GAP_MINUTES) {
      issues.push(
        `Timer overlap risk: ${schedules[i].timer} (${formatTime(schedules[i].minutes)}) and ` +
          `${schedules[i + 1].timer} (${formatTime(schedules[i + 1].minutes)}) are ${gap}min apart ` +
          `(minimum ${MIN_TIMER_GAP_MINUTES}min)`,
      );
    }
  }

  return issues;
}
