import { writeFile } from 'node:fs/promises';

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
if (!LINEAR_API_KEY) {
  console.error('LINEAR_API_KEY not set');
  process.exit(1);
}

const ENDPOINT = 'https://api.linear.app/graphql';
const OUTPUT_FILE = 'linear-full-export.json';

async function queryGraphQL(query, variables = {}) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: LINEAR_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText}\n${text}`);
  }

  const json = await response.json();

  if (json.errors?.length) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message || 'Unknown GraphQL error');
  }

  return json.data;
}

function getAtPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

async function paginateConnection({
  label,
  query,
  variables = {},
  connectionPath,
  pageSize = 100,
  maxPages = 10000,
}) {
  const results = [];
  let after = null;
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    page += 1;

    if (page > maxPages) {
      throw new Error(`Max pages exceeded while fetching ${label}`);
    }

    const data = await queryGraphQL(query, {
      ...variables,
      first: pageSize,
      after,
    });

    const connection = getAtPath(data, connectionPath);
    if (!connection) {
      throw new Error(`Connection not found at path: ${connectionPath}`);
    }

    const nodes = connection.nodes || [];
    const pageInfo = connection.pageInfo || {};

    results.push(...nodes);
    hasNextPage = Boolean(pageInfo.hasNextPage);
    after = pageInfo.endCursor ?? null;

    console.log(`[${label}] page ${page}: +${nodes.length}, total ${results.length}`);
  }

  return results;
}

const ISSUES_QUERY = `
  query($first: Int!, $after: String, $includeArchived: Boolean!) {
    issues(first: $first, after: $after, includeArchived: $includeArchived) {
      nodes {
        id
        number
        identifier
        title
        description
        priority
        estimate
        sortOrder
        priorityLabel
        branchName
        customerTicketCount
        url
        createdAt
        updatedAt
        completedAt
        canceledAt
        startedAt
        archivedAt
        dueDate
        slaStartedAt
        slaMediumRiskAt
        slaHighRiskAt
        slaBreachesAt
        trashed
        autoArchivedAt

        state {
          id
          name
          type
          color
        }

        labels {
          nodes {
            id
            name
            color
            description
          }
        }

        parent {
          id
          number
          identifier
          title
        }

        project {
          id
          name
          description
          state
          progress
          startDate
          targetDate
          lead {
            id
            name
            email
          }
        }

        projectMilestone {
          id
          name
          sortOrder
        }

        cycle {
          id
          number
          name
          startsAt
          endsAt
        }

        team {
          id
          key
          name
          description
        }

        assignee {
          id
          name
          email
          displayName
          active
        }

        creator {
          id
          name
          email
          displayName
          active
        }

        snoozedBy {
          id
          name
          email
        }

        previousIdentifiers
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const COMMENTS_QUERY = `
  query($first: Int!, $after: String, $includeArchived: Boolean!) {
    comments(first: $first, after: $after, includeArchived: $includeArchived) {
      nodes {
        id
        body
        createdAt
        updatedAt
        archivedAt
        url

        user {
          id
          name
          email
          displayName
          active
        }

        issue {
          id
          number
          identifier
          title
        }

        parent {
          id
        }

        children {
          nodes {
            id
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const TEAMS_QUERY = `
  query($first: Int!, $after: String, $includeArchived: Boolean!) {
    teams(first: $first, after: $after, includeArchived: $includeArchived) {
      nodes {
        id
        key
        name
        description
        color
        icon
        private
        createdAt
        updatedAt
        cyclesEnabled
        issueEstimationType
        issueEstimationAllowZero
        issueEstimationExtended
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const PROJECTS_QUERY = `
  query($first: Int!, $after: String, $includeArchived: Boolean!) {
    projects(first: $first, after: $after, includeArchived: $includeArchived) {
      nodes {
        id
        name
        description
        slugId
        url
        state
        progress
        color
        icon
        startDate
        targetDate
        createdAt
        updatedAt
        completedAt
        canceledAt
        archivedAt

        lead {
          id
          name
          email
          displayName
          active
        }

        teams {
          nodes {
            id
            key
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function main() {
  console.log('Starting Linear full export...');

  const [issues, comments, teams, projects] = await Promise.all([
    paginateConnection({
      label: 'issues',
      query: ISSUES_QUERY,
      variables: { includeArchived: true },
      connectionPath: 'issues',
      pageSize: 100,
    }),
    paginateConnection({
      label: 'comments',
      query: COMMENTS_QUERY,
      variables: { includeArchived: true },
      connectionPath: 'comments',
      pageSize: 100,
    }),
    paginateConnection({
      label: 'teams',
      query: TEAMS_QUERY,
      variables: { includeArchived: true },
      connectionPath: 'teams',
      pageSize: 100,
    }),
    paginateConnection({
      label: 'projects',
      query: PROJECTS_QUERY,
      variables: { includeArchived: true },
      connectionPath: 'projects',
      pageSize: 100,
    }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    source: 'Linear GraphQL API',
    includeArchived: true,
    counts: {
      issues: issues.length,
      comments: comments.length,
      teams: teams.length,
      projects: projects.length,
    },
    issues,
    comments,
    teams,
    projects,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(exportData, null, 2), 'utf8');

  console.log('Done.');
  console.log(`Issues:   ${issues.length}`);
  console.log(`Comments: ${comments.length}`);
  console.log(`Teams:    ${teams.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Written:  ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Export failed:', error);
  process.exit(1);
});
