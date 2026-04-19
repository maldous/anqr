/**
 * Unit tests for Linear client write operations.
 *
 * Validates createIssue, updateIssue, and addComment by mocking
 * the underlying GraphQL query function, so no LINEAR_API_KEY is needed.
 *
 * Run: npx vitest run tests/unit/linear-client-writes.spec.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the query module before importing the functions that depend on it
const queryMock = vi.fn();

vi.mock("../../harness/ops/integrations/linear/linear-client/query.mjs", () => ({
  query: queryMock,
}));

vi.mock("../../harness/ops/integrations/linear/linear-client/team-id.mjs", () => ({
  TEAM_ID: "test-team-123",
}));

describe("Linear client write operations", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  // ── createIssue ──────────────────────────────────────────────────────

  describe("createIssue", () => {
    it("creates an issue with title and description", async () => {
      const mockIssue = {
        id: "issue-1",
        identifier: "ANQ-99",
        title: "Test issue",
        description: "Test description",
        priority: 1,
        estimate: 0,
        state: { name: "Backlog" },
        labels: { nodes: [] },
      };

      queryMock.mockResolvedValue({
        issueCreate: { success: true, issue: mockIssue },
      });

      const { createIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/create-issue.mjs"
      );

      const result = await createIssue({
        title: "Test issue",
        description: "Test description",
      });

      expect(result).toEqual(mockIssue);
      expect(queryMock).toHaveBeenCalledOnce();

      // Verify the GraphQL mutation includes teamId
      const [graphql, variables] = queryMock.mock.calls[0];
      expect(graphql).toContain("issueCreate");
      expect(variables.input.teamId).toBe("test-team-123");
      expect(variables.input.title).toBe("Test issue");
      expect(variables.input.description).toBe("Test description");
    });

    it("creates an issue with priority and labels", async () => {
      const mockIssue = {
        id: "issue-2",
        identifier: "ANQ-100",
        title: "High priority issue",
        description: "Urgent",
        priority: 3,
        estimate: 8,
        state: { name: "Todo" },
        labels: { nodes: [{ name: "bug" }] },
      };

      queryMock.mockResolvedValue({
        issueCreate: { success: true, issue: mockIssue },
      });

      const { createIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/create-issue.mjs"
      );

      const result = await createIssue({
        title: "High priority issue",
        description: "Urgent",
        priority: 3,
        estimate: 8,
        labelIds: ["label-bug"],
      });

      expect(result.priority).toBe(3);
      expect(result.estimate).toBe(8);
      expect(result.labels.nodes[0].name).toBe("bug");
    });

    it("throws on GraphQL failure", async () => {
      queryMock.mockResolvedValue({
        issueCreate: { success: false, issue: null },
      });

      const { createIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/create-issue.mjs"
      );

      await expect(
        createIssue({ title: "Failing issue", description: "Will fail" }),
      ).rejects.toThrow("Failed to create issue");
    });

    it("propagates network errors from query", async () => {
      queryMock.mockRejectedValue(new Error("Network timeout"));

      const { createIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/create-issue.mjs"
      );

      await expect(
        createIssue({ title: "Network issue", description: "Timeout" }),
      ).rejects.toThrow("Network timeout");
    });
  });

  // ── updateIssue ──────────────────────────────────────────────────────

  describe("updateIssue", () => {
    it("updates issue title and description", async () => {
      const updatedIssue = {
        id: "issue-1",
        identifier: "ANQ-99",
        title: "Updated title",
        description: "Updated description",
        priority: 2,
        estimate: 5,
        state: { name: "In Progress" },
        labels: { nodes: [{ id: "l1", name: "feature" }] },
      };

      queryMock.mockResolvedValue({
        issueUpdate: { success: true, issue: updatedIssue },
      });

      const { updateIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/update-issue.mjs"
      );

      const result = await updateIssue("issue-1", {
        title: "Updated title",
        description: "Updated description",
      });

      expect(result.title).toBe("Updated title");
      expect(result.state.name).toBe("In Progress");
      expect(queryMock).toHaveBeenCalledOnce();

      // Verify the GraphQL mutation
      const [graphql, variables] = queryMock.mock.calls[0];
      expect(graphql).toContain("issueUpdate");
      expect(variables.id).toBe("issue-1");
      expect(variables.input.title).toBe("Updated title");
    });

    it("updates issue state (transition)", async () => {
      const updatedIssue = {
        id: "issue-1",
        identifier: "ANQ-99",
        title: "Same title",
        description: "Same desc",
        priority: 1,
        estimate: 0,
        state: { name: "Done" },
        labels: { nodes: [] },
      };

      queryMock.mockResolvedValue({
        issueUpdate: { success: true, issue: updatedIssue },
      });

      const { updateIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/update-issue.mjs"
      );

      const result = await updateIssue("issue-1", {
        stateId: "state-done",
      });

      expect(result.state.name).toBe("Done");
    });

    it("throws on GraphQL failure", async () => {
      queryMock.mockResolvedValue({
        issueUpdate: { success: false, issue: null },
      });

      const { updateIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/update-issue.mjs"
      );

      await expect(
        updateIssue("issue-1", { title: "Fail" }),
      ).rejects.toThrow("Failed to update issue issue-1");
    });

    it("propagates API errors with issue context", async () => {
      queryMock.mockRejectedValue(
        new Error('Linear API error: [{"message":"Issue not found"}]'),
      );

      const { updateIssue } = await import(
        "../../harness/ops/integrations/linear/linear-client/update-issue.mjs"
      );

      await expect(
        updateIssue("nonexistent-id", { title: "Fail" }),
      ).rejects.toThrow("Issue not found");
    });
  });

  // ── addComment ────────────────────────────────────────────────────────

  describe("addComment", () => {
    it("adds a comment to an issue", async () => {
      const mockComment = {
        id: "comment-1",
        createdAt: "2025-01-15T10:00:00Z",
      };

      queryMock.mockResolvedValue({
        commentCreate: { success: true, comment: mockComment },
      });

      const { addComment } = await import(
        "../../harness/ops/integrations/linear/linear-client/add-comment.mjs"
      );

      const result = await addComment("issue-1", "This is a test comment");

      expect(result.id).toBe("comment-1");
      expect(result.createdAt).toBeTruthy();
      expect(queryMock).toHaveBeenCalledOnce();

      // Verify the GraphQL mutation
      const [graphql, variables] = queryMock.mock.calls[0];
      expect(graphql).toContain("commentCreate");
      expect(variables.issueId).toBe("issue-1");
      expect(variables.body).toBe("This is a test comment");
    });

    it("adds a multi-line markdown comment", async () => {
      const mockComment = {
        id: "comment-2",
        createdAt: "2025-01-15T11:00:00Z",
      };

      queryMock.mockResolvedValue({
        commentCreate: { success: true, comment: mockComment },
      });

      const { addComment } = await import(
        "../../harness/ops/integrations/linear/linear-client/add-comment.mjs"
      );

      const markdownBody =
        "## Analysis\n\n- Root cause: provider timeout\n- Fix: increase timeout\n\n```js\nsetTimeout(60000)\n```";

      const result = await addComment("issue-1", markdownBody);

      expect(result.id).toBe("comment-2");

      const [, variables] = queryMock.mock.calls[0];
      expect(variables.body).toContain("## Analysis");
      expect(variables.body).toContain("provider timeout");
    });

    it("throws on GraphQL failure", async () => {
      queryMock.mockResolvedValue({
        commentCreate: { success: false, comment: null },
      });

      const { addComment } = await import(
        "../../harness/ops/integrations/linear/linear-client/add-comment.mjs"
      );

      await expect(
        addComment("issue-1", "Failing comment"),
      ).rejects.toThrow("Failed to add comment to issue-1");
    });

    it("propagates network errors from query", async () => {
      queryMock.mockRejectedValue(new Error("ECONNREFUSED"));

      const { addComment } = await import(
        "../../harness/ops/integrations/linear/linear-client/add-comment.mjs"
      );

      await expect(
        addComment("issue-1", "Network error comment"),
      ).rejects.toThrow("ECONNREFUSED");
    });
  });
});
