import { describe, it, expect } from "vitest";
import { sanitizeTextForSpeech } from "./sanitize-text-for-speech.mjs";

describe("sanitizeTextForSpeech", () => {
  it("strips hash symbols that TTS would read as 'hashtag'", () => {
    expect(sanitizeTextForSpeech("Fix issue #123 in the parser")).toBe("Fix issue 123 in the parser");
    expect(sanitizeTextForSpeech("## double hash")).toBe("double hash");
    expect(sanitizeTextForSpeech("### triple hash heading")).toBe("triple hash heading");
  });

  it("strips dollar signs", () => {
    expect(sanitizeTextForSpeech("Fix $500 billing issue")).toBe("Fix 500 billing issue");
    expect(sanitizeTextForSpeech("$amount is wrong")).toBe("amount is wrong");
  });

  it("strips percent signs", () => {
    expect(sanitizeTextForSpeech("100% test coverage")).toBe("100 test coverage");
  });

  it("strips caret symbols", () => {
    expect(sanitizeTextForSpeech("x^2 in the formula")).toBe("x2 in the formula");
  });

  it("strips ampersands", () => {
    expect(sanitizeTextForSpeech("this & that are related")).toBe("this that are related");
  });

  it("strips at symbols", () => {
    expect(sanitizeTextForSpeech("Asked @john for review")).toBe("Asked john for review");
  });

  it("strips asterisks", () => {
    expect(sanitizeTextForSpeech("this *is* important")).toBe("this is important");
    expect(sanitizeTextForSpeech("nobody cares*")).toBe("nobody cares");
  });

  it("strips standalone plus signs", () => {
    expect(sanitizeTextForSpeech("1 + 1 = 2")).toBe("1 1 2");
  });

  it("strips standalone equals signs", () => {
    expect(sanitizeTextForSpeech("status = done")).toBe("status done");
    // The step 8 rule already handles === and !==
    expect(sanitizeTextForSpeech("a === b")).toBe("a equals b");
  });

  it("strips exclamation marks", () => {
    expect(sanitizeTextForSpeech("Critical! Fix now!")).toBe("Critical Fix now");
  });

  it("strips question marks", () => {
    expect(sanitizeTextForSpeech("Did this work? Check it?")).toBe("Did this work Check it");
  });

  it("strips combined special characters", () => {
    expect(sanitizeTextForSpeech("Fix #123 & ask @john: $500 total?")).toBe("Fix 123 ask john 500 total");
  });

  it("replaces fenced code blocks with brief note", () => {
    expect(sanitizeTextForSpeech("Use ```const x = 1``` in the code")).toBe("Use (code omitted) in the code");
  });

  it("strips HTML tags", () => {
    expect(sanitizeTextForSpeech("Click <button>Save</button> now")).toBe("Click Save now");
  });

  it("replaces markdown links with link text", () => {
    expect(sanitizeTextForSpeech("See [the docs](https://example.com) for more")).toBe("See the docs for more");
  });

  it("replaces URLs with 'a link'", () => {
    expect(sanitizeTextForSpeech("Visit https://example.com/foo for details")).toBe("Visit a link for details");
  });

  it("unwraps markdown bold and italic", () => {
    expect(sanitizeTextForSpeech("**bold** and *italic* are **both** done")).toBe("bold and italic are both done");
  });

  it("preserves normal text unchanged", () => {
    expect(sanitizeTextForSpeech("This is a normal sentence.")).toBe("This is a normal sentence.");
    expect(sanitizeTextForSpeech("Hello world, how are you?")).toBe("Hello world, how are you");
  });

  it("handles empty input", () => {
    expect(sanitizeTextForSpeech("")).toBe("");
    expect(sanitizeTextForSpeech("   ")).toBe("");
  });

  it("handles nullish input", () => {
    expect(sanitizeTextForSpeech(null as unknown as string)).toBe("");
    expect(sanitizeTextForSpeech(undefined as unknown as string)).toBe("");
  });

  it("truncates long text at sentence boundary", () => {
    const long = "This is a short sentence. " + "A".repeat(600);
    const result = sanitizeTextForSpeech(long);
    expect(result.length).toBeLessThan(600);
    expect(result.endsWith(".")).toBe(true);
  });
});
