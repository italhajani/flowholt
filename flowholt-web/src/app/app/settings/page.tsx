import { AppShell } from "@/components/app-shell";
import { SurfaceCard } from "@/components/surface-card";
import {
  addWorkspaceMember,
  changeWorkspacePlan,
  createWorkspaceInvoice,
  removeWorkspaceMember,
  setActiveWorkspace,
  updateWorkspaceMemberRole,
} from "@/app/app/settings/actions";
import { formatCurrencyCents } from "@/lib/flowholt/billing";
import { getWorkspaceAuditTrail } from "@/lib/flowholt/audit-trail";
import { getWorkspaceSettingsSnapshot } from "@/lib/flowholt/data";
import type { UsageCounter } from "@/lib/flowholt/types";
import { assessPlatformReadiness } from "@/lib/platform/readiness";

type SettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusTone = {
  ok: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-800",
} as const;

const roleTone = {
  owner: "bg-stone-900 text-stone-50",
  admin: "bg-[#eef5ef] text-emerald-900",
  member: "bg-[#f8eee4] text-amber-950",
} as const;

function readMessage(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function shortUserLabel(userId: string, currentUserId: string | null) {
  if (userId === currentUserId) {
    return "You";
  }

  if (userId.length <= 12) {
    return userId;
  }

  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

function counterTone(level: UsageCounter["level"]) {
  if (level === "blocked") {
    return "bg-[#f8eee4] text-amber-950";
  }
  if (level === "warn") {
    return "bg-[#eef5ef] text-emerald-900";
  }
  return "bg-white/88 text-stone-700";
}

function prettyAction(action: string) {
  return action.replace(/[._]/g, " ");
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Current billing period";
  }
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const readiness = await assessPlatformReadiness();
  const snapshot = await getWorkspaceSettingsSnapshot();
  const auditTrail = snapshot.activeWorkspace
    ? await getWorkspaceAuditTrail(snapshot.activeWorkspace.id)
    : { auditReady: true, logs: [] };
  const params = searchParams ? await searchParams : {};
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <AppShell
      eyebrow="Settings"
      title="Workspace controls"
      description="A cleaner admin surface for active workspace selection, team roles, billing foundations, audit history, and platform readiness."
    >
      <div className="space-y-5">
        {message ? (
          <div className="rounded-[1.5rem] bg-[#eef5ef] px-5 py-4 text-sm text-emerald-900">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-[1.5rem] bg-[#f8eee4] px-5 py-4 text-sm text-amber-950">{error}</div>
        ) : null}

        {!snapshot.schemaReady ? (
          <SurfaceCard title="Core database migration needed" description="The workspace tables are not ready yet, so team controls cannot load." tone="sand">
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <p>Open Supabase SQL editor and run `20260325_0001_flowholt_core.sql` first.</p>
              <p>Then refresh this page and come back here.</p>
            </div>
          </SurfaceCard>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <div className="flowholt-window overflow-hidden">
              <div className="flowholt-window-bar">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Workspace</p>
                  <p className="mt-1 text-sm font-medium text-stone-900">Active workspace and team access</p>
                </div>
                {snapshot.activeWorkspace ? <span className="flowholt-chip">{snapshot.activeWorkspace.name}</span> : null}
              </div>

              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="border-b border-stone-900/8 p-5 xl:border-b-0 xl:border-r xl:p-6">
                  <SurfaceCard
                    title="Active workspace"
                    description="Choose which workspace the rest of the app should use right now."
                    tone="mint"
                  >
                    {snapshot.activeWorkspace ? (
                      <div className="space-y-4">
                        <div className="rounded-[1.35rem] bg-white/88 px-4 py-4 text-sm text-stone-700">
                          <p className="font-medium text-stone-900">{snapshot.activeWorkspace.name}</p>
                          <p className="mt-2 leading-6 text-stone-600">{snapshot.activeWorkspace.description || "No description yet."}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                            <span className="rounded-full bg-stone-100 px-3 py-1">role: {snapshot.currentUserRole ?? "member"}</span>
                            <span className="rounded-full bg-stone-100 px-3 py-1">team size: {snapshot.teamSize}</span>
                            {snapshot.limits ? <span className="rounded-full bg-stone-100 px-3 py-1">plan: {snapshot.limits.planName}</span> : null}
                          </div>
                        </div>

                        <form action={setActiveWorkspace} className="flex flex-col gap-3 md:flex-row">
                          <select
                            name="workspaceId"
                            defaultValue={snapshot.activeWorkspace.id}
                            className="flex-1 rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                          >
                            {snapshot.workspaces.map((workspace) => (
                              <option key={workspace.id} value={workspace.id}>
                                {workspace.name}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">
                            Switch workspace
                          </button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-stone-600">Create your first workspace on the dashboard to unlock team access.</p>
                    )}
                  </SurfaceCard>

                  <div className="mt-5">
                    <SurfaceCard title="Team access" description="Who can use this workspace and what level of access they have.">
                      {snapshot.activeWorkspace ? (
                        <div className="space-y-4">
                          {snapshot.limits ? (
                            <div className={`rounded-[1.25rem] px-4 py-3 text-sm ${counterTone(snapshot.limits.members.level)}`}>
                              Team seats used: {snapshot.limits.members.used} / {snapshot.limits.members.limit}
                            </div>
                          ) : null}

                          <div className="space-y-3">
                            {snapshot.members.length ? (
                              snapshot.members.map((member) => (
                                <div key={member.id} className="rounded-[1.35rem] border border-stone-900/10 bg-white px-4 py-4">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-stone-900">
                                        {shortUserLabel(member.user_id, snapshot.currentUserId)}
                                      </p>
                                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">{member.user_id}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${roleTone[member.role]}`}>
                                      {member.role}
                                    </span>
                                  </div>

                                  {snapshot.canManageMembers && member.role !== "owner" ? (
                                    <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                                      <form action={updateWorkspaceMemberRole} className="flex flex-1 gap-3">
                                        <input type="hidden" name="membershipId" value={member.id} />
                                        <select
                                          name="role"
                                          defaultValue={member.role}
                                          className="flex-1 rounded-[1.25rem] border border-stone-900/10 bg-[#fbf8f3] px-4 py-3 text-sm outline-none"
                                        >
                                          <option value="member">Member</option>
                                          <option value="admin">Admin</option>
                                          {snapshot.currentUserRole === "owner" ? <option value="owner">Owner</option> : null}
                                        </select>
                                        <button type="submit" className="flowholt-secondary-button px-4 py-3 text-sm font-medium">
                                          Save role
                                        </button>
                                      </form>
                                      <form action={removeWorkspaceMember}>
                                        <input type="hidden" name="membershipId" value={member.id} />
                                        <button type="submit" className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                                          Remove
                                        </button>
                                      </form>
                                    </div>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-[1.25rem] border border-dashed border-stone-900/14 bg-[#fbf8f3] px-4 py-6 text-sm text-stone-500">
                                No team members yet.
                              </div>
                            )}
                          </div>

                          {snapshot.canManageMembers ? (
                            <form action={addWorkspaceMember} className="rounded-[1.35rem] bg-[#fbf8f3] p-4">
                              <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace.id} />
                              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                                <input
                                  name="userId"
                                  placeholder="Teammate user id"
                                  className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                                />
                                <select
                                  name="role"
                                  defaultValue="member"
                                  className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                                >
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                  {snapshot.currentUserRole === "owner" ? <option value="owner">Owner</option> : null}
                                </select>
                                <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">
                                  Add member
                                </button>
                              </div>
                            </form>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm leading-6 text-stone-600">Once you have a workspace, team access controls will appear here.</p>
                      )}
                    </SurfaceCard>
                  </div>
                </div>

                <div className="bg-[#f8f4ee] p-5 xl:p-6">
                  <div className="space-y-5">
                    {snapshot.billing ? (
                      <SurfaceCard
                        title="Billing engine"
                        description="Plan, subscription, draft invoice estimate, and recent invoice history."
                        tone={snapshot.billing.estimate.overageAmountCents > 0 ? "sand" : "mint"}
                      >
                        <div className="space-y-4 text-sm leading-6 text-stone-700">
                          <div className="rounded-[1.25rem] bg-white/88 px-4 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Current plan</p>
                                <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">{snapshot.billing.currentPlan.name}</p>
                                <p className="mt-1 text-sm text-stone-600">{snapshot.billing.currentPlan.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Monthly base</p>
                                <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">
                                  {formatCurrencyCents(snapshot.billing.subscription.monthly_base_cents, snapshot.billing.subscription.currency)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                              <span className="rounded-full bg-stone-100 px-3 py-1">
                                {formatDateRange(snapshot.billing.subscription.current_period_start, snapshot.billing.subscription.current_period_end)}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Draft invoice</p>
                              <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">
                                {formatCurrencyCents(snapshot.billing.estimate.totalAmountCents, snapshot.billing.estimate.currency)}
                              </p>
                            </div>
                            <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Base</p>
                              <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">
                                {formatCurrencyCents(snapshot.billing.estimate.baseAmountCents, snapshot.billing.estimate.currency)}
                              </p>
                            </div>
                            <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Overage</p>
                              <p className="mt-2 text-lg font-semibold tracking-tight text-stone-900">
                                {formatCurrencyCents(snapshot.billing.estimate.overageAmountCents, snapshot.billing.estimate.currency)}
                              </p>
                            </div>
                          </div>

                          {snapshot.canManageMembers ? (
                            <form action={changeWorkspacePlan} className="rounded-[1.35rem] bg-[#fbf8f3] p-4">
                              <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace?.id ?? ""} />
                              <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                                <select name="planKey" defaultValue={snapshot.billing.currentPlan.key} className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none">
                                  <option value="starter">Starter</option>
                                  <option value="pro">Pro</option>
                                  <option value="scale">Scale</option>
                                </select>
                                <input
                                  name="billingEmail"
                                  defaultValue={snapshot.billing.subscription.billing_email}
                                  placeholder="Billing email"
                                  className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3 text-sm outline-none"
                                />
                                <button type="submit" className="flowholt-primary-button px-5 py-3 text-sm font-medium">
                                  Update plan
                                </button>
                              </div>
                            </form>
                          ) : null}

                          {snapshot.canManageMembers ? (
                            <form action={createWorkspaceInvoice}>
                              <input type="hidden" name="workspaceId" value={snapshot.activeWorkspace?.id ?? ""} />
                              <button type="submit" className="flowholt-secondary-button px-4 py-2 text-xs font-medium">
                                Create draft invoice
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </SurfaceCard>
                    ) : null}

                    {snapshot.limits ? (
                      <SurfaceCard title="Plan and usage" description="Workspace usage in cleaner product language." tone="default">
                        <div className="space-y-3 text-sm leading-6 text-stone-700">
                          <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">{snapshot.limits.planName} plan | {snapshot.limits.periodLabel}</div>
                          <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.runsMonthly.level)}`}>Runs: {snapshot.limits.runsMonthly.used} / {snapshot.limits.runsMonthly.limit}</div>
                          <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.tokensMonthly.level)}`}>Tokens: {snapshot.limits.tokensMonthly.used} / {snapshot.limits.tokensMonthly.limit}</div>
                          <div className={`rounded-[1.25rem] px-4 py-3 ${counterTone(snapshot.limits.members.level)}`}>Members: {snapshot.limits.members.used} / {snapshot.limits.members.limit}</div>
                          <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">Tool calls this month: {snapshot.limits.toolCallsMonthlyCount}</div>
                        </div>
                      </SurfaceCard>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <SurfaceCard title="Audit trail" description="Sensitive workspace actions in a readable history." tone="sand">
              {!auditTrail.auditReady ? (
                <div className="rounded-[1.25rem] bg-white/88 px-4 py-4 text-sm leading-6 text-stone-600">
                  Run `20260327_0011_audit_logs_and_secret_rotation.sql` to unlock audit history.
                </div>
              ) : auditTrail.logs.length ? (
                <div className="space-y-3">
                  {auditTrail.logs.map((entry) => (
                    <div key={entry.id} className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-stone-900">{entry.summary || prettyAction(entry.action)}</p>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                          {prettyAction(entry.action)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-400">
                        {entry.actor_user_id ? shortUserLabel(entry.actor_user_id, snapshot.currentUserId) : "System"} | {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.25rem] bg-white/88 px-4 py-4 text-sm leading-6 text-stone-600">
                  No security-sensitive actions have been logged yet.
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard title="Permission levels" description="What each workspace role is for." tone="sand">
              <div className="space-y-3 text-sm leading-6 text-stone-700">
                <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                  <p className="font-medium text-stone-900">Owner</p>
                  <p className="mt-1">Full control over the workspace, team roles, settings, and future billing.</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                  <p className="font-medium text-stone-900">Admin</p>
                  <p className="mt-1">Can manage members, integrations, schedules, and operational setup.</p>
                </div>
                <div className="rounded-[1.25rem] bg-white/88 px-4 py-3">
                  <p className="font-medium text-stone-900">Member</p>
                  <p className="mt-1">Can build workflows, run automations, inspect logs, and collaborate day to day.</p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Platform readiness" description="Confirm environment variables and backend service health." tone={readiness.overall === "ready" ? "mint" : "sand"}>
              <div className="space-y-3">
                {readiness.checks.map((check) => (
                  <div key={check.id} className="rounded-[1.25rem] border border-stone-900/10 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-stone-900">{check.label}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone[check.status]}`}>
                        {check.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{check.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-400">Last checked: {new Date(readiness.generated_at).toLocaleString()}</p>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
