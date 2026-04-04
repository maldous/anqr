import { FAILURE_PATTERNS } from "./failure-patterns.mjs";

export function analyzeComments(comments) {
  const patterns = {
    failureCount: 0,
    staleCount: 0,
    uniqueFailures: new Set(),
    firstComment: null,
    lastComment: null,
    timestamps: [],
  };

  if (!comments || comments.length === 0) return patterns;

  patterns.firstComment = comments[0];
  patterns.lastComment = comments[comments.length - 1];

  for (const comment of comments) {
    patterns.timestamps.push(comment.createdAt);

    if (FAILURE_PATTERNS.stillFailing.test(comment.body)) {
      patterns.failureCount++;
      // Extract failure signature from code blocks
      const codeMatch = comment.body.match(/```\n([\s\S]*?)\n```/);
      if (codeMatch) {
        // Use first 100 chars as signature
        const signature = codeMatch[1].substring(0, 100).trim();
        patterns.uniqueFailures.add(signature);
      }
    }

    if (FAILURE_PATTERNS.stale.test(comment.body)) {
      patterns.staleCount++;
    }
  }

  return patterns;
}
