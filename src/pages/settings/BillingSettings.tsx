import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { Download, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, BarChart3, Users } from "lucide-react";

/* ── Top Consuming Workflows ── */
interface WorkflowUsage {
  id: string;
  name: string;
  credits: number;
  percent: number;
  avgPerRun: number;
}

const mockWorkflows: WorkflowUsage[] = [
  { id: "w1", name: "Order Processing Pipeline", credits: 8543, percent: 34.2, avgPerRun: 42 },
  { id: "w2", name: "Email Campaign Automation", credits: 4321, percent: 17.3, avgPerRun: 18 },
  { id: "w3", name: "Lead Qualification Pipeline", credits: 2876, percent: 11.5, avgPerRun: 23 },
  { id: "w4", name: "Customer Onboarding", credits: 1543, percent: 6.2, avgPerRun: 31 },
  { id: "w5", name: "Daily Report Generator", credits: 987, percent: 3.9, avgPerRun: 8 },
];

const workflowColumns: Column<WorkflowUsage>[] = [
  { id: "name", header: "Workflow", sortable: true, accessor: (row) => <span className="text-[13px] font-medium text-zinc-800">{row.name}</span> },
  { id: "credits", header: "Credits Used", accessor: (row) => <span className="text-zinc-600">{row.credits.toLocaleString()}</span> },
  { id: "percent", header: "% of Total", accessor: (row) => <span className="text-zinc-500">{row.percent}%</span> },
  { id: "avg", header: "Avg/Run", accessor: (row) => <span className="text-zinc-500">{row.avgPerRun}</span> },
];

/* ── Team Credit Allocation ── */
interface TeamAllocation {
  id: string;
  team: string;
  allocated: number;
  used: number;
  members: number;
}

const mockTeams: TeamAllocation[] = [
  { id: "t1", team: "Engineering", allocated: 12000, used: 9876, members: 5 },
  { id: "t2", team: "Marketing", allocated: 8000, used: 5432, members: 3 },
  { id: "t3", team: "Sales Ops", allocated: 5000, used: 2926, members: 4 },
];

/* ── Billing History ── */
interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid";
}

const mockInvoices: Invoice[] = [
  { id: "inv1", date: "Apr 1, 2026", description: "Pro Plan (Monthly)", amount: "$29.00", status: "paid" },
  { id: "inv2", date: "Mar 15, 2026", description: "Extra Credits (5,000)", amount: "$8.00", status: "paid" },
  { id: "inv3", date: "Mar 1, 2026", description: "Pro Plan (Monthly)", amount: "$29.00", status: "paid" },
  { id: "inv4", date: "Feb 1, 2026", description: "Pro Plan (Monthly)", amount: "$29.00", status: "paid" },
];

const invoiceColumns: Column<Invoice>[] = [
  { id: "date", header: "Date", accessor: (row) => <span className="text-zinc-600">{row.date}</span> },
  { id: "description", header: "Description", sortable: true, accessor: (row) => <span className="text-[13px] font-medium text-zinc-800">{row.description}</span> },
  { id: "amount", header: "Amount", accessor: (row) => <span className="text-zinc-600">{row.amount}</span> },
  {
    id: "status",
    header: "Status",
    accessor: () => (
      <span className="inline-flex items-center gap-1 text-[12px] text-green-700">
        <span>Paid</span>
        <span className="text-green-500">✓</span>
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    className: "w-10",
    accessor: () => (
      <button className="text-zinc-300 hover:text-zinc-600 transition-colors" title="Download PDF">
        <Download size={13} />
      </button>
    ),
  },
];

/* ── Usage Forecast Bar Chart (CSS-only) ── */
const forecastData = [
  { day: "Mon", actual: 620, forecast: 610 },
  { day: "Tue", actual: 580, forecast: 600 },
  { day: "Wed", actual: 740, forecast: 630 },
  { day: "Thu", actual: 690, forecast: 650 },
  { day: "Fri", actual: 810, forecast: 670 },
  { day: "Sat", actual: 420, forecast: 500 },
  { day: "Sun", actual: 380, forecast: 480 },
  { day: "Mon", actual: null as number | null, forecast: 610 },
  { day: "Tue", actual: null, forecast: 620 },
  { day: "Wed", actual: null, forecast: 640 },
];

function UsageForecastChart() {
  const maxVal = Math.max(...forecastData.map((d) => Math.max(d.actual ?? 0, d.forecast)));
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-zinc-800" /> Actual
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-zinc-300 border border-dashed border-zinc-400" /> Forecast
        </span>
      </div>
      <div className="flex items-end gap-1.5 h-[120px]">
        {forecastData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex items-end gap-px" style={{ height: 100 }}>
              {d.actual !== null ? (
                <div
                  className="flex-1 rounded-t bg-zinc-800 transition-all"
                  style={{ height: `${(d.actual / maxVal) * 100}%` }}
                />
              ) : (
                <div
                  className="flex-1 rounded-t border border-dashed border-zinc-300 bg-zinc-50 transition-all"
                  style={{ height: `${(d.forecast / maxVal) * 100}%` }}
                />
              )}
            </div>
            <span className="text-[9px] text-zinc-400">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BillingSettings() {
  const [autoCredit, setAutoCredit] = useState(false);

  const creditUsed = 18234;
  const creditTotal = 25000;
  const creditPct = Math.round((creditUsed / creditTotal) * 100);
  const isNearLimit = creditPct >= 80;

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Billing</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Plan, usage, and payment management.</p>

      <div className="mt-6 space-y-6">
        {/* Section 1: Current Plan with overage warning */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[16px] font-semibold text-zinc-900">Pro</p>
            <Badge variant="info">Current Plan</Badge>
          </div>
          <p className="text-[13px] text-zinc-600 mb-1">$29/month · 25,000 credits included</p>
          <p className="text-[12px] text-zinc-400 mb-4">Renews April 15, 2026</p>

          {/* Credit gauge with threshold indicators */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12px] font-medium text-zinc-600">Credits used</p>
              <p className={cn("text-[12px]", isNearLimit ? "text-amber-600 font-medium" : "text-zinc-500")}>
                {creditUsed.toLocaleString()} / {creditTotal.toLocaleString()} ({creditPct}%)
              </p>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-zinc-100">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  creditPct >= 95 ? "bg-red-500" : creditPct >= 80 ? "bg-amber-500" : "bg-zinc-800"
                )}
                style={{ width: `${creditPct}%` }}
              />
              {/* Threshold markers */}
              <div className="absolute top-0 h-full w-px bg-amber-400/60" style={{ left: "80%" }} title="80% warning" />
              <div className="absolute top-0 h-full w-px bg-red-400/60" style={{ left: "95%" }} title="95% critical" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-zinc-300">0%</span>
              <span className="text-[9px] text-amber-400">80%</span>
              <span className="text-[9px] text-red-400">95%</span>
              <span className="text-[9px] text-zinc-300">100%</span>
            </div>
          </div>

          {/* Overage warning */}
          {isNearLimit && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-4">
              <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">
                You're approaching your credit limit. Consider upgrading or purchasing extra credits to avoid workflow interruptions.
              </p>
            </div>
          )}

          <div className="space-y-1 mb-4">
            <p className="text-[12px] text-zinc-500">Extra credits: <span className="text-zinc-700">5,000 purchased · 3,200 remaining</span></p>
            <p className="text-[12px] text-zinc-500">AI credits: <span className="text-zinc-700">3,456 consumed (13.8% of total)</span></p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm">Upgrade Plan</Button>
            <Button variant="secondary" size="sm">Buy Extra Credits</Button>
          </div>
        </div>

        {/* Section 2: Usage Forecast */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-zinc-400" />
              <p className="text-[13px] font-semibold text-zinc-800">Usage Forecast</p>
            </div>
            <span className="text-[11px] text-zinc-400">Last 7 days + 3 day forecast</span>
          </div>
          <UsageForecastChart />
          <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
            <ArrowUpRight size={12} className="text-emerald-500" />
            Projected total by period end: <span className="font-semibold text-zinc-700">~21,800 credits</span>
            <span className="text-zinc-400">(within limits)</span>
          </div>
        </div>

        {/* Section 3: Usage Breakdown */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Usage Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Daily Average" value="608" sub="credits" icon={BarChart3} />
            <StatCard label="Peak Day" value="1,204" sub="Mar 7" icon={TrendingUp} />
            <StatCard label="AI Credit Usage" value="3,456" sub="13.8% of total" icon={BarChart3} />
            <StatCard label="Cost per 1K" value="$0.16" sub="execution credits" icon={CreditCard} />
          </div>
        </div>

        {/* Section 4: Team Credit Allocation */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-zinc-400" />
              <p className="text-[13px] font-semibold text-zinc-800">Team Credit Allocation</p>
            </div>
            <Button variant="secondary" size="sm">Manage Allocations</Button>
          </div>
          <div className="space-y-3">
            {mockTeams.map((team) => {
              const pct = Math.round((team.used / team.allocated) * 100);
              return (
                <div key={team.id} className="rounded-lg border border-zinc-50 bg-zinc-50/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-zinc-800">{team.team}</span>
                      <span className="text-[10px] text-zinc-400">{team.members} members</span>
                    </div>
                    <span className={cn("text-[11px] font-medium", pct >= 80 ? "text-amber-600" : "text-zinc-500")}>
                      {team.used.toLocaleString()} / {team.allocated.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", pct >= 80 ? "bg-amber-500" : "bg-zinc-700")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Top Consuming Workflows */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Top Consuming Workflows</p>
          <DataTable
            columns={workflowColumns}
            data={mockWorkflows}
            getRowId={(w) => w.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No workflow usage data.</p>}
          />
        </div>

        {/* Section 6: Billing History */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Billing History</p>
          <DataTable
            columns={invoiceColumns}
            data={mockInvoices}
            getRowId={(inv) => inv.id}
            emptyState={<p className="py-8 text-center text-[13px] text-zinc-400">No invoices yet.</p>}
          />
        </div>

        {/* Section 7: Payment Method + Auto-topup */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Payment Method</p>
          <div className="flex items-center gap-3 mb-3">
            <CreditCard size={18} className="text-zinc-400" />
            <div>
              <p className="text-[13px] font-medium text-zinc-800">Visa ending in 4242</p>
              <p className="text-[11px] text-zinc-400">Expires 12/2027</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="secondary" size="sm">Change payment method</Button>
          </div>

          <div className="border-t border-zinc-100 pt-4 space-y-3">
            <ToggleRow
              title="Auto-purchase extra credits when depleted"
              description="Automatically buy 5,000 credits ($8.00) when your balance reaches zero"
              enabled={autoCredit}
              onToggle={() => setAutoCredit((v) => !v)}
            />
          </div>
        </div>

        {/* Rate Card */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Rate Card</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Execution Credits", rate: "$0.16 / 1,000" },
              { label: "AI Credits (GPT-4o)", rate: "$0.003 / call" },
              { label: "AI Credits (Claude)", rate: "$0.004 / call" },
              { label: "Data Storage", rate: "$0.10 / GB" },
            ].map(({ label, rate }) => (
              <div key={label} className="rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2.5">
                <p className="text-[10px] font-medium text-zinc-400 mb-1">{label}</p>
                <p className="text-[13px] font-semibold text-zinc-800">{rate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: React.ElementType }) {
  return (
    <div className="rounded-md border border-zinc-100 bg-zinc-50/50 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={11} className="text-zinc-400" />}
        <p className="text-[11px] font-medium text-zinc-400">{label}</p>
      </div>
      <p className="text-[15px] font-semibold text-zinc-900">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ToggleRow({ title, description, enabled, onToggle }: { title: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium text-zinc-800">{title}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
          enabled ? "bg-zinc-800" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
            enabled ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
