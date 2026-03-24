import { describe, it, expect } from "vitest";
import { MemoCache } from "./memo-cache";

describe("domain/qr/cache/MemoCache", () => {
  describe("construction", () => {
    it("creates a cache with default max size", () => {
      const cache = new MemoCache<string>();
      expect(cache.get("any")).toBeUndefined();
    });

    it("creates a cache with custom max size", () => {
      const cache = new MemoCache<number>(5);
      expect(cache.get("any")).toBeUndefined();
    });
  });

  describe("get / set", () => {
    it("returns undefined for missing key", () => {
      const cache = new MemoCache<string>();
      expect(cache.get("missing")).toBeUndefined();
    });

    it("stores and retrieves a value", () => {
      const cache = new MemoCache<string>();
      cache.set("key", "value");
      expect(cache.get("key")).toBe("value");
    });

    it("stores multiple key-value pairs", () => {
      const cache = new MemoCache<number>();
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      expect(cache.get("a")).toBe(1);
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
    });

    it("handles various value types", () => {
      const cache = new MemoCache<unknown>();
      cache.set("num", 42);
      cache.set("str", "hello");
      cache.set("arr", [1, 2, 3]);
      cache.set("obj", { a: 1 });
      cache.set("nil", null);
      expect(cache.get("num")).toBe(42);
      expect(cache.get("str")).toBe("hello");
      expect(cache.get("arr")).toEqual([1, 2, 3]);
      expect(cache.get("obj")).toEqual({ a: 1 });
      expect(cache.get("nil")).toBeNull();
    });
  });

  describe("update", () => {
    it("overwrites existing value", () => {
      const cache = new MemoCache<string>();
      cache.set("key", "old");
      cache.set("key", "new");
      expect(cache.get("key")).toBe("new");
    });

    it("updating does not increase size", () => {
      const cache = new MemoCache<string>(2);
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("a", "updated");
      cache.set("c", "3");
      expect(cache.get("a")).toBe("updated");
      expect(cache.get("c")).toBe("3");
    });
  });

  describe("LRU eviction", () => {
    it("evicts oldest entry when full", () => {
      const cache = new MemoCache<number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("d", 4);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
      expect(cache.get("d")).toBe(4);
    });

    it("evicts multiple entries as capacity is exceeded", () => {
      const cache = new MemoCache<number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("d", 4);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe(3);
      expect(cache.get("d")).toBe(4);
    });

    it("evicts with maxSize of 1", () => {
      const cache = new MemoCache<string>(1);
      cache.set("a", "first");
      expect(cache.get("a")).toBe("first");
      cache.set("b", "second");
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe("second");
    });
  });

  describe("LRU promotion on get", () => {
    it("get promotes entry to most-recently-used", () => {
      const cache = new MemoCache<number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.get("a");
      cache.set("d", 4);
      expect(cache.get("a")).toBe(1);
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe(3);
      expect(cache.get("d")).toBe(4);
    });

    it("get does not promote missing keys", () => {
      const cache = new MemoCache<number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.get("nonexistent");
      cache.set("c", 3);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
    });
  });

  describe("LRU promotion on set (update)", () => {
    it("updating an existing key promotes it", () => {
      const cache = new MemoCache<number>(3);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.set("a", 10);
      cache.set("d", 4);
      expect(cache.get("a")).toBe(10);
      expect(cache.get("b")).toBeUndefined();
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      const cache = new MemoCache<number>();
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);
      cache.clear();
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBeUndefined();
    });

    it("allows setting new entries after clear", () => {
      const cache = new MemoCache<string>(2);
      cache.set("a", "1");
      cache.set("b", "2");
      cache.clear();
      cache.set("c", "3");
      cache.set("d", "4");
      expect(cache.get("c")).toBe("3");
      expect(cache.get("d")).toBe("4");
    });

    it("does not throw when clearing empty cache", () => {
      const cache = new MemoCache<number>();
      expect(() => cache.clear()).not.toThrow();
    });
  });
});
