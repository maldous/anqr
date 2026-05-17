/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { isSimpleChat } = await import("./is-simple-chat.mjs");

describe("isSimpleChat", () => {
  it("should detect greetings", () => {
    expect(isSimpleChat("hello")).toBe(true);
    expect(isSimpleChat("Hi")).toBe(true);
    expect(isSimpleChat("hey there")).toBe(true);
  });

  it("should detect thanks", () => {
    expect(isSimpleChat("thanks")).toBe(true);
    expect(isSimpleChat("thank you")).toBe(true);
  });

  it("should detect questions about the assistant", () => {
    expect(isSimpleChat("who are you")).toBe(true);
    expect(isSimpleChat("what are you")).toBe(true);
    expect(isSimpleChat("what can you do")).toBe(true);
  });

  it("should detect acknowledgments", () => {
    expect(isSimpleChat("ok")).toBe(true);
    expect(isSimpleChat("okay")).toBe(true);
    expect(isSimpleChat("are you there")).toBe(true);
  });

  it("should detect test/ping", () => {
    expect(isSimpleChat("test")).toBe(true);
    expect(isSimpleChat("ping")).toBe(true);
  });

  it("should detect help", () => {
    expect(isSimpleChat("help")).toBe(true);
  });

  it("should return false for tool-oriented messages", () => {
    expect(isSimpleChat("read the file src/index.ts")).toBe(false);
    expect(isSimpleChat("run the tests")).toBe(false);
    expect(isSimpleChat("fix this bug in the parser")).toBe(false);
  });

  it("should return false for multi-sentence messages", () => {
    expect(isSimpleChat("do you know any good restaurants")).toBe(false);
  });
});
