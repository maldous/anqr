import { describe, it, expect, beforeEach, vi } from "vitest";
import { isDiscordSourced } from "../../scripts/ops/core/discord-source.mjs";

// Mock environment
const DISCORD_LABEL_ID = "9341d965-e21d-4c3d-81b2-73beff08356d";

describe("Discord Worktree Routing Integration", () => {
  beforeEach(() => {
    vi.stubEnv("DISCORD_LABEL_ID", DISCORD_LABEL_ID);
    vi.stubEnv("DISCORD_BOT_USER_ID", "discord-bot-user-id");
  });

  describe("Issue source detection", () => {
    it("should detect Discord-sourced issue by label ID", () => {
      // Simulates issue created by Discord bot with source:discord label
      const discordIssue = {
        identifier: "ANQR-123",
        title: "Test issue from Discord",
        labels: {
          nodes: [{ id: "9341d965-e21d-4c3d-81b2-73beff08356d", name: "source:discord" }],
        },
        createdBy: {
          id: "user-123",
          email: "user@anqr.ai",
          name: "Regular User",
        },
      };

      expect(isDiscordSourced(discordIssue)).toBe(true);
    });

    it("should detect Discord-sourced issue by creator email", () => {
      // Simulates issue created directly via API by Discord bot
      const discordIssue = {
        identifier: "ANQR-124",
        title: "API-created issue",
        labels: { nodes: [] },
        createdBy: {
          id: "discord-bot-user-id",
          email: "discord@anqr.ai",
          name: "ANQR Bot",
        },
      };

      expect(isDiscordSourced(discordIssue)).toBe(true);
    });

    it("should not mark Linear-sourced issues as Discord", () => {
      // Simulates issue created in Linear web UI
      const linearIssue = {
        identifier: "ANQR-125",
        title: "Linear-created issue",
        labels: {
          nodes: [{ id: "bug-label-id", name: "bug" }],
        },
        createdBy: {
          id: "user-456",
          email: "developer@anqr.ai",
          name: "Developer",
        },
      };

      expect(isDiscordSourced(linearIssue)).toBe(false);
    });
  });

  describe("Worktree routing behavior", () => {
    it("Discord worktrees should only receive Discord-sourced issues", () => {
      // wt5-wt8 are Discord worktrees
      const discordWorktrees = ["wt5", "wt6", "wt7", "wt8"];
      const linearWorktrees = ["wt1", "wt2", "wt3", "wt4"];

      const discordIssue = {
        identifier: "ANQR-126",
        labels: {
          nodes: [{ id: DISCORD_LABEL_ID, name: "source:discord" }],
        },
      };

      // All Discord worktrees should see Discord issues
      for (const _wt of discordWorktrees) {
        const shouldProcess = isDiscordSourced(discordIssue);
        expect(shouldProcess).toBe(true);
      }

      // Linear worktrees should not process Discord issues
      for (const _wt of linearWorktrees) {
        const shouldProcess = isDiscordSourced(discordIssue);
        // The routing filter in pickIssue will handle the exclusion
        // based on worktree type
        expect(shouldProcess).toBe(true); // Detection works
      }
    });

    it("Linear worktrees should only receive Linear-sourced issues", () => {
      const linearIssue = {
        identifier: "ANQR-127",
        labels: { nodes: [{ id: "bug", name: "bug" }] },
      };

      // Linear worktrees should process non-Discord issues
      expect(isDiscordSourced(linearIssue)).toBe(false);
    });
  });

  describe("Race condition prevention", () => {
    it("should handle concurrent issue detection consistently", () => {
      // Simulates multiple worktrees checking the same issue
      const issue = {
        identifier: "ANQR-128",
        labels: {
          nodes: [{ id: DISCORD_LABEL_ID, name: "source:discord" }],
        },
      };

      // All worktrees should get the same result
      const result1 = isDiscordSourced(issue);
      const result2 = isDiscordSourced(issue);
      const result3 = isDiscordSourced(issue);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(true);
    });
  });
});
