import { describe, it, expect, beforeEach } from "vitest";
import { FakeQueueState } from "./fake-queue-state";

describe("FakeQueueState", () => {
  let queue: FakeQueueState;

  beforeEach(() => {
    queue = new FakeQueueState();
  });

  describe("enqueue", () => {
    it("should add item to queue", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      expect(queue.getItems()).toHaveLength(1);
      expect(queue.getItems()[0]).toMatchObject({
        id: "item1",
        priority: 1,
        status: "pending",
      });
    });

    it("should sort items by priority (highest first)", () => {
      queue.enqueue({ id: "low", priority: 1 });
      queue.enqueue({ id: "high", priority: 3 });
      queue.enqueue({ id: "medium", priority: 2 });
      const items = queue.getItems();
      expect(items[0].id).toBe("high");
      expect(items[1].id).toBe("medium");
      expect(items[2].id).toBe("low");
    });

    it("should maintain order for equal priorities", () => {
      queue.enqueue({ id: "first", priority: 1 });
      queue.enqueue({ id: "second", priority: 1 });
      const items = queue.getItems();
      expect(items[0].id).toBe("first");
      expect(items[1].id).toBe("second");
    });
  });

  describe("dequeue", () => {
    it("should remove and return first item", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.enqueue({ id: "item2", priority: 2 });
      const item = queue.dequeue();
      expect(item?.id).toBe("item2"); // higher priority
      expect(queue.getItems()).toHaveLength(1);
    });

    it("should return undefined for empty queue", () => {
      expect(queue.dequeue()).toBeUndefined();
    });

    it("should process items in priority order", () => {
      queue.enqueue({ id: "low", priority: 1 });
      queue.enqueue({ id: "high", priority: 3 });
      queue.enqueue({ id: "medium", priority: 2 });
      expect(queue.dequeue()?.id).toBe("high");
      expect(queue.dequeue()?.id).toBe("medium");
      expect(queue.dequeue()?.id).toBe("low");
      expect(queue.dequeue()).toBeUndefined();
    });
  });

  describe("getItems", () => {
    it("should return copy of items", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      const items = queue.getItems();
      items.push({ id: "fake", priority: 99, status: "pending" });
      expect(queue.getItems()).toHaveLength(1);
    });

    it("should return empty array for empty queue", () => {
      expect(queue.getItems()).toEqual([]);
    });
  });

  describe("getPendingCount", () => {
    it("should count pending items only", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.enqueue({ id: "item2", priority: 1 });
      queue.complete("item1");
      expect(queue.getPendingCount()).toBe(1);
    });

    it("should return 0 for empty queue", () => {
      expect(queue.getPendingCount()).toBe(0);
    });
  });

  describe("complete", () => {
    it("should mark item as completed", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.complete("item1");
      const item = queue.getItems().find((i) => i.id === "item1");
      expect(item?.status).toBe("completed");
    });

    it("should not affect other items", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.enqueue({ id: "item2", priority: 1 });
      queue.complete("item1");
      const item2 = queue.getItems().find((i) => i.id === "item2");
      expect(item2?.status).toBe("pending");
    });

    it("should handle non-existent item gracefully", () => {
      queue.complete("unknown");
      expect(queue.getItems()).toHaveLength(0);
    });
  });

  describe("fail", () => {
    it("should mark item as failed", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.fail("item1");
      const item = queue.getItems().find((i) => i.id === "item1");
      expect(item?.status).toBe("failed");
    });

    it("should not affect pending count", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.enqueue({ id: "item2", priority: 1 });
      queue.fail("item1");
      expect(queue.getPendingCount()).toBe(1);
    });

    it("should handle non-existent item gracefully", () => {
      queue.fail("unknown");
      expect(queue.getItems()).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should remove all items", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.enqueue({ id: "item2", priority: 2 });
      queue.clear();
      expect(queue.getItems()).toHaveLength(0);
      expect(queue.getPendingCount()).toBe(0);
    });

    it("should allow enqueue after clear", () => {
      queue.enqueue({ id: "item1", priority: 1 });
      queue.clear();
      queue.enqueue({ id: "item2", priority: 1 });
      expect(queue.getItems()).toHaveLength(1);
    });
  });
});
