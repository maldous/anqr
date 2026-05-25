import { describe, expect, it } from "vitest";
import { serializeSms } from "./serialize-sms";
import type { PayloadData } from "./payload-data";

function payload(over: Partial<PayloadData["sms"]> = {}): PayloadData {
  return { sms: { number: "", ...over } } as PayloadData;
}

describe("serializeSms", () => {
  it("returns sms:<number> when only number is set", () => {
    expect(serializeSms(payload({ number: "+1234567890" }))).toBe("sms:+1234567890");
  });

  it("appends body as a URL-encoded query parameter", () => {
    expect(serializeSms(payload({ number: "+1", body: "hello world" }))).toBe(
      "sms:+1?body=hello%20world",
    );
  });

  it("URL-encodes special characters in body", () => {
    expect(serializeSms(payload({ number: "555", body: "100% off!" }))).toBe(
      "sms:555?body=100%25%20off!",
    );
  });

  it("emits sms: prefix with empty number", () => {
    expect(serializeSms(payload())).toBe("sms:");
  });
});
