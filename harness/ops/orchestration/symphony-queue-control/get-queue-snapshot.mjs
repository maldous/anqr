// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:53

import { listIssuesByState } from "../../linear-client.mjs";
import { QUEUE_STATES } from "../../symphony-config.mjs";
import {
  canExecuteIssue,
  canFeedIssue,
  getIssueState,
  leaseIsActive,
} from "../../symphony-state.mjs";

export async function getQueueSnapshot() {
  const [backlog, todo, inProgress] = await Promise.all([
    listIssuesByState(QUEUE_STATES.feedSource),
    listIssuesByState(QUEUE_STATES.readyStates),
    listIssuesByState(QUEUE_STATES.activeStates),
  ]);

  const backlogAuto = backlog.filter((issue) => canFeedIssue(issue));
  const todoAuto = todo.filter((issue) => canExecuteIssue(issue));
  const inProgressAuto = inProgress.filter(
    (issue) => canExecuteIssue(issue) || leaseIsActive(getIssueState(issue.identifier)),
  );

  return {
    backlog: { all: backlog, automatable: backlogAuto },
    todo: { all: todo, automatable: todoAuto },
    inProgress: { all: inProgress, automatable: inProgressAuto },
    readyDepth: todoAuto.length,
    activeDepth: inProgressAuto.length,
    queueDepth: todoAuto.length + inProgressAuto.length,
  };
}
