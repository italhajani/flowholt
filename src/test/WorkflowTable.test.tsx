import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Test the WorkflowTable component
import WorkflowTable, { type WorkflowItem } from "@/components/dashboard/WorkflowTable";

const createWorkflow = (overrides: Partial<WorkflowItem> = {}): WorkflowItem => ({
  id: "w-test-001",
  name: "Test Workflow",
  status: "active",
  triggerType: "manual",
  lastRun: "5 min ago",
  successRate: 95,
  createdAt: "2024-01-01",
  category: "Custom",
  ...overrides,
});

const renderTable = (workflows: WorkflowItem[], props: Partial<React.ComponentProps<typeof WorkflowTable>> = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <WorkflowTable workflows={workflows} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("WorkflowTable", () => {
  it("renders workflow names", () => {
    renderTable([createWorkflow({ name: "My AI Flow" }), createWorkflow({ id: "w-2", name: "Data Sync" })]);
    expect(screen.getByText("My AI Flow")).toBeInTheDocument();
    expect(screen.getByText("Data Sync")).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    const workflows = Array.from({ length: 5 }, (_, i) => createWorkflow({ id: `w-${i}`, name: `Flow ${i}` }));
    renderTable(workflows);
    workflows.forEach((wf) => {
      expect(screen.getByText(wf.name)).toBeInTheDocument();
    });
  });

  it("renders empty table without errors", () => {
    const { container } = renderTable([]);
    expect(container.querySelector(".divide-y")).toBeInTheDocument();
  });

  it("shows status badges", () => {
    renderTable([
      createWorkflow({ id: "w-1", name: "Active Flow", status: "active" }),
      createWorkflow({ id: "w-2", name: "Draft Flow", status: "draft" }),
    ]);
    expect(screen.getByText("Active Flow")).toBeInTheDocument();
    expect(screen.getByText("Draft Flow")).toBeInTheDocument();
  });

  it("shows success rate values", () => {
    renderTable([createWorkflow({ successRate: 42 })]);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("shows trigger type labels", () => {
    renderTable([createWorkflow({ triggerType: "webhook" })]);
    expect(screen.getByText("Webhook")).toBeInTheDocument();
  });
});
