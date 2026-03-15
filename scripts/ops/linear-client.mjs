#!/usr/bin/env node

/**
 * linear-client.mjs — Linear API helper library
 *
 * Provides reusable functions for Linear GraphQL operations.
 * Reads LINEAR_API_KEY from environment.
 *
 * Exports:
 *   query(graphql, variables)       — raw GraphQL query
 *   createIssue(input)              — create issue with defaults
 *   updateIssue(id, input)          — update issue fields
 *   findOpenIssuesByTitle(fragment) — duplicate search
 *   listIssuesByState(stateNames)   — list issues by workflow state
 *   addComment(issueId, body)       — add comment to issue
 *   applyLabels(issueId, labelIds)  — set labels on issue
 *   getQueueDepth()                 — count open automatable issues
 */

const LINEAR_API = 'https://api.linear.app/graphql';
const REQUEST_TIMEOUT_MS = 10_000;

export const TEAM_ID = '01534c1e-4041-474d-a81e-24f917f33912';

export const STATES = {
  backlog: 'd9eeea8d-825b-4aa3-8429-75223a6b3624',
  todo: 'ad8eea3e-7f5b-48dc-89c0-14506781a8c9',
  inProgress: '55a7c230-419f-4f42-95f7-84cf923a261d',
  inReview: '5e9dd779-e3dd-4743-a9c2-c588e67dd43e',
  done: '348275d1-b2a6-481d-81e0-cf2465cbfefd',
  canceled: 'eb842399-5ae1-4fd2-a73e-e53801cfba56',
  duplicate: '90e9d950-769a-482f-a2f1-132636c3b8c2',
};

export const LABELS = {
  reliability: 'e0a66df5-7c67-4dec-80b0-ea33af32ab7c',
  bug: '0c2caa97-5497-461e-bb44-2ee29739e76d',
  improvement: '2ca35cc0-44ed-4a14-8a52-c1aa4f323bd6',
  feature: '1d94d3f7-af46-418d-ae9a-ae18c030ef58',
  perf: 'c66398c6-fdbc-41df-a40a-e08918dd060b',
  security: 'bf36611e-cf41-49a5-8446-e3124efde052',
  web: '41b1744c-64f2-4599-97aa-7a78647d3d89',
  api: '8c529975-a322-441d-a78d-3458cd457794',
  ios: '438e112f-87be-4449-82ff-3a12427624c8',
  android: '4d7623df-7103-4da3-ba90-ba3fa06c9747',
};

const OPEN_STATE_NAMES = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Pending', 'Rework'];

function getApiKey() {
  const key = process.env.LINEAR_API_KEY;
  if (!key) {
    throw new Error('LINEAR_API_KEY environment variable is not set');
  }
  return key;
}

export async function query(graphql, variables) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getApiKey(),
    },
    body: JSON.stringify({ query: graphql, variables }),
    signal: controller.signal,
  });
  clearTimeout(timer);
  const data = await res.json();
  if (data.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

export async function createIssue(input) {
  const result = await query(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title state { name } labels { nodes { name } } }
      }
    }`,
    { input: { teamId: TEAM_ID, ...input } },
  );
  if (!result.issueCreate.success) {
    throw new Error('Failed to create issue');
  }
  return result.issueCreate.issue;
}

export async function updateIssue(issueId, input) {
  const result = await query(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier title state { name } labels { nodes { name } } }
      }
    }`,
    { id: issueId, input },
  );
  if (!result.issueUpdate.success) {
    throw new Error(`Failed to update issue ${issueId}`);
  }
  return result.issueUpdate.issue;
}

export async function findOpenIssuesByTitle(fragment) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 20) {
        nodes {
          id identifier title
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
        title: { contains: fragment },
      },
    },
  );
  return result.issues.nodes;
}

export async function listIssuesByState(stateNames) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 50) {
        nodes {
          id identifier title priority
          state { name }
          labels { nodes { id name } }
          createdAt updatedAt
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        state: { name: { in: stateNames } },
      },
    },
  );
  return result.issues.nodes;
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
  if (!result.commentCreate.success) {
    throw new Error(`Failed to add comment to ${issueId}`);
  }
  return result.commentCreate.comment;
}

export async function applyLabels(issueId, labelIds) {
  return updateIssue(issueId, { labelIds });
}

export async function getQueueDepth() {
  const activeStates = ['Todo', 'In Progress'];
  const issues = await listIssuesByState(activeStates);
  const automatable = issues.filter((i) => !i.title.includes('[HUMAN]'));
  return { total: issues.length, automatable: automatable.length, issues: automatable };
}

export async function getIssueDetail(identifier) {
  const result = await query(
    `query($filter: IssueFilter!) {
      issues(filter: $filter, first: 1) {
        nodes {
          id identifier title description priority
          state { name }
          labels { nodes { id name } }
          comments { nodes { id body createdAt } }
          createdAt updatedAt
        }
      }
    }`,
    {
      filter: {
        team: { id: { eq: TEAM_ID } },
        identifier: { eq: identifier },
      },
    },
  );
  const nodes = result.issues.nodes;
  return nodes.length > 0 ? nodes[0] : null;
}

