/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { hasToolIntent } = await import("./has-tool-intent.mjs");

describe("hasToolIntent", () => {
  it("should detect code operations", () => {
    expect(hasToolIntent("read the file")).toBe(true);
    expect(hasToolIntent("edit the config")).toBe(true);
    expect(hasToolIntent("search for x")).toBe(true);
    expect(hasToolIntent("fix this bug")).toBe(true);
  });

  it("should detect execution commands", () => {
    expect(hasToolIntent("run the tests")).toBe(true);
    expect(hasToolIntent("build the project")).toBe(true);
    expect(hasToolIntent("compile the code")).toBe(true);
  });

  it("should detect git/file references", () => {
    expect(hasToolIntent("commit this change")).toBe(true);
    expect(hasToolIntent("check the file")).toBe(true);
    expect(hasToolIntent("list the directory")).toBe(true);
  });

  it("should detect debug/infra references", () => {
    expect(hasToolIntent("check the logs")).toBe(true);
    expect(hasToolIntent("look at this issue")).toBe(true);
    expect(hasToolIntent("check the linear ticket")).toBe(true);
  });

  it("should detect tool symbols and file paths", () => {
    expect(hasToolIntent("check `config.json`")).toBe(true);
    expect(hasToolIntent("run $command")).toBe(true);
    expect(hasToolIntent("update package.json")).toBe(true);
    expect(hasToolIntent("edit src/index.ts")).toBe(true);
  });

  it("should return false for simple chat", () => {
    expect(hasToolIntent("hello")).toBe(false);
    expect(hasToolIntent("thanks")).toBe(false);
    expect(hasToolIntent("who are you")).toBe(false);
  });
});
