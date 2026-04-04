import { HIGH_PRIORITY_THRESHOLD } from "./high-priority-threshold.mjs";
import { MEDIUM_PRIORITY_THRESHOLD } from "./medium-priority-threshold.mjs";
import { calculateProviderScore } from "./calculate-provider-score.mjs";
import { loadStats } from "./load-stats.mjs";
import { saveStats } from "./save-stats.mjs";

export function recordLinearCompletion(providerName, { completed, priority = 4, estimate }) {
  const stats = loadStats();
  const p = typeof priority === "number" ? priority : 4; // Default to low priority
  // Auto-assign estimate based on priority if not provided (fallback for legacy issues)
  const est = typeof estimate === "number" && estimate > 0 ? estimate : Math.max(1, 5 - p); // Default: P0=5, P1=4, P2=3, P3=2, P4=1

  if (completed) {
    stats.linearCompleted[providerName] = (stats.linearCompleted[providerName] || 0) + 1;
  } else {
    stats.linearFailed[providerName] = (stats.linearFailed[providerName] || 0) + 1;
  }

  // Track by priority complexity
  if (p <= HIGH_PRIORITY_THRESHOLD) {
    stats.linearHighPriorityTotal[providerName] =
      (stats.linearHighPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearHighPrioritySuccess[providerName] =
        (stats.linearHighPrioritySuccess[providerName] || 0) + 1;
    }
  } else if (p <= MEDIUM_PRIORITY_THRESHOLD) {
    stats.linearMediumPriorityTotal[providerName] =
      (stats.linearMediumPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearMediumPrioritySuccess[providerName] =
        (stats.linearMediumPrioritySuccess[providerName] || 0) + 1;
    }
  } else {
    stats.linearLowPriorityTotal[providerName] =
      (stats.linearLowPriorityTotal[providerName] || 0) + 1;
    if (completed) {
      stats.linearLowPrioritySuccess[providerName] =
        (stats.linearLowPrioritySuccess[providerName] || 0) + 1;
    }
  }

  // Track estimate-based complexity
  if (est > 0) {
    stats.totalEstimatePoints[providerName] = (stats.totalEstimatePoints[providerName] || 0) + est;
    const totalAttempts = stats.linearCompleted[providerName] + stats.linearFailed[providerName];
    stats.avgEstimatePoints[providerName] =
      totalAttempts > 0 ? Math.round(stats.totalEstimatePoints[providerName] / totalAttempts) : 0;

    if (completed) {
      stats.completedEstimatePoints[providerName] =
        (stats.completedEstimatePoints[providerName] || 0) + est;
    }

    // Track by estimate size ranges
    if (est <= 2) {
      // Small: 1-2 points
      stats.smallIssuesTotal[providerName] = (stats.smallIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.smallIssuesCompleted[providerName] =
          (stats.smallIssuesCompleted[providerName] || 0) + 1;
      }
    } else if (est <= 5) {
      // Medium: 3-5 points
      stats.mediumIssuesTotal[providerName] = (stats.mediumIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.mediumIssuesCompleted[providerName] =
          (stats.mediumIssuesCompleted[providerName] || 0) + 1;
      }
    } else {
      // Large: 8+ points
      stats.largeIssuesTotal[providerName] = (stats.largeIssuesTotal[providerName] || 0) + 1;
      if (completed) {
        stats.largeIssuesCompleted[providerName] =
          (stats.largeIssuesCompleted[providerName] || 0) + 1;
      }
    }
  }

  // Recalculate score
  stats.score[providerName] = calculateProviderScore(providerName, stats);
  saveStats(stats);
}
