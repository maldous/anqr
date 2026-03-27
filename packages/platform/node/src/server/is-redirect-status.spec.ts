import { describe, it, expect } from "vitest";
import { isRedirectStatus } from "./is-redirect-status";

describe("isRedirectStatus", () => {
  it("should return true for 301 Moved Permanently", () => {
    expect(isRedirectStatus(301)).toBe(true);
  });

  it("should return true for 302 Found", () => {
    expect(isRedirectStatus(302)).toBe(true);
  });

  it("should return true for 303 See Other", () => {
    expect(isRedirectStatus(303)).toBe(true);
  });

  it("should return true for 307 Temporary Redirect", () => {
    expect(isRedirectStatus(307)).toBe(true);
  });

  it("should return true for 308 Permanent Redirect", () => {
    expect(isRedirectStatus(308)).toBe(true);
  });

  it("should return false for 200 OK", () => {
    expect(isRedirectStatus(200)).toBe(false);
  });

  it("should return false for 404 Not Found", () => {
    expect(isRedirectStatus(404)).toBe(false);
  });

  it("should return false for 500 Internal Server Error", () => {
    expect(isRedirectStatus(500)).toBe(false);
  });

  it("should return false for 304 Not Modified", () => {
    expect(isRedirectStatus(304)).toBe(false);
  });

  it("should return false for 0", () => {
    expect(isRedirectStatus(0)).toBe(false);
  });
});
