import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiWorkflow, type ApiTriggerDetails } from "@/lib/api";
import {
  AlertCircle,
  Check,
  Copy,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  Webhook,
  Zap,
} from "lucide-react";

const WebhooksPage: React.FC = () => {
  const { data: webhookData, isLoading: loading } = useQuery({
    queryKey: ["webhooks-triggers"],
    queryFn: async () => {
      const wfs = await api.listWorkflows();
      const triggerable = wfs.filter((w) => w.trigger_type === "webhook" || w.trigger_type === "chat" || w.trigger_type === "schedule");
      const details: Record<string, ApiTriggerDetails> = {};
      await Promise.allSettled(
        triggerable.map(async (w) => {
          try {
            const d = await api.getWorkflowTriggerDetails(w.id);
            details[w.id] = d;
          } catch {}
        })
      );
      return { workflows: wfs, triggerMap: details };
    },
  });
  const workflows = webhookData?.workflows ?? [];
  const triggerMap = webhookData?.triggerMap ?? {};
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "webhook" | "chat" | "schedule" | "manual">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (filterType !== "all" && w.trigger_type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [workflows, filterType, search]);

  const webhookWorkflows = workflows.filter((w) => w.trigger_type === "webhook");
  const chatWorkflows = workflows.filter((w) => w.trigger_type === "chat");
  const scheduledWorkflows = workflows.filter((w) => w.trigger_type === "schedule");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const renderEndpoint = (label: string, value: string | null, copyKey: string, tone: "test" | "production") => {
    const toneClasses = tone === "test"
      ? "border-blue-100 bg-blue-50/70 text-blue-800"
      : "border-emerald-100 bg-emerald-50/70 text-emerald-800";

    return (
      <div className={cn("rounded-lg border px-2.5 py-2", toneClasses)}>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
          {value ? (
            <button
              onClick={() => copyToClipboard(value, copyKey)}
              className="shrink-0 rounded p-1 text-current/70 transition-colors hover:bg-white/70 hover:text-current"
              title={`Copy ${label}`}
            >
              {copiedId === copyKey ? <Check size={12} /> : <Copy size={12} />}
            </button>
          ) : null}
        </div>
        <div className="min-h-[18px] text-[11px] font-mono break-all">
          {value ?? (tone === "production" ? "Public webhooks disabled for this workspace." : "Unavailable")}
        </div>
      </div>
    );
  };

  const triggerBadge = (type: string) => {
    const styles: Record<string, string> = {
      webhook: "bg-purple-50 text-purple-700",
      chat: "bg-sky-50 text-sky-700",
      schedule: "bg-amber-50 text-amber-700",
      manual: "bg-slate-100 text-slate-600",
      event: "bg-blue-50 text-blue-700",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", styles[type] || "bg-slate-100 text-slate-500")}>
        {type}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700",
      draft: "bg-slate-100 text-slate-600",
      paused: "bg-amber-50 text-amber-700",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", styles[status] || "bg-slate-100 text-slate-500")}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1440px] mx-auto animate-fade-in">
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="text-slate-400 animate-spin" />
          <span className="text-[14px] text-slate-500">Loading webhooks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Webhooks & Triggers</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage webhook URLs, scheduled triggers, and workflow entry points.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Webhook size={14} className="text-purple-500" />
            <span className="text-[12px] font-semibold text-slate-500">Webhook workflows</span>
          </div>
          <div className="text-[24px] font-extrabold text-slate-900">{webhookWorkflows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-sky-500" />
            <span className="text-[12px] font-semibold text-slate-500">Chat workflows</span>
          </div>
          <div className="text-[24px] font-extrabold text-slate-900">{chatWorkflows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={14} className="text-amber-500" />
            <span className="text-[12px] font-semibold text-slate-500">Scheduled workflows</span>
          </div>
          <div className="text-[24px] font-extrabold text-slate-900">{scheduledWorkflows.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[#103b71]" />
            <span className="text-[12px] font-semibold text-slate-500">Total workflows</span>
          </div>
          <div className="text-[24px] font-extrabold text-slate-900">{workflows.length}</div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-emerald-500" />
          <span className="text-[12px] font-semibold text-slate-500">Active workflows</span>
        </div>
        <div className="text-[24px] font-extrabold text-emerald-700">
          {workflows.filter((w) => w.status === "active").length}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103b71]/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {(["all", "webhook", "chat", "schedule", "manual"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors capitalize",
                filterType === type ? "bg-[#103b71] text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Workflow list */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2.2fr_100px_100px_2fr_90px] gap-4 px-5 py-3 bg-slate-50/80 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Workflow</div>
          <div className="text-[11px] font-bold text-slate-500 uppercase">Trigger</div>
          <div className="text-[11px] font-bold text-slate-500 uppercase">Status</div>
          <div className="text-[11px] font-bold text-slate-500 uppercase">Endpoints / Schedule</div>
          <div className="text-[11px] font-bold text-slate-500 uppercase text-right">Actions</div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
            <div className="text-[14px] text-slate-500">No workflows match your filter.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredWorkflows.map((workflow) => {
              const trigger = triggerMap[workflow.id];
              const testWebhookUrl = trigger?.test_webhook_url || trigger?.webhook_url || null;
              const productionWebhookUrl = trigger?.production_webhook_url || null;
              const testChatUrl = trigger?.test_chat_url || trigger?.chat_url || null;
              const productionChatUrl = trigger?.production_chat_url || null;
              const publicChatStreamUrl = trigger?.public_chat_stream_url || null;
              const hostedChatUrl = trigger?.hosted_chat_url || null;
              const widgetScriptUrl = trigger?.widget_script_url || null;
              const widgetEmbedHtml = trigger?.widget_embed_html || null;
              const scheduleHint = trigger?.schedule_hint || null;

              return (
                <div key={workflow.id} className="grid grid-cols-[2.2fr_100px_100px_2fr_90px] gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 truncate">{workflow.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-mono truncate">{workflow.id}</span>
                      {trigger?.deployed_version_number ? (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          v{trigger.deployed_version_number}
                        </span>
                      ) : null}
                      {trigger?.exposure === "internal" && (workflow.trigger_type === "webhook" || workflow.trigger_type === "chat") ? (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          Internal only
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div>{triggerBadge(workflow.trigger_type)}</div>
                  <div>{statusBadge(workflow.status)}</div>
                  <div>
                    {workflow.trigger_type === "webhook" ? (
                      <div className="space-y-2">
                        {renderEndpoint("Test URL", testWebhookUrl, `${workflow.id}:test`, "test")}
                        {renderEndpoint("Production URL", productionWebhookUrl, `${workflow.id}:production`, "production")}
                        {trigger?.signature_header ? (
                          <div className="text-[10px] text-slate-500">
                            Signature header: <span className="font-mono">{trigger.signature_header}</span>
                            {trigger.webhook_secret_configured ? " configured" : " not configured"}
                          </div>
                        ) : null}
                      </div>
                    ) : workflow.trigger_type === "chat" ? (
                      <div className="space-y-2">
                        {renderEndpoint("Test Chat URL", testChatUrl, `${workflow.id}:chat:test`, "test")}
                        {renderEndpoint("Production Chat URL", productionChatUrl, `${workflow.id}:chat:production`, "production")}
                        {renderEndpoint("Streaming Chat URL", publicChatStreamUrl, `${workflow.id}:chat:stream`, "production")}
                        {renderEndpoint("Hosted Chat Page", hostedChatUrl, `${workflow.id}:chat:hosted`, "production")}
                        {renderEndpoint("Widget Script", widgetScriptUrl, `${workflow.id}:chat:widget-script`, "production")}
                        <div className="text-[10px] text-slate-500">
                          {trigger?.chat_mode ? `Mode: ${trigger.chat_mode}` : "Mode: hosted"}
                          {trigger?.chat_authentication ? ` • Auth: ${trigger.chat_authentication}` : ""}
                          {trigger?.chat_response_mode ? ` • Response: ${trigger.chat_response_mode}` : ""}
                        </div>
                        {(trigger?.chat_title || trigger?.chat_subtitle) ? (
                          <div className="text-[10px] text-slate-500">
                            {trigger?.chat_title ?? "Untitled chat"}
                            {trigger?.chat_subtitle ? ` — ${trigger.chat_subtitle}` : ""}
                          </div>
                        ) : null}
                        {widgetEmbedHtml ? (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Embed Snippet</span>
                              <button
                                onClick={() => copyToClipboard(widgetEmbedHtml, `${workflow.id}:chat:widget-html`)}
                                className="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                                title="Copy embed snippet"
                              >
                                {copiedId === `${workflow.id}:chat:widget-html` ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </div>
                            <code className="block text-[11px] font-mono break-all text-slate-700">{widgetEmbedHtml}</code>
                          </div>
                        ) : null}
                      </div>
                    ) : scheduleHint ? (
                      <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-[12px] text-amber-800">
                        {scheduleHint}
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-400">—</span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    {workflow.trigger_type === "webhook" && (
                      <button
                        onClick={() => api.triggerWorkflowWebhook(workflow.id, { test: true }).catch(() => {})}
                        className="h-7 px-2.5 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trigger URL format help */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-[16px] font-bold text-slate-900 mb-3">Trigger URL Format</div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Test URL</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              POST /api/triggers/webhook/&#123;workflow_id&#125;
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              Internal test endpoint for validating a workflow webhook from the dashboard or studio.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Production URL</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              POST /api/webhooks/&#123;workspace_id&#125;/&#123;workflow_id&#125;
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              Public endpoint for external systems once webhook exposure is enabled for the workspace.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Chat URL</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              POST /api/chat/&#123;workspace_id&#125;/&#123;workflow_id&#125;
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              Public chat trigger endpoint for hosted or embedded chat workflows after the workflow is published.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Hosted Chat Page</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              /chat/&#123;workspace_id&#125;/&#123;workflow_id&#125;
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              Hosted public chat surface for sharing a first-party UI or embedding it in an iframe.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Streaming Chat URL</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              POST /api/chat/&#123;workspace_id&#125;/&#123;workflow_id&#125;/stream
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              SSE endpoint for streaming public chat responses in custom browser clients and embeds.
            </p>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-700 mb-2">Widget Loader</div>
            <code className="block p-3 rounded-lg bg-slate-50 border border-slate-100 text-[12px] font-mono text-slate-700">
              &lt;script src="/flowholt-chat-widget.js" data-workspace-id="..." data-workflow-id="..." async&gt;&lt;/script&gt;
            </code>
            <p className="text-[12px] text-slate-500 mt-2">
              Drop-in widget script that mounts the public chat as a popup or inline iframe without building a custom UI.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-[12px] text-amber-800">
            <strong>Security:</strong> Webhook production endpoints support HMAC signatures, and public chat triggers now apply trigger-level allowed-origin settings to metadata, POST, and streaming routes. Hosted chat pages remain iframe-friendly, while raw browser integrations are limited to the origins configured on the trigger.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhooksPage;
