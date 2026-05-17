import { getIssueDetail } from "../linear-client.mjs";

import { SYSTEMIC_FAILURE_THRESHOLD } from "./systemic-failure-threshold.mjs";
import { analyzeComments } from "./analyze-comments.mjs";

function getRecommendation(isSystemic, commentCount, threshold) {
  if (isSystemic) return "FLAG_FOR_HUMAN_REVIEW";
  if (commentCount > threshold * 2) return "ARCHIVE_AND_CONSOLIDATE";
  return "ARCHIVE_ONLY";
}

export async function analyzeIssue(issue, threshold) {
  const detail = await getIssueDetail(issue.id);

  if (!detail || !detail.comments) {
    return null;
  }

  const commentCount = detail.comments.nodes.length;

  if (commentCount < threshold) {
    return null;
  }

  const analysis = analyzeComments(detail.comments.nodes);

  // Only intervene if there are actual failure comments
  if (analysis.failureCount === 0) {
    return null;
  }

  const isSystemic = analysis.uniqueFailures.size >= SYSTEMIC_FAILURE_THRESHOLD;

  return {
    issue,
    detail,
    commentCount,
    analysis,
    isSystemic,
    recommendation: getRecommendation(isSystemic, commentCount, threshold),
  };
}
