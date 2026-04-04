import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock(
  "../../harness/ops/integrations/notifications/openclaw-discord/send-via-open-claw.mjs",
  () => ({
    sendViaOpenClaw: vi.fn(async () => ({ sent: true })),
  }),
);

import { sendDiscordEmbed } from "../../harness/ops/integrations/notifications/openclaw-discord/send-discord-embed.mjs";
import { sendViaOpenClaw } from "../../harness/ops/integrations/notifications/openclaw-discord/send-via-open-claw.mjs";

describe("sendDiscordEmbed color handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prepends 🟢 for green (0x00ff00)", async () => {
    await sendDiscordEmbed({ title: "Test", color: 0x00ff00 });
    const content = vi.mocked(sendViaOpenClaw).mock.calls[0]![0] as string;
    expect(content).toMatch(/^🟢 \*\*Test\*\*/);
  });

  it("prepends 🔴 for red (0xff0000)", async () => {
    await sendDiscordEmbed({ title: "Abandoned", color: 0xff0000 });
    const content = vi.mocked(sendViaOpenClaw).mock.calls[0]![0] as string;
    expect(content).toMatch(/^🔴 \*\*Abandoned\*\*/);
  });

  it("prepends 🟠 for orange (0xffa500)", async () => {
    await sendDiscordEmbed({ title: "In Review", color: 0xffa500 });
    const content = vi.mocked(sendViaOpenClaw).mock.calls[0]![0] as string;
    expect(content).toMatch(/^🟠 \*\*In Review\*\*/);
  });

  it("no emoji prefix when color is not provided", async () => {
    await sendDiscordEmbed({ title: "Plain" });
    const content = vi.mocked(sendViaOpenClaw).mock.calls[0]![0] as string;
    expect(content).toBe("**Plain**");
  });

  it("no emoji prefix for unrecognized color", async () => {
    await sendDiscordEmbed({ title: "Other", color: 0x123456 });
    const content = vi.mocked(sendViaOpenClaw).mock.calls[0]![0] as string;
    expect(content).toMatch(/^\*\*Other\*\*/);
  });
});
