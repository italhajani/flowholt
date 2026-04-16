import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/dashboard/StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label for each status", () => {
    const statuses = [
      { status: "active" as const, label: "Active" },
      { status: "draft" as const, label: "Draft" },
      { status: "paused" as const, label: "Paused" },
      { status: "disabled" as const, label: "Disabled" },
      { status: "error" as const, label: "Error" },
    ];

    for (const { status, label } of statuses) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it("applies custom className", () => {
    const { container } = render(<StatusBadge status="active" className="my-custom-class" />);
    expect(container.firstElementChild?.className).toContain("my-custom-class");
  });

  it("renders a dot indicator", () => {
    const { container } = render(<StatusBadge status="error" />);
    const dot = container.querySelector(".rounded-full.w-1\\.5");
    expect(dot).toBeTruthy();
  });
});
