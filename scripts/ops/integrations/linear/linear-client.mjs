#!/usr/bin/env node

/**
 * linear-client.mjs — Linear API helper library
 */

import { canExecuteIssue } from "../../symphony-state.mjs";

const LINEAR_API = "https://api.linear.app/graphql";
const REQUEST_TIMEOUT_MS = Number(process.env.LINEAR_REQUEST_TIMEOUT_MS || 20_000);

export const TEAM_ID = "01534c1e-4041-474d-a81e-24f917f33912";

export const STATES = {
  backlog: "d9eeea8d-825b-4aa3-8429-75223a6b3624",
  todo: "ad8eea3e-7f5b-48dc-89c0-14506781a8c9",
  inProgress: "55a7c230-419f-4f42-95f7-84cf923a261d",
  inReview: "5e9dd779-e3dd-4743-a9c2-c588e67dd43e",
  done: "348275d1-b2a6-481d-81e0-cf2465cbfefd",
  canceled: "eb842399-5ae1-4fd2-a73e-e53801cfba56",
};

export const LABELS = {
  // Work Type taxonomy (from docs/program/04-taxonomy.md)
  harness: "647b6fd0-4deb-4da2-85f7-becb8a1605c9",
  governance: "9802d98b-326b-42e0-865b-8049043123b8",
  hygiene: "3d7df5f8-0312-44b4-ac7a-862b15fbf5da",
  product: "8a20cdc8-9272-4fa0-871e-790170a6aaca",
  release: "e8879dd8-2263-4ff2-a5fe-aac78af318d6",
  growth: "b63cf9fb-73c1-4285-b414-26655f1feccf",
  incident: "c4a5d8e2-5f91-4e84-b3d4-8a7bc3de12f5",
  research: "9e2f1a3b-4c6d-4e85-a1b8-9c7de2f4a1b6",
  // Legacy check-failure labels (for guardian use)
  bug: "0c2caa97-5497-461e-bb44-2ee29739e76d",
  reliability: "e0a66df5-7c67-4dec-80b0-ea33af32ab7c",
};

const OPEN_STATE_NAMES = ["Backlog", "Todo", "In Progress", "In Review", "Blocked", "Human Review"];

function getApiKey() {
  const key = process.env.LINEAR_API_KEY;
  if (!key) throw new Error("LINEAR_API_KEY environment variable is not set");
  return key;
}

export async function query(graphql, variables) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(LINEAR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getApiKey(),
      },
      body: JSON.stringify({ query: graphql, variables }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (data.errors) throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
    return data.data;
  } finally {
    clearTimeout(timer);
  }
}

export async function createIssue(input) {
  const result = await query(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title description state { name } labels { nodes { name } } }
      }
    }`,
    { input: { teamId: TEAM_ID, ...input } },
  );
  if (!result.issueCreate.success) throw new Error("Failed to create issue");
  return result.issueCreate.issue;
}

export async function updateIssue(issueId, input) {
  const result = await query(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title description priority state { name } labels { nodes { id name } } }
      }
    }`,
    { id: issueId, input },
  );
  if (!result.issueUpdate.success) throw new Error(`Failed to update issue ${issueId}`);
  return result.issueUpdate.issue;
}

async function findOpenIssues(filterExtras) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 100) {
        nodes {
          id identifier title description priority
          state { name }
          labels { nodes { id name } }
          createdAt updatedAt
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: OPEN_STATE_NAMES } },
        ...filterExtras,
      },
    },
  );
  return result.issues.nodes;
}

export async function findOpenIssuesByTitle(fragment) {
  return findOpenIssues({ title: { contains: fragment } });
}

export async function findOpenIssuesByDescriptionFragment(fragment) {
  return findOpenIssues({ description: { contains: fragment } });
}

export async function listIssuesByState(stateNames) {
  const allNodes = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const result = await query(
      `query($filter: IssueFilter!, $after: String) {
        issues(filter: $filter, first: 50, after: $after) {
          nodes {
            id identifier title description priority
            state { name }
            labels { nodes { id name } }
            createdAt updatedAt
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {
        filter: {
          team: { id: { eq: TEAM_ID } },
          state: { name: { in: stateNames } },
        },
        after: cursor,
      },
    );
    allNodes.push(...result.issues.nodes);
    hasMore = result.issues.pageInfo.hasNextPage;
    cursor = result.issues.pageInfo.endCursor;
  }

  return allNodes;
}

export async function addComment(issueId, body) {
  const result = await query(
    `mutation($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) {
        success
        comment { id createdAt }
      }
    }`,
    { issueId, body },
  );
  if (!result.commentCreate.success) throw new Error(`Failed to add comment to ${issueId}`);
  return result.commentCreate.comment;
}

export async function updateComment(commentId, body) {
  const result = await query(
    `mutation($id: String!, $input: CommentUpdateInput!) {
      commentUpdate(id: $id, input: $input) {
        success
        comment { id body }
      }
    }`,
    { id: commentId, input: { body } },
  );
  if (!result.commentUpdate.success) throw new Error(`Failed to update comment ${commentId}`);
  return result.commentUpdate.comment;
}

export async function applyLabels(issueId, labelIds) {
  return updateIssue(issueId, { labelIds });
}

export async function getQueueDepth() {
  const activeStates = ["Todo", "In Progress"];
  const issues = await listIssuesByState(activeStates);
  const automatable = issues.filter((i) => canExecuteIssue(i));
  return { total: issues.length, automatable: automatable.length, issues: automatable };
}

export async function getIssueDetail(identifier) {
  const result = await query(
    `query($id: String!) {
      issue(id: $id) {
        id identifier title description priority
        state { name }
        labels { nodes { id name } }
        comments { nodes { id body createdAt } }
        createdAt updatedAt
      }
    }`,
    { id: identifier },
  );
  return result.issue || null;
}
