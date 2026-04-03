import React, { useEffect, useMemo, useState } from "react";
import TemplateCard, { type Template } from "@/components/dashboard/TemplateCard";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle2,
  X,
  Filter,
  LayoutTemplate,
  Search,
  Star,
} from "lucide-react";
import { api, type ApiTemplate } from "@/lib/api";

type LibraryView = "discover" | "starter-kits" | "team-picks";

type RichTemplate = Template & {
  installs: string;
  owner: string;
  lastUpdated: string;
  outcome: string;
  tags: string[];
};

const views: { key: LibraryView; label: string }[] = [
  { key: "discover", label: "Discover" },
  { key: "starter-kits", label: "Starter kits" },
  { key: "team-picks", label: "Team picks" },
];

const categories = ["All", "Communication", "Developer", "Sales", "Finance", "Marketing", "Support"];
const collections = [
  { title: "Popular this week", blurb: "Templates copied most often by active teams." },
  { title: "AI-first workflows", blurb: "Prompt, classify, summarize, and decision-led flows." },
  { title: "Ops starters", blurb: "Practical templates for support, finance, and platform teams." },
];
const TemplatesPage: React.FC = () => {
  const [view, setView] = useState<LibraryView>("discover");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [collection, setCollection] = useState("Popular this week");
  const [selectedId, setSelectedId] = useState<string | null>("t7");
  const [templates, setTemplates] = useState<RichTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .listTemplates()
      .then((data) => {
        if (!active) return;
        setTemplates(data.map(mapTemplate));
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load templates");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory = category === "All" || template.category === category;
      const matchesSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      if (view === "starter-kits") {
        return matchesCategory && matchesSearch && template.complexity !== "Simple";
      }

      if (view === "team-picks") {
        return matchesCategory && matchesSearch && ["t1", "t3", "t7", "t9"].includes(template.id);
      }

      return matchesCategory && matchesSearch;
    });
  }, [category, search, view]);

  const selectedTemplate = selectedId ? templates.find((item) => item.id === selectedId) ?? filtered[0] ?? templates[0] ?? null : null;

  return (
    <div className="p-8 max-w-[1440px] mx-auto animate-fade-in pb-24">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="max-w-[760px]">
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-3">
            <LayoutTemplate size={14} className="text-slate-400" />
            Template library
          </div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Launch workflows from proven starting points instead of rebuilding the same logic.
          </h1>
          <p className="text-[14px] text-slate-500 mt-2">
            Curated templates for FlowHolt teams across support, revenue, finance, AI operations, and internal tooling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Submit template
          </button>
          <button className="h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
            Create starter flow
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
              {views.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={cn(
                    "flex-1 h-9 rounded-lg text-[12px] font-medium transition-colors",
                    view === item.key ? "bg-white text-slate-900 border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {collections.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setCollection(item.title)}
                  className={cn(
                    "px-3 h-9 rounded-lg text-[12px] font-medium transition-colors border whitespace-nowrap",
                    collection === item.title ? "bg-slate-100 border-slate-300 text-slate-900" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section>
          <div className="rounded-2xl bg-white border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-slate-200 min-w-[280px]">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search templates"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "px-3 h-9 rounded-lg border text-[12px] font-medium whitespace-nowrap transition-colors",
                      category === item
                        ? "border-slate-300 bg-slate-100 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                <Filter size={14} />
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 mt-5 text-[13px] text-red-700">{error}</div>
          ) : loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 mt-5 text-center text-[13px] text-slate-500">Loading templates...</div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
              {filtered.map((template) => (
                <div key={template.id} className="space-y-3">
                  <TemplateCard template={template} onClick={(id) => setSelectedId(id)} />
                  <div className="px-1">
                    <div className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="font-medium text-slate-800">{template.owner}</span>
                      <span className="text-slate-500">{template.installs} installs</span>
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1">{template.outcome}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      {template.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-slate-100 text-[11px] text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white border border-slate-200 px-6 py-16 text-center mt-5">
              <div className="text-[15px] font-semibold text-slate-900">No templates match this view</div>
              <div className="text-[13px] text-slate-500 mt-1">Try another category or remove the search filter.</div>
            </div>
          )}
        </section>
      </div>

      {selectedTemplate && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-slate-900/10 p-8" onClick={() => setSelectedId(null)}>
          <aside className="w-[360px] rounded-2xl bg-white border border-slate-200 p-5 mt-[180px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[16px] font-semibold text-slate-900">{selectedTemplate.name}</div>
                <div className="text-[13px] text-slate-500 mt-1">{selectedTemplate.description}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Star size={15} className="text-amber-500 fill-amber-200" />
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center" onClick={() => setSelectedId(null)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 mb-4">
              <div className="text-[13px] font-semibold text-slate-900 mb-3">Why teams use this</div>
              <div className="space-y-3 text-[12px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Primary outcome</span>
                  <span className="font-medium text-slate-900">{selectedTemplate.outcome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Owner</span>
                  <span className="font-medium text-slate-900">{selectedTemplate.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last updated</span>
                  <span className="font-medium text-slate-900">{selectedTemplate.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trigger</span>
                  <span className="font-medium text-slate-900">{selectedTemplate.triggerType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated setup</span>
                  <span className="font-medium text-slate-900">{selectedTemplate.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 mb-4">
              <div className="text-[13px] font-semibold text-slate-900 mb-3">Included blocks</div>
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

            <div className="rounded-2xl border border-slate-200 p-4 mb-5">
              <div className="text-[13px] font-semibold text-slate-900 mb-3">Connections used</div>
              <div className="grid grid-cols-2 gap-2 text-[12px]">
                {["Slack", "OpenAI", "Webhook", "Email"].map((item) => (
                  <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full h-11 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2">
              Use template <ArrowUpRight size={14} />
            </button>
            <button className="w-full h-11 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors mt-3">
              Preview in studio
            </button>
          </aside>
        </div>
      )}
    </div>
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
