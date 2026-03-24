import { describe, it, expect } from "vitest";
import type { OrderedMatrix } from "./ordered-matrix.contract";

describe("ordered-matrix.contract", () => {
  describe("OrderedMatrix type", () => {
    it("should accept all valid ordered matrix types", () => {
      const matrices: OrderedMatrix[] = [
        "bayer2",
        "bayer4",
        "bayer8",
        "clustered_dot",
        "void_cluster",
      ];
      expect(matrices).toHaveLength(5);
      expect(matrices).toContain("bayer2");
      expect(matrices).toContain("bayer4");
      expect(matrices).toContain("bayer8");
      expect(matrices).toContain("clustered_dot");
      expect(matrices).toContain("void_cluster");
    });

    it("should support Bayer matrix types", () => {
      const bayer2: OrderedMatrix = "bayer2";
      const bayer4: OrderedMatrix = "bayer4";
      const bayer8: OrderedMatrix = "bayer8";

      expect(bayer2).toBe("bayer2");
      expect(bayer4).toBe("bayer4");
      expect(bayer8).toBe("bayer8");
    });

    it("should support clustered and void cluster types", () => {
      const clustered: OrderedMatrix = "clustered_dot";
      const voidCluster: OrderedMatrix = "void_cluster";

      expect(clustered).toBe("clustered_dot");
      expect(voidCluster).toBe("void_cluster");
    });
  });
});
