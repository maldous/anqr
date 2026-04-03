import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isDiscordSourced,
  markDiscordSource,
  detectAndMarkDiscordSource,
} from "../../scripts/ops/core/discord-source.mjs";

// Mock symphony-state
vi.mock("../../scripts/ops/core/symphony-state.mjs", () => ({
  getIssueState: vi.fn(),
  patchIssueState: vi.fn(),
}));

import { getIssueState, patchIssueState } from "../../scripts/ops/core/symphony-state.mjs";

describe("discord-source.mjs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DISCORD_LABEL_ID", "test-discord-label-id");
    vi.stubEnv("DISCORD_BOT_USER_ID", "test-discord-user-id");
  });

  describe("isDiscordSourced", () => {
    it("should return false when issueData is null", () => {
      expect(isDiscordSourced(null)).toBe(false);
    });

    it("should return false when issueData is undefined", () => {
      expect(isDiscordSourced(undefined)).toBe(false);
    });

    it("should return true when issue has Discord label by ID", () => {
      const issue = {
        labels: {
          nodes: [{ id: "test-discord-label-id", name: "source:discord" }],
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return true when issue has Discord label by name", () => {
      const issue = {
        labels: {
          nodes: [{ id: "some-other-id", name: "discord" }],
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return true when issue has Discord label (case insensitive)", () => {
      const issue = {
        labels: {
          nodes: [{ id: "some-id", name: "DISCORD" }],
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return true when creator email contains discord", () => {
      const issue = {
        labels: { nodes: [] },
        createdBy: {
          email: "discord-bot@anqr.ai",
          name: "ANQR Bot",
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return true when creator name contains discord", () => {
      const issue = {
        labels: { nodes: [] },
        createdBy: {
          email: "bot@anqr.ai",
          name: "Discord Bot",
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return true when creator ID matches DISCORD_BOT_USER_ID", () => {
      const issue = {
        labels: { nodes: [] },
        createdBy: {
          id: "test-discord-user-id",
          name: "Bot",
        },
      };
      expect(isDiscordSourced(issue)).toBe(true);
    });

    it("should return false when no Discord indicators present", () => {
      const issue = {
        labels: { nodes: [{ id: "bug-label", name: "bug" }] },
        createdBy: {
          email: "user@anqr.ai",
          name: "Regular User",
        },
      };
      expect(isDiscordSourced(issue)).toBe(false);
    });

    it("should return false when DISCORD_LABEL_ID not set", () => {
      vi.stubEnv("DISCORD_LABEL_ID", "");
      const issue = {
        labels: {
          nodes: [{ id: "some-label", name: "discord" }],
        },
      };
      expect(isDiscordSourced(issue)).toBe(false);
    });
  });

  describe("markDiscordSource", () => {
    it("should patch state with source=discord when not already set", () => {
      vi.mocked(getIssueState).mockReturnValue({} as ReturnType<typeof getIssueState>);
      markDiscordSource("ANQR-123");
      expect(patchIssueState).toHaveBeenCalledWith("ANQR-123", {
        source: "discord",
      });
    });

    it("should not patch state when source already is discord", () => {
      vi.mocked(getIssueState).mockReturnValue({ source: "discord" } as ReturnType<
        typeof getIssueState
      >);
      markDiscordSource("ANQR-123");
      expect(patchIssueState).not.toHaveBeenCalled();
    });
  });

  describe("detectAndMarkDiscordSource", () => {
    it("should return true and mark when issue is Discord-sourced", () => {
      vi.mocked(getIssueState).mockReturnValue({} as ReturnType<typeof getIssueState>); // Mock state without source
      const issue = {
        labels: {
          nodes: [{ id: "test-discord-label-id", name: "source:discord" }],
        },
      };
      expect(detectAndMarkDiscordSource(issue, "ANQR-123")).toBe(true);
      expect(patchIssueState).toHaveBeenCalledWith("ANQR-123", {
        source: "discord",
      });
    });

    it("should return false and not mark when issue is not Discord-sourced", () => {
      const issue = {
        labels: { nodes: [{ id: "bug-label", name: "bug" }] },
        createdBy: { email: "user@anqr.ai", name: "User" },
      };
      expect(detectAndMarkDiscordSource(issue, "ANQR-123")).toBe(false);
      expect(patchIssueState).not.toHaveBeenCalled();
    });
  });
});
