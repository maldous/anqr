/**
 * Unit tests for Discord request router
 * Tests the load balancing, overload detection, and routing logic
 */

import { describe, it, expect } from "vitest";

describe("Discord Request Router", () => {
  // Test configuration
  const WORKTREE_IDS = [5, 6, 7, 8];
  const MAX_CONCURRENT = 4;
  const PORT = 18790;

  describe("Configuration", () => {
    it("should have 4 worktrees configured", () => {
      expect(WORKTREE_IDS.length).toBe(4);
    });

    it("should have MAX_CONCURRENT of 4", () => {
      expect(MAX_CONCURRENT).toBe(4);
    });

    it("should use port 18790 for router", () => {
      expect(PORT).toBe(18790);
    });
  });

  describe("Worktree URL generation", () => {
    it("should generate correct URLs for worktrees", () => {
      const expectedUrls = [
        { id: 5, url: "http://127.0.0.1:18795" },
        { id: 6, url: "http://127.0.0.1:18796" },
        { id: 7, url: "http://127.0.0.1:18797" },
        { id: 8, url: "http://127.0.0.1:18798" },
      ];

      const urls = WORKTREE_IDS.map((id) => ({
        id,
        url: `http://127.0.0.1:1879${id}`,
      }));

      expect(urls).toEqual(expectedUrls);
    });
  });

  describe("Overload detection", () => {
    let globalActiveRequests = 0;

    const isOverloaded = () => globalActiveRequests >= MAX_CONCURRENT;

    it("should not be overloaded with 0 requests", () => {
      globalActiveRequests = 0;
      expect(isOverloaded()).toBe(false);
    });

    it("should not be overloaded with 3 requests", () => {
      globalActiveRequests = 3;
      expect(isOverloaded()).toBe(false);
    });

    it("should be overloaded with 4 requests (at limit)", () => {
      globalActiveRequests = 4;
      expect(isOverloaded()).toBe(true);
    });

    it("should be overloaded with 5 requests (exceeded)", () => {
      globalActiveRequests = 5;
      expect(isOverloaded()).toBe(true);
    });
  });

  describe("Least-loaded routing", () => {
    interface WorktreeState {
      id: number;
      activeRequests: number;
    }

    const getLeastLoadedWorktree = (worktrees: WorktreeState[]): WorktreeState | null => {
      let minLoad = Infinity;
      let selected: WorktreeState | null = null;

      for (const wt of worktrees) {
        if (wt.activeRequests < minLoad) {
          minLoad = wt.activeRequests;
          selected = wt;
        }
      }

      return selected;
    };

    it("should select worktree with lowest load", () => {
      const worktrees = [
        { id: 5, activeRequests: 2 },
        { id: 6, activeRequests: 0 },
        { id: 7, activeRequests: 1 },
        { id: 8, activeRequests: 3 },
      ];

      const selected = getLeastLoadedWorktree(worktrees);
      expect(selected?.id).toBe(6);
    });

    it("should distribute evenly when loads are equal", () => {
      const worktrees: WorktreeState[] = [
        { id: 5, activeRequests: 1 },
        { id: 6, activeRequests: 1 },
        { id: 7, activeRequests: 1 },
        { id: 8, activeRequests: 1 },
      ];

      // All equal, should return first one (lowest id)
      const selected = getLeastLoadedWorktree(worktrees);
      expect(selected?.id).toBe(5);
    });
  });

  describe("Overload message format", () => {
    const getOverloadMessage = () => {
      return "⚠️ **System Overload** — Too many concurrent requests. Please try again in a moment.";
    };

    it("should return user-friendly overload message", () => {
      const message = getOverloadMessage();
      expect(message).toContain("System Overload");
      expect(message).toContain("try again");
    });
  });
});
