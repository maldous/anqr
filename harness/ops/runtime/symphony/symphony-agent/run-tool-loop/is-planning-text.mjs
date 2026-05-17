const PLANNING_ACTION_RE = /\blet me (understand|read|check|analyze|review)\b/i;
const PLANNING_INTENT_RE = /\bI('ll| will) (start by|need to|first)\b/i;
const PLANNING_HERE_RE = /\bhere('s| is) my plan\b/i;
const PLANNING_SECTION_RE = /\b(steps|approach|thinking|analyzing|reviewing):\b/i;

export function isPlanningText(text) {
  return PLANNING_ACTION_RE.test(text) || PLANNING_INTENT_RE.test(text) || PLANNING_HERE_RE.test(text) || PLANNING_SECTION_RE.test(text);
}
