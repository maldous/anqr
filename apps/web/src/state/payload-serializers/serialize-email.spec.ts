// L1 step 2 — second spec. serializeEmail builds a mailto: URL with
// optional subject/body query params. Pure function, no external deps.
import { describe, expect, it } from "vitest";
import { serializeEmail } from "./serialize-email";
import type { PayloadData } from "./payload-data";

function payload(emailOver: Partial<PayloadData["email"]> = {}): PayloadData {
  return {
    email: { to: "", ...emailOver },
  } as PayloadData;
}

describe("serializeEmail", () => {
  it("returns a bare mailto: when only `to` is set", () => {
    expect(serializeEmail(payload({ to: "jane@example.com" }))).toBe("mailto:jane@example.com");
  });

  it("appends subject as a query parameter", () => {
    expect(
      serializeEmail(payload({ to: "jane@example.com", subject: "Hello world" })),
    ).toBe("mailto:jane@example.com?subject=Hello+world");
  });

  it("appends body as a query parameter", () => {
    expect(serializeEmail(payload({ to: "jane@example.com", body: "Hi there" }))).toBe(
      "mailto:jane@example.com?body=Hi+there",
    );
  });

  it("appends both subject and body when present", () => {
    const result = serializeEmail(
      payload({ to: "jane@example.com", subject: "Hello", body: "Body!" }),
    );
    expect(result).toContain("mailto:jane@example.com?");
    expect(result).toContain("subject=Hello");
    expect(result).toContain("body=Body%21");
  });

  it("URL-encodes special characters in subject/body", () => {
    expect(
      serializeEmail(payload({ to: "x@y.com", subject: "100% off!" })),
    ).toBe("mailto:x@y.com?subject=100%25+off%21");
  });

  it("emits an empty `to` mailto when address is missing", () => {
    expect(serializeEmail(payload())).toBe("mailto:");
  });
});
