import { describe, expect, it } from "vitest";
import { serializeWifi } from "./serialize-wifi";
import type { PayloadData } from "./payload-data";

function payload(over: Partial<PayloadData["wifi"]> = {}): PayloadData {
  return {
    wifi: { ssid: "", auth: "WPA2", hidden: false, ...over },
  } as PayloadData;
}

describe("serializeWifi", () => {
  it("emits a minimal WIFI: string for open networks (no password)", () => {
    expect(serializeWifi(payload({ ssid: "Guest", auth: "nopass" }))).toBe(
      "WIFI:T:nopass;S:Guest;;",
    );
  });

  it("includes password when set", () => {
    expect(
      serializeWifi(payload({ ssid: "Home", auth: "WPA2", password: "abc123" })),
    ).toBe("WIFI:T:WPA2;S:Home;P:abc123;;");
  });

  it("adds H:true; marker when hidden flag is set", () => {
    expect(
      serializeWifi(payload({ ssid: "Stealth", auth: "WPA2", password: "x", hidden: true })),
    ).toBe("WIFI:T:WPA2;S:Stealth;P:x;H:true;;");
  });

  it("preserves auth type in the T: field", () => {
    expect(serializeWifi(payload({ ssid: "n", auth: "WEP" }))).toContain("T:WEP;");
    expect(serializeWifi(payload({ ssid: "n", auth: "WPA3" }))).toContain("T:WPA3;");
  });

  it("always closes with a double-semicolon terminator", () => {
    // The format requires the second ; to mark end-of-record.
    expect(serializeWifi(payload({ ssid: "x" }))).toMatch(/;;$/);
    expect(serializeWifi(payload({ ssid: "x", password: "y", hidden: true }))).toMatch(/;;$/);
  });
});
