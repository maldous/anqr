import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./select";

describe("Select", () => {
  // ── SelectTrigger ──────────────────────────────────────────────
  
  describe("SelectTrigger", () => {
    it("renders trigger element", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
    });

    it("applies default classes", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger?.className).toContain("rounded-md");
      expect(trigger?.className).toContain("border");
    });

    it("forwards className prop", () => {
      const { container } = render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger?.className).toContain("custom-trigger");
    });

    it("assigns dynamic testid", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger?.getAttribute("data-testid")).toBeTruthy();
    });

    it("uses title in testid when provided", () => {
      const { container } = render(
        <Select>
          <SelectTrigger title="Category Selector">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      const testid = trigger?.getAttribute("data-testid");
      expect(testid).toContain("category-selector");
    });

    it("uses aria-label in testid when provided", () => {
      const { container } = render(
        <Select>
          <SelectTrigger aria-label="Filter Options">
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      const testid = trigger?.getAttribute("data-testid");
      expect(testid).toContain("filter-options");
    });

    it("renders children", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
        </Select>
      );
      expect(container.textContent).toContain("Choose...");
    });

    it("renders chevron icon", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      const svg = trigger?.querySelector("svg");
      expect(svg).toBeTruthy();
    });
  });

  // ── SelectItem ─────────────────────────────────────────────────

  describe("SelectItem", () => {
    it("assigns dynamic testid", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const option = container.querySelector('[role="option"]');
      expect(option?.getAttribute("data-testid")).toBeTruthy();
    });

    it("uses value in testid", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      );
      const option = container.querySelector('[role="option"]');
      const testid = option?.getAttribute("data-testid");
      expect(testid).toContain("premium");
    });

    it("uses title in testid when provided", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" title="First Choice">
              First
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const option = container.querySelector('[role="option"]');
      const testid = option?.getAttribute("data-testid");
      expect(testid).toContain("first-choice");
    });

    it("renders children", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test Label</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(container.textContent).toContain("Test Label");
    });

    it("forwards className prop", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" className="custom-item">
              Item
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const option = container.querySelector('[role="option"]');
      expect(option?.className).toContain("custom-item");
    });
  });

  // ── SelectContent ──────────────────────────────────────────────

  describe("SelectContent", () => {
    it("forwards data-testid prop", () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="custom-content">
            <SelectItem value="1">One</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = document.querySelector('[data-testid="custom-content"]');
      expect(content).toBeTruthy();
    });

    it("applies default classes", () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="content">
            <SelectItem value="1">One</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = document.querySelector('[data-testid="content"]');
      expect(content?.className).toContain("rounded-md");
      expect(content?.className).toContain("border");
    });

    it("forwards className prop", () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content" data-testid="content">
            <SelectItem value="1">One</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = document.querySelector('[data-testid="content"]');
      expect(content?.className).toContain("custom-content");
    });
  });

  // ── SelectValue ────────────────────────────────────────────────

  describe("SelectValue", () => {
    it("renders placeholder text", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      );
      expect(container.textContent).toContain("Select an option");
    });
  });

  // ── Integration ────────────────────────────────────────────────

  describe("Integration", () => {
    it("renders complete select component", () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      );
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
    });

    it("renders multiple items", () => {
      const { container } = render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">One</SelectItem>
            <SelectItem value="2">Two</SelectItem>
            <SelectItem value="3">Three</SelectItem>
          </SelectContent>
        </Select>
      );
      const options = container.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(3);
    });
  });
});
