import { describe, expect, it } from "vitest";
import { serializeCrypto } from "./serialize-crypto";
import type { PayloadData } from "./payload-data";

function payload(over: Partial<PayloadData["crypto"]> = {}): PayloadData {
  return {
    crypto: { type: "bitcoin", address: "", ...over },
  } as PayloadData;
}

describe("serializeCrypto", () => {
  it("returns bare <type>:<address> when no optional fields set", () => {
    expect(
      serializeCrypto(payload({ type: "bitcoin", address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" })),
    ).toBe("bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
  });

  it("appends amount as a query parameter", () => {
    const result = serializeCrypto(
      payload({ type: "litecoin", address: "L1", amount: 0.5 }),
    );
    expect(result).toBe("litecoin:L1?amount=0.5");
  });

  it("appends label as a query parameter", () => {
    expect(
      serializeCrypto(payload({ type: "bitcoin", address: "1A", label: "Coffee" })),
    ).toBe("bitcoin:1A?label=Coffee");
  });

  it("combines amount and label", () => {
    const result = serializeCrypto(
      payload({ type: "bitcoin", address: "1A", amount: 0.01, label: "Tip" }),
    );
    expect(result).toContain("bitcoin:1A?");
    expect(result).toContain("amount=0.01");
    expect(result).toContain("label=Tip");
  });

  it("URL-encodes label spaces", () => {
    expect(
      serializeCrypto(payload({ type: "bitcoin", address: "1A", label: "BTC tip" })),
    ).toContain("label=BTC+tip");
  });

  it("preserves the crypto type literal (bitcoin/litecoin/etc.)", () => {
    expect(serializeCrypto(payload({ type: "litecoin", address: "L" }))).toMatch(/^litecoin:/);
    expect(serializeCrypto(payload({ type: "bitcoin", address: "B" }))).toMatch(/^bitcoin:/);
  });
});
