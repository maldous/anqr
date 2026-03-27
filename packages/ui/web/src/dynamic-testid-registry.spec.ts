import { describe, it, expect, beforeEach } from "vitest";
import { getRegistry } from "./dynamic-testid-registry";

describe("getRegistry", () => {
  beforeEach(() => {
    // Clear the global registry between tests
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  it("should create a new registry if none exists", () => {
    const registry = getRegistry();
    expect(registry).toBeDefined();
    expect(registry.usedBySource).toBeInstanceOf(Map);
    expect(registry.countsByBase).toBeInstanceOf(Map);
  });

  it("should return the same registry on subsequent calls", () => {
    const registry1 = getRegistry();
    const registry2 = getRegistry();
    expect(registry1).toBe(registry2);
  });

  it("should initialize with empty maps", () => {
    const registry = getRegistry();
    expect(registry.usedBySource.size).toBe(0);
    expect(registry.countsByBase.size).toBe(0);
  });

  it("should persist data across calls", () => {
    const registry1 = getRegistry();
    registry1.usedBySource.set("key1", "value1");
    registry1.countsByBase.set("base1", 5);

    const registry2 = getRegistry();
    expect(registry2.usedBySource.get("key1")).toBe("value1");
    expect(registry2.countsByBase.get("base1")).toBe(5);
  });
});
