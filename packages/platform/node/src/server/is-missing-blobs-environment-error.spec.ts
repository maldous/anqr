import { describe, it, expect } from "vitest";
import { isMissingBlobsEnvironmentError } from "./is-missing-blobs-environment-error";

describe("isMissingBlobsEnvironmentError", () => {
  it("should return true when error name is MissingBlobsEnvironmentError", () => {
    const error = { name: "MissingBlobsEnvironmentError", message: "Test error" };
    expect(isMissingBlobsEnvironmentError(error)).toBe(true);
  });

  it("should return true when error message contains expected text", () => {
    const error = {
      message: "The environment has not been configured to use Netlify Blobs",
    };
    expect(isMissingBlobsEnvironmentError(error)).toBe(true);
  });

  it("should return false when error is null", () => {
    expect(isMissingBlobsEnvironmentError(null)).toBe(false);
  });

  it("should return false when error is undefined", () => {
    expect(isMissingBlobsEnvironmentError(undefined)).toBe(false);
  });

  it("should return false when error is not an object", () => {
    expect(isMissingBlobsEnvironmentError("string error")).toBe(false);
  });

  it("should return false when error is a number", () => {
    expect(isMissingBlobsEnvironmentError(123)).toBe(false);
  });

  it("should return false when error has different name and message", () => {
    const error = { name: "OtherError", message: "Different error" };
    expect(isMissingBlobsEnvironmentError(error)).toBe(false);
  });

  it("should return false when error is an empty object", () => {
    expect(isMissingBlobsEnvironmentError({})).toBe(false);
  });

  it("should return true when message contains the text anywhere in string", () => {
    const error = {
      message:
        "Error: The environment has not been configured to use Netlify Blobs. Please check your setup.",
    };
    expect(isMissingBlobsEnvironmentError(error)).toBe(true);
  });
});
