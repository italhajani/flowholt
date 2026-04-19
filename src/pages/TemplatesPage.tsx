import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutTemplate, Search, Star, TrendingUp, ArrowRight,
  Zap, GitBranch, Bot, Database, Mail, BarChart3, Globe, Plus,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ── Category config ── */
const categories = [
  { id: "all",        label: "All" },
  { id: "popular",    label: "Popular" },
  { id: "new",        label: "New" },
  { id: "ai-ml",      label: "AI & ML" },
  { id: "devops",     label: "DevOps" },
  { id: "marketing",  label: "Marketing" },
  { id: "sales",      label: "Sales" },
  { id: "finance",    label: "Finance" },
  { id: "data",       label: "Data & ETL" },
  { id: "hr",         label: "HR & Ops" },
] as const;
type CategoryId = (typeof categories)[number]["id"];

const sortOptions = ["Most Popular", "Newest", "A–Z"] as const;
type SortOption = (typeof sortOptions)[number];

/* ── Template data ── */
interface Template {
  id: number;
  title: string;
  description: string;
  category: CategoryId;
  tags: string[];
  integrations: string[];
  uses: number;
  nodes: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isFree?: boolean;
}

const templates: Template[] = [
  {
    id: 1,
    title: "Lead Qualification & Scoring Pipeline",
    description: "Automatically enrich inbound leads, score them with AI, and route hot leads to Salesforce while notifying sales via Slack.",
    category: "sales",
    tags: ["AI", "CRM", "Webhook"],
    integrations: ["Typeform", "Clearbit", "OpenAI", "Salesforce", "Slack"],
    uses: 4820,
    nodes: 8,
    isFeatured: true,
    isFree: true,
  },
  {
    id: 2,
    title: "Slack → Google Sheets Activity Logger",
    description: "Log every Slack message from a channel to a Google Sheet with timestamp, author, and content.",
    category: "popular",
    tags: ["Logging", "Internal"],
    integrations: ["Slack", "Google Sheets"],
    uses: 3940,
    nodes: 3,
    isFree: true,
  },
  {
    id: 3,
    title: "AI Email Classifier & Auto-Router",
    description: "Classify incoming emails with GPT-4o and automatically route them to the right department, Slack channel, or ticketing system.",
    category: "ai-ml",
    tags: ["AI", "Email", "Automation"],
    integrations: ["Gmail", "OpenAI", "Slack", "Jira"],
    uses: 3210,
    nodes: 6,
    isFeatured: true,
    isFree: true,
  },
  {
    id: 4,
    title: "GitHub PR → Jira Ticket Sync",
    description: "Create or update a Jira issue whenever a GitHub PR is opened, merged, or closed.",
    category: "devops",
    tags: ["GitHub", "Jira", "CI/CD"],
    integrations: ["GitHub", "Jira"],
    uses: 2760,
    nodes: 5,
    isFree: true,
  },
  {
    id: 5,
    title: "Invoice Processing with OCR + AI",
    description: "Upload invoices, extract structured data via OCR, validate with AI, and push to QuickBooks automatically.",
    category: "finance",
    tags: ["OCR", "AI", "Finance"],
    integrations: ["Google Drive", "OpenAI", "QuickBooks"],
    uses: 2140,
    nodes: 7,
    isNew: true,
    isFree: false,
  },
  {
    id: 6,
    title: "Customer Onboarding Automation",
    description: "Trigger a multi-step onboarding sequence when a new user signs up: welcome email, CRM record, Slack alert, and task creation.",
    category: "marketing",
    tags: ["Onboarding", "Email", "CRM"],
    integrations: ["Stripe", "HubSpot", "Mailchimp", "Slack", "Asana"],
    uses: 1980,
    nodes: 9,
    isFree: true,
  },
  {
    id: 7,
    title: "Daily Slack Standup Summary",
    description: "Collect standup responses from a Slack form, summarize with AI, and post a digest to the channel every morning.",
    category: "marketing",
    tags: ["Slack", "AI", "Scheduling"],
    integrations: ["Slack", "OpenAI"],
    uses: 1750,
    nodes: 4,
    isFree: true,
  },
  {
    id: 8,
    title: "Webhook → Postgres + Redis Cache",
    description: "Receive webhook payloads, validate and transform data, write to Postgres, and invalidate Redis cache keys.",
    category: "data",
    tags: ["Database", "Webhook", "Cache"],
    integrations: ["Webhook", "Postgres", "Redis"],
    uses: 1430,
    nodes: 5,
    isFree: true,
  },
  {
    id: 9,
    title: "AI Customer Support Bot",
    description: "Deploy a support agent that queries your knowledge base, answers common questions, and escalates complex issues.",
    category: "ai-ml",
    tags: ["AI Agent", "Support", "RAG"],
    integrations: ["Intercom", "OpenAI", "Notion"],
    uses: 1320,
    nodes: 6,
    isNew: true,
    isFree: false,
  },
  {
    id: 10,
    title: "Stripe Payment → HubSpot Deal",
    description: "Create or update a HubSpot deal automatically when a Stripe payment succeeds or a subscription changes.",
    category: "sales",
    tags: ["Stripe", "CRM", "Revenue"],
    integrations: ["Stripe", "HubSpot"],
    uses: 1190,
    nodes: 4,
    isFree: true,
  },
  {
    id: 11,
    title: "Kubernetes Deployment Monitor",
    description: "Watch for pod failures, deployment rollouts, and cluster events; auto-create incidents in PagerDuty and notify Slack.",
    category: "devops",
    tags: ["K8s", "Monitoring", "Alerting"],
    integrations: ["Kubernetes", "PagerDuty", "Slack"],
    uses: 980,
    nodes: 7,
    isNew: true,
    isFree: false,
  },
  {
    id: 12,
    title: "Employee Offboarding Checklist",
    description: "When an employee leaves, revoke SSO access, archive their data, notify IT, and send the exit survey automatically.",
    category: "hr",
    tags: ["HR", "Security", "Offboarding"],
    integrations: ["Okta", "Google Workspace", "Slack", "SurveyMonkey"],
    uses: 870,
    nodes: 10,
    isFree: true,
  },
  {
    id: 13,
    title: "Social Media Post Scheduler",
    description: "Draft posts with AI, get human approval via a Slack message, then schedule and publish to Twitter/LinkedIn at optimal times.",
    category: "marketing",
    tags: ["Social", "AI", "Approval"],
    integrations: ["OpenAI", "Slack", "Twitter", "LinkedIn"],
    uses: 760,
    nodes: 6,
    isFree: true,
  },
  {
    id: 14,
    title: "Data Pipeline: S3 → BigQuery",
    description: "Pick up new files in S3, parse CSV/JSON, validate schema, and stream rows into BigQuery tables with error alerting.",
    category: "data",
    tags: ["ETL", "Cloud", "Analytics"],
    integrations: ["AWS S3", "BigQuery", "Slack"],
    uses: 650,
    nodes: 8,
    isNew: true,
    isFree: false,
  },
  {
    id: 15,
    title: "AI Meeting Transcription & Action Items",
    description: "Transcribe Zoom recordings, extract action items with AI, create Jira tasks, and email the summary to attendees.",
    category: "ai-ml",
    tags: ["AI", "Meetings", "Productivity"],
    integrations: ["Zoom", "OpenAI", "Jira", "Gmail"],
    uses: 540,
    nodes: 7,
    isNew: true,
    isFree: false,
  },
];

/* ── Featured templates (shown in hero strip) ── */
const featuredTemplates = templates.filter((t) => t.isFeatured);

/* ── Category icon mapping ── */
const categoryIcons: Record<string, React.ElementType> = {
  "ai-ml": Bot,
  devops: GitBranch,
  data: Database,
  marketing: Mail,
  sales: TrendingUp,
  finance: BarChart3,
  hr: Globe,
  popular: Zap,
  new: Plus,
  all: LayoutTemplate,
};

export function TemplatesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Most Popular");

  const filtered = templates
    .filter((t) => {
      if (activeCategory !== "all" && activeCategory !== "popular" && activeCategory !== "new" && t.category !== activeCategory) return false;
      if (activeCategory === "popular") return t.uses > 1500;
      if (activeCategory === "new") return !!t.isNew;
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.tags.join(" ").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !t.tags.join(" ").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Most Popular") return b.uses - a.uses;
      if (sortBy === "Newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="mx-auto max-w-[1080px] px-8 py-8">
      <PageHeader
        title="Templates"
        description="Browse and install pre-built workflow templates."
        actions={
          <Button variant="secondary" size="md">
            <Plus size={14} strokeWidth={2.5} />
            Submit Template
          </Button>
        }
      />

      {/* ── Featured hero strip ── */}
      {activeCategory === "all" && !searchQuery && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {featuredTemplates.map((t) => (
            <FeaturedCard key={t.id} template={t} onClick={() => navigate(`/templates/${t.id}`)} />
          ))}
        </div>
      )}

      {/* ── Controls bar ── */}
      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <Input
          prefix={<Search size={13} />}
          placeholder="Search templates, tags, integrations…"
          className="w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((c) => {
            const Icon = categoryIcons[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
                  activeCategory === c.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                )}
              >
                <Icon size={11} />
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-[12px] text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            {sortOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="mt-4 mb-3 text-[12px] text-zinc-400">
        {filtered.length} template{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* ── Template grid ── */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} onClick={() => navigate(`/templates/${t.id}`)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
            <LayoutTemplate size={28} strokeWidth={1.25} className="mb-3 text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500">No templates found</p>
            <p className="text-[12px] text-zinc-400 mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Featured card (hero strip) ── */
function FeaturedCard({ template: t, onClick }: { template: Template; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 cursor-pointer hover:border-zinc-300 transition-all duration-150"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant="neutral" className="bg-white/10 text-white border-white/20 text-[10px]">Featured</Badge>
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <TrendingUp size={10} /> {t.uses.toLocaleString()} uses
        </span>
      </div>
      <h3 className="text-[14px] font-semibold text-white leading-snug mb-1.5">{t.title}</h3>
      <p className="text-[12px] text-zinc-400 leading-relaxed line-clamp-2 mb-4">{t.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {t.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300">{tag}</span>
          ))}
        </div>
        <ArrowRight size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </div>
    </div>
  );
}

/* ── Regular template card (3-col grid) ── */
function TemplateCard({ template: t, onClick }: { template: Template; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col rounded-lg border border-zinc-100 bg-white p-4 shadow-xs cursor-pointer hover:shadow-sm hover:border-zinc-200 transition-all duration-150"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {t.isNew && <Badge variant="info" className="text-[10px]">New</Badge>}
          {!t.isFree && <Badge variant="warning" className="text-[10px]">Pro</Badge>}
        </div>
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <TrendingUp size={10} /> {t.uses.toLocaleString()}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-semibold text-zinc-800 leading-snug mb-1.5 line-clamp-2">{t.title}</h3>

      {/* Description */}
      <p className="text-[12px] text-zinc-400 leading-relaxed line-clamp-2 mb-3 flex-1">{t.description}</p>

      {/* Integration pills */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {t.integrations.slice(0, 4).map((int) => (
          <span key={int} className="rounded-md bg-zinc-50 border border-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{int}</span>
        ))}
        {t.integrations.length > 4 && (
          <span className="rounded-md bg-zinc-50 border border-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">+{t.integrations.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-50 pt-2.5">
        <span className="text-[11px] text-zinc-400">{t.nodes} nodes</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-zinc-700"
        >
          Use template
          <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}
