import React, { useEffect, useMemo, useState } from "react";
import TemplateCard, { type Template } from "@/components/dashboard/TemplateCard";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  X,
  Search,
  Star,
  Loader2,
} from "lucide-react";
import { api, type ApiTemplate } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { TemplatesLoader } from "@/components/dashboard/DashboardRouteLoader";

type RichTemplate = Template & {
  installs: string;
  owner: string;
  lastUpdated: string;
  outcome: string;
  tags: string[];
};

const categories = ["All", "Support", "Sales", "Revenue", "Communication", "Finance", "Marketing"];

const TemplatesPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const navigate = useNavigate();

  const { data: templates = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.listTemplates().then((data) => data.map(mapTemplate)),
  });
  const error = actionError || (queryError ? "Could not load templates" : null);

  // Tab transition loader
  useEffect(() => {
    if (!tabTransitioning) return;
    const timer = setTimeout(() => setTabTransitioning(false), 1000);
    return () => clearTimeout(timer);
  }, [tabTransitioning]);

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory = category === "All" || template.category === category;
      const matchesSearch =
        !search.trim() ||
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [category, search, templates]);

  const selectedTemplate = selectedId ? templates.find((item) => item.id === selectedId) ?? null : null;

  const handleCreateFromTemplate = async (templateId: string, templateName?: string) => {
    try {
      setActionLoading(true);
      const workflow = await api.createWorkflowFromTemplate(templateId, templateName ? `${templateName} Workflow` : undefined);
      navigate(`/studio/${workflow.id}`);
    } catch {
      setActionError("Could not create workflow from template");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    loading ? (
      <TemplatesLoader />
    ) : (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-6 pb-24 pt-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-[-0.01em]">Templates</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Launch workflows from proven starting points instead of rebuilding the same logic.</p>
      </div>

      {/* ── Category tab bar ───────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setTabTransitioning(true);
            }}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors",
              category === cat
                ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 after:rounded-full"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Search + action bar ────────────────────────────────────── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-200"
          />
        </div>
        <button
          onClick={() => {
            const firstTemplate = filtered[0];
            if (firstTemplate) handleCreateFromTemplate(firstTemplate.id, firstTemplate.name);
          }}
          disabled={actionLoading || filtered.length === 0}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpRight size={14} />}
          Create from template
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>}

      {/* ── Tab transition loader ─────────────────────────────────── */}
      {tabTransitioning && (
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="h-1.5 w-full rounded bg-slate-100 mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  <div className="h-5 w-14 rounded-full bg-slate-100" />
                </div>
                <div className="h-4 w-3/4 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-full rounded bg-slate-100 mb-1" />
                <div className="h-3 w-2/3 rounded bg-slate-100 mb-4" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-3 w-12 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Template grid ─────────────────────────────────────────── */}
      {!tabTransitioning && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={(id) => setSelectedId(id)}
                onUse={(id) => handleCreateFromTemplate(id, templates.find((t) => t.id === id)?.name)}
              />
            ))}
          </div>
          {filtered.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-slate-200 px-6 py-16 text-center">
              <div className="text-[14px] font-medium text-slate-700">No templates match this view</div>
              <div className="text-[13px] text-slate-400 mt-1">Try another category or remove the search filter.</div>
            </div>
          )}
        </>
      )}

      {/* ── Detail sidebar ────────────────────────────────────────── */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-slate-900/10" onClick={() => setSelectedId(null)}>
          <aside className="h-full w-[380px] overflow-y-auto border-l border-slate-200 bg-white p-5" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">{selectedTemplate.name}</div>
                <div className="text-[13px] text-slate-500 mt-1 leading-relaxed">{selectedTemplate.description}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Star size={14} className="text-amber-500 fill-amber-200" />
                <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" onClick={() => setSelectedId(null)}>
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="rounded-xl border border-slate-200 p-4 mb-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Details</div>
              <div className="space-y-2.5 text-[12px]">
                {[
                  ["Outcome", selectedTemplate.outcome],
                  ["Owner", selectedTemplate.owner],
                  ["Category", selectedTemplate.category],
                  ["Trigger", selectedTemplate.triggerType],
                  ["Setup time", selectedTemplate.estimatedTime],
                  ["Installs", selectedTemplate.installs],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-slate-600">
                    <span>{label}</span>
                    <span className="font-medium text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Included blocks */}
            <div className="rounded-xl bg-slate-50 p-4 mb-4">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Included blocks</div>
              <div className="space-y-2">
                {[
                  "Trigger and routing logic",
                  "Connection placeholders",
                  "Suggested variable schema",
                  "Recommended retries and guards",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {selectedTemplate.tags.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-1.5">
                {selectedTemplate.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <button
              onClick={() => handleCreateFromTemplate(selectedTemplate.id, selectedTemplate.name)}
              disabled={actionLoading}
              className="w-full h-10 rounded-lg bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              Use template <ArrowUpRight size={14} />
            </button>
            <button onClick={() => navigate(`/studio/${selectedTemplate.id}`)} className="w-full h-10 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors mt-2">
              Preview in studio
            </button>
          </aside>
        </div>
      )}
    </div>
    )
  );
};

export default TemplatesPage;

function mapTemplate(item: ApiTemplate): RichTemplate {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    triggerType: item.trigger_type,
    estimatedTime: item.estimated_time,
    complexity: item.complexity as RichTemplate["complexity"],
    integrationIcons: [],
    color: item.color,
    installs: item.installs,
    owner: item.owner,
    lastUpdated: "Recently updated",
    outcome: item.outcome,
    tags: item.tags,
  };
}
