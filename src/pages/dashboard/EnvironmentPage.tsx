import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  KeyRound,
  Loader2,
  Puzzle,
  Rocket,
  Server,
  Settings2,
  Shield,
  Webhook,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  api,
  type ApiSystemStatus,
  type ApiVaultOverview,
  type ApiWorkflow,
  type ApiWorkflowDeploymentReviewSummary,
  type ApiWorkspaceSettings,
} from "@/lib/api";
import { TableLoader } from "@/components/dashboard/DashboardRouteLoader";
import { toast } from "@/hooks/use-toast";

interface EnvironmentOverview {
  settings: ApiWorkspaceSettings;
  system: ApiSystemStatus;
  workflows: ApiWorkflow[];
  vault: ApiVaultOverview;
  pendingReviews: ApiWorkflowDeploymentReviewSummary[];
}

type ReviewDecisionAction = "approve" | "reject";

interface ReviewDecisionState {
  review: ApiWorkflowDeploymentReviewSummary;
  action: ReviewDecisionAction;
}

const surfaceBadgeClass = {
  enabled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  disabled: "bg-slate-100 text-slate-600 border-slate-200",
  required: "bg-amber-50 text-amber-700 border-amber-200",
  online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  offline: "bg-red-50 text-red-700 border-red-200",
} as const;

const metricAccent = [
  "text-[#103b71]",
  "text-emerald-600",
  "text-amber-600",
  "text-slate-700",
];

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeBaseUrl(value: string | null): string {
  const fallback = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";
  return (value || fallback).replace(/\/+$/, "");
}

function sentenceCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  accent: string;
}> = ({ label, value, detail, icon: Icon, accent }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-200/30">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <Icon size={15} className={accent} />
    </div>
    <div className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">{value}</div>
    <div className="mt-1 text-[12px] leading-5 text-slate-500">{detail}</div>
  </div>
);

const ContractCard: React.FC<{
  eyebrow: string;
  title: string;
  detail: string;
  icon: React.ElementType;
}> = ({ eyebrow, title, detail, icon: Icon }) => (
  <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm shadow-slate-200/20">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</div>
        <div className="mt-2 text-[17px] font-bold tracking-tight text-slate-900">{title}</div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2 text-[#103b71]">
        <Icon size={16} />
      </div>
    </div>
    <div className="mt-3 text-[13px] leading-6 text-slate-600">{detail}</div>
  </div>
);

const FlowStepCard: React.FC<{
  step: string;
  title: string;
  detail: string;
}> = ({ step, title, detail }) => (
  <div className="rounded-2xl border border-slate-100 px-4 py-4">
    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{step}</div>
    <div className="mt-2 text-[15px] font-bold text-slate-900">{title}</div>
    <div className="mt-2 text-[12px] leading-5 text-slate-500">{detail}</div>
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string;
  detail: string;
  status?: keyof typeof surfaceBadgeClass;
}> = ({ label, value, detail, status }) => (
  <div className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 md:grid-cols-[220px_minmax(0,1fr)_120px] md:items-start">
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    </div>
    <div className="min-w-0">
      <div className="truncate font-mono text-[13px] text-slate-900">{value}</div>
      <div className="mt-1 text-[12px] leading-5 text-slate-500">{detail}</div>
    </div>
    <div className="md:text-right">
      {status ? (
        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", surfaceBadgeClass[status])}>
          {sentenceCase(status)}
        </span>
      ) : null}
    </div>
  </div>
);

const EnvironmentPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [decisionState, setDecisionState] = useState<ReviewDecisionState | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const { data, isLoading, error } = useQuery<EnvironmentOverview>({
    queryKey: ["environment-overview"],
    queryFn: async () => {
      const [settings, system, workflows, vault, pendingReviews] = await Promise.all([
        api.getWorkspaceSettings(),
        api.getSystemStatus(),
        api.listWorkflows(),
        api.getVaultOverview(),
        api.listDeploymentReviews("pending"),
      ]);
      return { settings, system, workflows, vault, pendingReviews };
    },
  });

  const reviewDecisionMutation = useMutation({
    mutationFn: async ({ reviewId, action, comment }: { reviewId: string; action: ReviewDecisionAction; comment: string }) => {
      if (action === "approve") {
        return api.approveDeploymentReview(reviewId, comment);
      }
      return api.rejectDeploymentReview(reviewId, comment);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["environment-overview"] });
      await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      const actionLabel = variables.action === "approve" ? "approved" : "rejected";
      toast({
        title: `Review ${actionLabel}`,
        description: variables.action === "approve"
          ? "The environment pointer was updated and the review left the pending queue."
          : "The review was rejected and removed from the pending queue.",
      });
      setDecisionState(null);
      setDecisionComment("");
    },
    onError: (mutationError) => {
      toast({
        title: "Could not update review",
        description: mutationError instanceof Error ? mutationError.message : "The deployment review action failed.",
        variant: "destructive",
      });
    },
  });

  const workflowBreakdown = useMemo(() => {
    const empty = { active: 0, draft: 0, paused: 0 };
    if (!data) {
      return empty;
    }
    return data.workflows.reduce(
      (counts, workflow) => {
        if (workflow.status === "active") counts.active += 1;
        else if (workflow.status === "paused") counts.paused += 1;
        else counts.draft += 1;
        return counts;
      },
      { ...empty },
    );
  }, [data]);

  if (isLoading) {
    return <TableLoader titleWidth="220px" />;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[1280px] p-8 pb-24">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-[13px] text-red-700">
          {error instanceof Error ? error.message : "Could not load environment settings."}
        </div>
      </div>
    );
  }

  const { settings, system, vault, pendingReviews } = data;
  const baseUrl = normalizeBaseUrl(settings.public_base_url);
  const oauthCallbackUrl = `${typeof window !== "undefined" ? window.location.origin : baseUrl}/dashboard/providers`;
  const productionWebhookPattern = `${baseUrl}/api/webhooks/${settings.workspace_id}/{workflow_id}`;
  const publicChatPattern = `${baseUrl}/api/chat/${settings.workspace_id}/{workflow_id}`;
  const hostedChatPattern = `${baseUrl}/chat/${settings.workspace_id}/{workflow_id}`;
  const vaultAssetCount = vault.connections.length + vault.credentials.length + vault.variables.length;
  const promotionMode = settings.require_staging_before_production ? "Review -> staging -> production" : "Review -> production";
  const workflowNames = new Map(data.workflows.map((workflow) => [workflow.id, workflow.name]));
  const pendingReviewStats = pendingReviews.reduce(
    (counts, review) => {
      if (review.target_environment === "staging") {
        counts.staging += 1;
      } else {
        counts.production += 1;
      }
      return counts;
    },
    { staging: 0, production: 0 },
  );
  const recentPendingReviews = [...pendingReviews]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 4);
  const openDecisionDialog = (review: ApiWorkflowDeploymentReviewSummary, action: ReviewDecisionAction) => {
    setDecisionState({ review, action });
    setDecisionComment("");
  };
  const closeDecisionDialog = (open: boolean) => {
    if (open) {
      return;
    }
    if (reviewDecisionMutation.isPending) {
      return;
    }
    setDecisionState(null);
    setDecisionComment("");
  };
  const submitDecision = () => {
    if (!decisionState || reviewDecisionMutation.isPending) {
      return;
    }
    reviewDecisionMutation.mutate({
      reviewId: decisionState.review.id,
      action: decisionState.action,
      comment: decisionComment,
    });
  };
  const contractCards = [
    {
      eyebrow: "Instance",
      title: "This environment runs the live boundary",
      detail:
        "Treat this page as the contract for runtime behavior: publish gates, public URLs, webhook posture, and what the live instance is allowed to expose.",
      icon: Server,
    },
    {
      eyebrow: "Git Hand-off",
      title: "Workflow definitions should move through source control",
      detail:
        "n8n environments are an instance plus a Git branch. FlowHolt does not sync branches in-product yet, so use your repo and CI/CD to move saved workflow definitions instead of editing production directly.",
      icon: GitBranch,
    },
    {
      eyebrow: "Vault",
      title: "Live values stay with the instance",
      detail:
        "Connections, credential values, and variable values belong to Vault. Only names, references, or stubs should travel between environments. The real secrets stay local to the target instance.",
      icon: KeyRound,
    },
  ];
  const promotionSteps = [
    {
      step: "Step 1",
      title: "Build and test in a non-production instance",
      detail:
        "Use draft and staging paths for editor testing. Keep public endpoints for published workflows only.",
    },
    {
      step: "Step 2",
      title: settings.require_staging_before_production ? "Promote through staging before merge" : "Review and merge the workflow change",
      detail: settings.require_staging_before_production
        ? "Production promotion is gated by staging first, which matches the safer one-way n8n flow from development into live runtime."
        : "Direct production publish is currently allowed, but the safer operating model is still to merge reviewed changes and keep live edits exceptional.",
    },
    {
      step: "Step 3",
      title: settings.require_production_approval ? "Pull and publish with production approval" : "Pull and publish on the live instance",
      detail: settings.require_production_approval
        ? "Production still requires an approval checkpoint before the final publish step goes live."
        : "After the reviewed change lands, publish it on the target instance and verify the live Vault assets there.",
    },
  ];
  const metricCards = [
    {
      label: "Execution",
      value: system.platform.execution_mode.toUpperCase(),
      detail: `${system.worker.active ? "Worker online" : "No background worker"} · Scheduler ${system.scheduler.active ? "online" : "offline"}`,
      icon: Server,
    },
    {
      label: "Deployments",
      value: settings.require_staging_before_production ? "Staged" : "Direct",
      detail: `${promotionMode} · ${pendingReviews.length} pending review${pendingReviews.length === 1 ? "" : "s"}`,
      icon: Rocket,
    },
    {
      label: "Public Surface",
      value: settings.public_base_url ? "Configured" : "Fallback",
      detail: settings.public_base_url || "Using the current browser origin as the public base URL.",
      icon: Globe,
    },
    {
      label: "Vault Assets",
      value: String(vaultAssetCount),
      detail: `${vault.connections.length} connections · ${vault.credentials.length} credentials · ${vault.variables.length} variables`,
      icon: KeyRound,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] animate-fade-in p-8 pb-24">
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f5f8fb_58%,#eef4f9_100%)] p-6 shadow-sm shadow-slate-200/40 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[760px]">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <GitBranch size={12} className="text-[#103b71]" />
            n8n-style Environment Boundary
          </div>
          <h1 className="text-[30px] font-bold tracking-tight text-slate-900">Environments</h1>
          <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-slate-600">
            An n8n-style environment is the live instance boundary around your workflows. This page defines runtime rules, publish gates, and public entrypoints, while Vault remains the source of truth for live connections, credentials, and variable values.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Settings2 size={14} />
            Runtime Settings
          </button>
          <button
            onClick={() => navigate("/dashboard/credentials")}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#103b71] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0d2f5c]"
          >
            <KeyRound size={14} />
            Open Vault
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        {contractCards.map((card) => (
          <ContractCard
            key={card.eyebrow}
            eyebrow={card.eyebrow}
            title={card.title}
            detail={card.detail}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card, index) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.detail}
            icon={card.icon}
            accent={metricAccent[index]}
          />
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-4 flex items-center gap-2">
            <Webhook size={16} className="text-[#103b71]" />
            <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Runtime And Endpoint Entry</h2>
          </div>

          <DetailRow
            label="Public Base URL"
            value={baseUrl}
            detail="Canonical origin used for generated production webhook URLs, hosted chat pages, and widget scripts."
            status={settings.public_base_url ? "enabled" : "disabled"}
          />
          <DetailRow
            label="API Root"
            value={`${baseUrl}/api`}
            detail="Authenticated dashboard and workflow management API prefix."
            status="online"
          />
          <DetailRow
            label="Test Webhook"
            value={`${baseUrl}/api/triggers/webhook/{workflow_id}`}
            detail="Authenticated trigger entry used for draft and staging webhook tests inside the editor."
            status="online"
          />
          <DetailRow
            label="Production Webhook"
            value={productionWebhookPattern}
            detail="Public production webhook pattern. This is only intended for live workflow versions."
            status={settings.allow_public_webhooks ? "enabled" : "disabled"}
          />
          <DetailRow
            label="Test Chat Trigger"
            value={`${baseUrl}/api/triggers/chat/{workflow_id}`}
            detail="Internal chat trigger entry used for authenticated testing and studio previews."
            status="online"
          />
          <DetailRow
            label="Public Chat Endpoint"
            value={publicChatPattern}
            detail="Workspace-scoped public chat endpoint for deployed chat workflows."
            status={settings.allow_public_chat_triggers ? "enabled" : "disabled"}
          />
          <DetailRow
            label="Hosted Chat Page"
            value={hostedChatPattern}
            detail="End-user hosted chat surface generated for public chat workflows."
            status={settings.allow_public_chat_triggers ? "enabled" : "disabled"}
          />
          <DetailRow
            label="OAuth Callback"
            value={oauthCallbackUrl}
            detail="Compatibility redirect target used to complete OAuth2 connections before they are handed back into Vault."
            status="online"
          />
        </section>

        <div className="space-y-4">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
            <div className="mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#103b71]" />
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Promotion Rules</h2>
            </div>
            <div className="space-y-3 text-[13px] text-slate-600">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-800">Promotion path</div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-500">
                    {settings.require_staging_before_production ? "Every production publish must come through staging first." : "Direct production publish is allowed."}
                  </div>
                </div>
                {settings.require_staging_before_production ? <CheckCircle2 size={16} className="mt-0.5 text-emerald-600" /> : <XCircle size={16} className="mt-0.5 text-slate-400" />}
              </div>
              <div className="grid gap-3">
                {promotionSteps.map((step) => (
                  <FlowStepCard key={step.step} step={step.step} title={step.title} detail={step.detail} />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Staging Access</div>
                  <div className="mt-2 text-[15px] font-bold text-slate-900">{sentenceCase(settings.staging_min_role)}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Publish Access</div>
                  <div className="mt-2 text-[15px] font-bold text-slate-900">{sentenceCase(settings.publish_min_role)}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Run Access</div>
                  <div className="mt-2 text-[15px] font-bold text-slate-900">{sentenceCase(settings.run_min_role)}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Prod Assets</div>
                  <div className="mt-2 text-[15px] font-bold text-slate-900">{sentenceCase(settings.production_asset_min_role)}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-500">
                Approvals: staging {settings.require_staging_approval ? "required" : "optional"}, production {settings.require_production_approval ? "required" : "optional"}, approver role {sentenceCase(settings.deployment_approval_min_role)}, self-approval {settings.allow_self_approval ? "allowed" : "blocked"}. Keep the flow one-way where possible: edit in development, merge, then publish on the target instance.
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
            <div className="mb-4 flex items-center gap-2">
              <Rocket size={16} className="text-[#103b71]" />
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Promotion Handoff</h2>
            </div>
            <p className="text-[13px] leading-6 text-slate-600">
              This queue is backed by real deployment review records. Use it as the handoff between reviewed workflow changes and the target instance that will publish them.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pending Staging</div>
                <div className="mt-2 text-[22px] font-bold text-slate-900">{pendingReviewStats.staging}</div>
                <div className="mt-1 text-[12px] text-slate-500">Requests waiting for a staging promotion decision.</div>
              </div>
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pending Production</div>
                <div className="mt-2 text-[22px] font-bold text-slate-900">{pendingReviewStats.production}</div>
                <div className="mt-1 text-[12px] text-slate-500">Requests waiting for the production approval checkpoint.</div>
              </div>
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Latest Request</div>
                <div className="mt-2 text-[14px] font-bold text-slate-900">
                  {recentPendingReviews[0] ? formatUpdatedAt(recentPendingReviews[0].created_at) : "Queue clear"}
                </div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {recentPendingReviews[0]
                    ? `${sentenceCase(recentPendingReviews[0].target_environment)} handoff waiting for review.`
                    : "No promotion approvals are currently waiting."}
                </div>
              </div>
            </div>

            {recentPendingReviews.length ? (
              <div className="mt-4 space-y-3">
                {recentPendingReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-100 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-slate-900">
                          {workflowNames.get(review.workflow_id) || "Workflow awaiting review"}
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-slate-500">
                          {review.notes?.trim() || "No promotion note was included with this request."}
                        </div>
                      </div>
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold", review.target_environment === "production" ? surfaceBadgeClass.required : surfaceBadgeClass.enabled)}>
                        {sentenceCase(review.target_environment)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-500">
                      <span>Requested {formatUpdatedAt(review.created_at)}</span>
                      <span>Status: {sentenceCase(review.status)}</span>
                      <span>Version: {review.target_version_id.slice(0, 8)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => openDecisionDialog(review, "approve")}
                        disabled={reviewDecisionMutation.isPending}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#103b71] px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#0d2f5c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewDecisionMutation.isPending && decisionState?.review.id === review.id && decisionState.action === "approve" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Approve
                      </button>
                      <button
                        onClick={() => openDecisionDialog(review, "reject")}
                        disabled={reviewDecisionMutation.isPending}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 text-[12px] font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reviewDecisionMutation.isPending && decisionState?.review.id === review.id && decisionState.action === "reject" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                        Reject
                      </button>
                      <button
                        onClick={() => navigate("/dashboard/workflows")}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <ExternalLink size={13} />
                        Open Workflow List
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] leading-6 text-emerald-800">
                No pending deployment reviews. The promotion queue is clear and the target instance has no approval backlog.
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate("/dashboard/workflows")}
                className="flex h-10 items-center justify-between rounded-xl border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>Open Workflows</span>
                <ExternalLink size={14} />
              </button>
              <button
                onClick={() => navigate("/dashboard/settings")}
                className="flex h-10 items-center justify-between rounded-xl border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>Review Deployment Policy</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
            <div className="mb-4 flex items-center gap-2">
              <Server size={16} className="text-[#103b71]" />
              <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Runtime Health</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Worker</div>
                <div className="mt-2 text-[15px] font-bold text-slate-900">{system.worker.active ? "Active" : "Inactive"}</div>
                <div className="mt-1 text-[12px] text-slate-500">Mode: {system.worker.mode}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Scheduler</div>
                <div className="mt-2 text-[15px] font-bold text-slate-900">{system.scheduler.active ? "Active" : "Inactive"}</div>
                <div className="mt-1 text-[12px] text-slate-500">Database: {system.platform.database_backend}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Provider</div>
                <div className="mt-2 text-[15px] font-bold text-slate-900">{sentenceCase(system.llm.configured_provider)}</div>
                <div className="mt-1 text-[12px] text-slate-500">Default: {sentenceCase(system.llm.default_provider)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Executions</div>
                <div className="mt-2 text-[15px] font-bold text-slate-900">{system.executions.total}</div>
                <div className="mt-1 text-[12px] text-slate-500">{system.executions.running} running · {system.executions.failed} failed</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch size={16} className="text-[#103b71]" />
            <h2 className="text-[18px] font-bold tracking-tight text-slate-900">What Moves Between Environments</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workflow Definitions</div>
              <div className="mt-2 text-[24px] font-bold text-slate-900">{workflowBreakdown.active}</div>
              <div className="mt-1 text-[12px] text-slate-500">Active workflows are the primary artifacts that should move across environments after review.</div>
            </div>
            <div className="rounded-2xl border border-slate-100 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Credential Stubs</div>
              <div className="mt-2 text-[24px] font-bold text-slate-900">{vault.credentials.length}</div>
              <div className="mt-1 text-[12px] text-slate-500">Names and references can travel. The actual secret values should be populated from Vault on the target instance.</div>
            </div>
            <div className="rounded-2xl border border-slate-100 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Variable Stubs</div>
              <div className="mt-2 text-[24px] font-bold text-slate-900">{vault.variables.length}</div>
              <div className="mt-1 text-[12px] text-slate-500">Variable keys can be shared, but the live values still belong to the receiving environment.</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
            Settings last updated {formatUpdatedAt(settings.updated_at)}. Catalog apps available: {system.integrations.total}. Draft workflows waiting for promotion: {workflowBreakdown.draft}. Paused workflows held back from live traffic: {workflowBreakdown.paused}.
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={16} className="text-[#103b71]" />
            <h2 className="text-[18px] font-bold tracking-tight text-slate-900">Vault Boundary</h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Connections</div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-500">OAuth apps, third-party accounts, and refreshable access tokens.</div>
                </div>
                <span className="text-[20px] font-bold text-slate-900">{vault.connections.length}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Credentials</div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-500">API keys and provider-specific secrets bound to nodes and AI models.</div>
                </div>
                <span className="text-[20px] font-bold text-slate-900">{vault.credentials.length}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold text-slate-900">Variables</div>
                  <div className="mt-1 text-[12px] leading-5 text-slate-500">Reusable runtime values and shared secrets referenced by workflows.</div>
                </div>
                <span className="text-[20px] font-bold text-slate-900">{vault.variables.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => navigate("/dashboard/credentials")}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                <KeyRound size={14} />
                Manage Vault Assets
              </span>
              <ExternalLink size={14} />
            </button>
            <button
              onClick={() => navigate("/dashboard/credentials?tab=connections&connect=1")}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                <Bot size={14} />
                Open Vault Connections
              </span>
              <ExternalLink size={14} />
            </button>
            <button
              onClick={() => navigate("/dashboard/integrations")}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-2">
                <Puzzle size={14} />
                Browse App Catalog
              </span>
              <ExternalLink size={14} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-500">
            Environment decides who can publish, which public entrypoints exist, and how promotion reaches production. Vault decides which live secrets, OAuth accounts, and variables the target instance can actually execute with. The app catalog stays secondary and only describes what the editor can use.
          </div>
        </section>
      </div>

      <AlertDialog open={Boolean(decisionState)} onOpenChange={closeDecisionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decisionState?.action === "approve" ? "Approve deployment review" : "Reject deployment review"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decisionState
                ? `${workflowNames.get(decisionState.review.workflow_id) || "This workflow"} is waiting for a ${decisionState.review.target_environment} decision.`
                : "Choose whether this pending deployment review should continue."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] leading-6 text-slate-600">
              {decisionState?.action === "approve"
                ? "Approving will move the reviewed version onto the selected environment pointer immediately."
                : "Rejecting will keep the target environment unchanged and remove this review from the pending queue."}
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Review Comment
              </label>
              <Textarea
                value={decisionComment}
                onChange={(event) => setDecisionComment(event.target.value)}
                rows={4}
                placeholder={decisionState?.action === "approve" ? "Optional comment for the approval record" : "Optional reason for rejecting this handoff"}
                className="resize-none"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={reviewDecisionMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                submitDecision();
              }}
              disabled={reviewDecisionMutation.isPending}
              className={cn(decisionState?.action === "reject" && "bg-red-600 hover:bg-red-700")}
            >
              {reviewDecisionMutation.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : null}
              {decisionState?.action === "approve" ? "Approve review" : "Reject review"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnvironmentPage;
