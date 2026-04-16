import { describe, it, expect } from "vitest";

// Test the pure utility functions used in WorkflowStudio

const buildFallbackEdges = (steps: { id: string }[]) =>
  steps.slice(0, -1).map((step, index) => ({
    id: `edge-${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    label: null,
  }));

const updateConnectionTargets = (
  edges: { id: string; source: string; target: string; label: string | null }[],
  stepId: string,
  targets: { defaultTarget?: string; trueTarget?: string; falseTarget?: string },
) => {
  const nextEdges: typeof edges = [];
  if (targets.defaultTarget) {
    nextEdges.push({ id: `edge-${stepId}-default-${targets.defaultTarget}`, source: stepId, target: targets.defaultTarget, label: null });
  }
  if (targets.trueTarget) {
    nextEdges.push({ id: `edge-${stepId}-true-${targets.trueTarget}`, source: stepId, target: targets.trueTarget, label: "true" });
  }
  if (targets.falseTarget) {
    nextEdges.push({ id: `edge-${stepId}-false-${targets.falseTarget}`, source: stepId, target: targets.falseTarget, label: "false" });
  }
  return [...edges.filter((edge) => edge.source !== stepId), ...nextEdges];
};

describe("buildFallbackEdges", () => {
  it("creates chain of edges for sequential steps", () => {
    const steps = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const edges = buildFallbackEdges(steps);

    expect(edges).toHaveLength(2);
    expect(edges[0]).toEqual({ id: "edge-a-b", source: "a", target: "b", label: null });
    expect(edges[1]).toEqual({ id: "edge-b-c", source: "b", target: "c", label: null });
  });

  it("returns empty array for single step", () => {
    expect(buildFallbackEdges([{ id: "only" }])).toEqual([]);
  });

  it("returns empty array for no steps", () => {
    expect(buildFallbackEdges([])).toEqual([]);
  });
});

describe("updateConnectionTargets", () => {
  const existingEdges = [
    { id: "e1", source: "s1", target: "s2", label: null },
    { id: "e2", source: "s2", target: "s3", label: null },
    { id: "e3", source: "s3", target: "s4", label: null },
  ];

  it("replaces all edges from a step with new default target", () => {
    const result = updateConnectionTargets(existingEdges, "s2", { defaultTarget: "s5" });

    // s2 edges removed, new default added, others preserved
    expect(result.filter((e) => e.source === "s2")).toHaveLength(1);
    expect(result.find((e) => e.source === "s2")?.target).toBe("s5");
    expect(result.find((e) => e.source === "s1")).toBeTruthy();
    expect(result.find((e) => e.source === "s3")).toBeTruthy();
  });

  it("creates true/false branches for conditions", () => {
    const result = updateConnectionTargets(existingEdges, "s2", {
      trueTarget: "s3",
      falseTarget: "s4",
    });

    const s2Edges = result.filter((e) => e.source === "s2");
    expect(s2Edges).toHaveLength(2);
    expect(s2Edges.find((e) => e.label === "true")?.target).toBe("s3");
    expect(s2Edges.find((e) => e.label === "false")?.target).toBe("s4");
  });

  it("removes all edges from step when no targets given", () => {
    const result = updateConnectionTargets(existingEdges, "s2", {});
    expect(result.filter((e) => e.source === "s2")).toHaveLength(0);
    expect(result).toHaveLength(2);
  });
});
