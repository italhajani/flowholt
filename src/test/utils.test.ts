import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn() class merger", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("handles conditional classes", () => {
    const active = true;
    const result = cn("base", active && "text-blue-500", !active && "text-gray-500");
    expect(result).toBe("base text-blue-500");
  });

  it("strips falsy inputs", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles array inputs via clsx", () => {
    expect(cn(["px-2", "py-1"])).toBe("px-2 py-1");
  });
});
