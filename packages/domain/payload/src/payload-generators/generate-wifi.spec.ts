import { describe, it, expect } from "vitest";
import { generateWifi } from "./generate-wifi.js";

describe("generateWifi", () => {
  it("should generate WEP WiFi payload with basic parameters", () => {
    const result = generateWifi({
      ssid: "MyNetwork",
      password: "mypassword",
      auth: "WEP",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WEP;S:MyNetwork;P:mypassword;;");
  });

  it("should generate WPA WiFi payload", () => {
    const result = generateWifi({
      ssid: "SecureNet",
      password: "secure123",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA;S:SecureNet;P:secure123;;");
  });

  it("should generate open WiFi payload without password", () => {
    const result = generateWifi({ ssid: "OpenNetwork", auth: "nopass", hidden: false });
    expect(result).toBe("WIFI:T:nopass;S:OpenNetwork;;");
  });

  it("should escape special characters in SSID", () => {
    const result = generateWifi({
      ssid: "Network:Name;Test",
      password: "pass",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toContain("\\:");
    expect(result).toContain("\\;");
  });

  it("should escape special characters in password", () => {
    const result = generateWifi({
      ssid: "Net",
      password: "pass:word;test",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toContain("\\:");
    expect(result).toContain("\\;");
  });

  it("should mark network as hidden when specified", () => {
    const result = generateWifi({
      ssid: "HiddenNet",
      password: "secret",
      auth: "WPA",
      hidden: true,
    });
    expect(result).toContain("H:true");
  });

  it("should not include hidden flag when false", () => {
    const result = generateWifi({
      ssid: "VisibleNet",
      password: "pass",
      auth: "WPA",
      hidden: false,
    });
    expect(result).not.toContain("H:");
  });

  it("should handle empty password for nopass auth", () => {
    const result = generateWifi({ ssid: "FreeWifi", auth: "nopass", hidden: false });
    expect(result).toBe("WIFI:T:nopass;S:FreeWifi;;");
  });

  it("should generate WPA2 payload", () => {
    const result = generateWifi({
      ssid: "WPA2Net",
      password: "password123",
      auth: "WPA2",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA2;S:WPA2Net;P:password123;;");
  });

  it("should handle SSID with quotes", () => {
    const result = generateWifi({
      ssid: 'Network"Name',
      password: "pass",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toContain('\\"');
  });

  it("should handle SSID with backslashes", () => {
    const result = generateWifi({
      ssid: "Network\\Name",
      password: "pass",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toContain("\\\\");
  });

  it("should handle password with backslashes", () => {
    const result = generateWifi({
      ssid: "Net",
      password: "pass\\word",
      auth: "WPA",
      hidden: false,
    });
    expect(result).toContain("\\\\");
  });

  it("should generate WPA3 payload", () => {
    const result = generateWifi({
      ssid: "WPA3Net",
      password: "pass123",
      auth: "WPA3",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA3;S:WPA3Net;P:pass123;;");
  });

  it("should support EAP identity", () => {
    const result = generateWifi({
      ssid: "EnterpriseNet",
      auth: "WPA",
      password: "pass",
      hidden: false,
      eapIdentity: "user@corp.com",
    });
    expect(result).toContain("I:user@corp.com");
  });

  it("should support EAP anonymous identity", () => {
    const result = generateWifi({
      ssid: "CorpNet",
      auth: "WPA2",
      password: "pass",
      hidden: false,
      eapAnonymous: "anon@corp.com",
    });
    expect(result).toContain("A:anon@corp.com");
  });

  it("should support EAP phase 2 authentication", () => {
    const result = generateWifi({
      ssid: "SecureNet",
      auth: "WPA",
      password: "pass",
      hidden: false,
      eapPhase2: "MSCHAPV2",
    });
    expect(result).toContain("PH2:MSCHAPV2");
  });

  it("should generate minimal WiFi payload", () => {
    const result = generateWifi({ ssid: "MinNet", auth: "nopass", hidden: false });
    expect(result).toBe("WIFI:T:nopass;S:MinNet;;");
  });

  it("should end with double semicolon", () => {
    const result = generateWifi({ ssid: "Net", password: "pass", auth: "WPA", hidden: false });
    expect(result).toMatch(/;;$/);
  });

  it("should omit password for nopass networks", () => {
    const result = generateWifi({
      ssid: "OpenWifi",
      auth: "nopass",
      password: "ignored",
      hidden: false,
    });
    expect(result).not.toContain("P:");
  });
});
