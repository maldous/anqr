/**
 * Stuck detection heuristics for Symphony agent.
 *
 * Determines if a turn without tool calls is considered legitimate work,
 * preventing false positive stuck detection.
 *
 * Legitimate non-tool turns include:
 * - Streaming responses from Symphony/Codebuff bridges
 * - Planning/thinking phrases (e.g., "Let me understand", "I'll start by")
 * - Subgoal management activity
 * - Continuation signals (response.needsContinuation)
 * - Reading/context gathering statements
 *
 * @param {string|null|undefined} content - The message content
 * @param {object} provider - The provider object (has .name)
 * @param {object} response - The LLM response object (may have .needsContinuation)
 * @returns {boolean} true if the turn is legitimate despite lacking tool calls
 */
export function isLegitimateNonToolTurn(content, provider, response) {
  const str = content || "";

  return (
    response?.needsContinuation === true ||
    (provider?.name === "symphony-bridge" && str.length > 0) ||
    /\b(let me (understand|read|check|analyze|review)|I('ll| will) (start by|need to|first)|here('s| is) my plan|steps?:|approach:|thinking:|analyzing:|reviewing:)/i.test(
      str,
    ) ||
    /\bsubgoal/i.test(str) ||
    /\b(reading|examining|looking at|checking) (the |files?|code)/i.test(str)
  );
}
