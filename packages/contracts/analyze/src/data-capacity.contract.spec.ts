import { describe, it, expect } from "vitest";
import type { DataCapacity } from "./data-capacity.contract";

describe("contracts/analyze/data-capacity", () => {
  describe("DataCapacity", () => {
    it("accepts valid data capacity with no overflow", () => {
      const capacity: DataCapacity = {
        used: 50,
        total: 100,
        percentage: 50,
        overflow: false,
      };
      expect(capacity.used).toBe(50);
      expect(capacity.total).toBe(100);
      expect(capacity.percentage).toBe(50);
      expect(capacity.overflow).toBe(false);
    });

    it("accepts data capacity at 100% utilization", () => {
      const capacity: DataCapacity = {
        used: 100,
        total: 100,
        percentage: 100,
        overflow: false,
      };
      expect(capacity.percentage).toBe(100);
      expect(capacity.overflow).toBe(false);
    });

    it("accepts data capacity with overflow", () => {
      const capacity: DataCapacity = {
        used: 150,
        total: 100,
        percentage: 150,
        overflow: true,
      };
      expect(capacity.overflow).toBe(true);
    });

    it("accepts empty capacity (0% used)", () => {
      const capacity: DataCapacity = {
        used: 0,
        total: 100,
        percentage: 0,
        overflow: false,
      };
      expect(capacity.percentage).toBe(0);
    });

    it("accepts large capacity values", () => {
      const capacity: DataCapacity = {
        used: 2953,
        total: 2953,
        percentage: 100,
        overflow: false,
      };
      expect(capacity.used).toBe(capacity.total);
    });
  });
});
