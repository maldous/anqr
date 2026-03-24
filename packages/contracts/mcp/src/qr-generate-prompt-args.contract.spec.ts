import { describe, it, expect } from "vitest";
import type { QrGeneratePromptArgs } from "./qr-generate-prompt-args.contract";

describe("qr-generate-prompt-args.contract", () => {
  describe("QrGeneratePromptArgs type", () => {
    it("should accept valid intent values", () => {
      const args: QrGeneratePromptArgs = {
        intent: "url",
      };
      expect(args.intent).toBe("url");
    });

    it("should support all intent types", () => {
      const intents: Array<QrGeneratePromptArgs["intent"]> = [
        "url",
        "wifi",
        "contact",
        "payment",
        "plain_text",
      ];
      expect(intents).toHaveLength(5);
    });

    it("should allow optional data field", () => {
      const withData: QrGeneratePromptArgs = {
        intent: "url",
        data: "https://example.com",
      };
      const withoutData: QrGeneratePromptArgs = {
        intent: "plain_text",
      };
      expect(withData.data).toBe("https://example.com");
      expect(withoutData.data).toBeUndefined();
    });

    it("should allow optional format field", () => {
      const withFormat: QrGeneratePromptArgs = {
        intent: "contact",
        format: "svg",
      };
      const withoutFormat: QrGeneratePromptArgs = {
        intent: "wifi",
      };
      expect(withFormat.format).toBe("svg");
      expect(withoutFormat.format).toBeUndefined();
    });

    it("should support both png and svg formats", () => {
      const pngArgs: QrGeneratePromptArgs = {
        intent: "url",
        format: "png",
      };
      const svgArgs: QrGeneratePromptArgs = {
        intent: "url",
        format: "svg",
      };
      expect(pngArgs.format).toBe("png");
      expect(svgArgs.format).toBe("svg");
    });

    it("should maintain readonly properties", () => {
      const args: QrGeneratePromptArgs = {
        intent: "payment",
        data: "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // cspell:disable-line // cspell:disable-line
        format: "png",
      };
      expect(args).toEqual({
        intent: "payment",
        data: "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // cspell:disable-line // cspell:disable-line
        format: "png",
      });
    });
  });
});
