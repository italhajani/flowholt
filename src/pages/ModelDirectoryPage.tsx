import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  Image,
  MessageSquare,
  Code,
  Mic,
  Eye,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";
import { useModels } from "@/hooks/useApi";
import type { ModelInfo } from "@/lib/api";

/* ── Types ── */
interface AIModel {
  id: string;
  name: string;
  provider: string;
  providerIcon: string;
  modality: ("text" | "image" | "audio" | "code" | "vision" | "embedding")[];
  contextWindow: string;
  maxOutput: string;
  latencyTier: "fast" | "standard" | "slow";
  costTier: "free" | "low" | "medium" | "high" | "premium";
  status: "available" | "limited" | "deprecated";
  description: string;
  usedByAgents: number;
  usedByWorkflows: number;
  featured?: boolean;
  badge?: string;
}

const mockModels: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["text", "vision", "code", "audio"],
    contextWindow: "128K",
    maxOutput: "16K",
    latencyTier: "standard",
    costTier: "high",
    status: "available",
    description: "Most capable multimodal model from OpenAI. Supports text, vision, audio, and code.",
    usedByAgents: 3,
    usedByWorkflows: 12,
    featured: true,
    badge: "Popular",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["text", "vision", "code"],
    contextWindow: "128K",
    maxOutput: "16K",
    latencyTier: "fast",
    costTier: "low",
    status: "available",
    description: "Fast and affordable model for most tasks. Great for high-volume automations.",
    usedByAgents: 1,
    usedByWorkflows: 8,
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    providerIcon: "🟠",
    modality: ["text", "vision", "code"],
    contextWindow: "200K",
    maxOutput: "64K",
    latencyTier: "standard",
    costTier: "high",
    status: "available",
    description: "Anthropic's balanced model with excellent reasoning and large context window.",
    usedByAgents: 2,
    usedByWorkflows: 6,
    featured: true,
    badge: "New",
  },
  {
    id: "claude-4-haiku",
    name: "Claude 4 Haiku",
    provider: "Anthropic",
    providerIcon: "🟠",
    modality: ["text", "vision", "code"],
    contextWindow: "200K",
    maxOutput: "8K",
    latencyTier: "fast",
    costTier: "low",
    status: "available",
    description: "Fastest Claude model. Ideal for routing, classification, and simple tasks.",
    usedByAgents: 0,
    usedByWorkflows: 3,
  },
  {
    id: "claude-4-opus",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    providerIcon: "🟠",
    modality: ["text", "vision", "code"],
    contextWindow: "200K",
    maxOutput: "32K",
    latencyTier: "slow",
    costTier: "premium",
    status: "available",
    description: "Most capable Claude model for complex analysis, research, and multi-step reasoning.",
    usedByAgents: 1,
    usedByWorkflows: 2,
    badge: "Premium",
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    providerIcon: "🔵",
    modality: ["text", "vision", "code", "audio"],
    contextWindow: "1M",
    maxOutput: "8K",
    latencyTier: "fast",
    costTier: "low",
    status: "available",
    description: "Google's fastest multimodal model with a 1M token context window.",
    usedByAgents: 0,
    usedByWorkflows: 4,
    badge: "1M Context",
  },
  {
    id: "gemini-2-pro",
    name: "Gemini 2.0 Pro",
    provider: "Google",
    providerIcon: "🔵",
    modality: ["text", "vision", "code"],
    contextWindow: "2M",
    maxOutput: "8K",
    latencyTier: "standard",
    costTier: "medium",
    status: "available",
    description: "Google's advanced reasoning model with massive 2M context window.",
    usedByAgents: 0,
    usedByWorkflows: 1,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    providerIcon: "🟣",
    modality: ["text", "code"],
    contextWindow: "128K",
    maxOutput: "8K",
    latencyTier: "standard",
    costTier: "low",
    status: "available",
    description: "Open-source leader with strong coding and reasoning capabilities at low cost.",
    usedByAgents: 0,
    usedByWorkflows: 2,
  },
  {
    id: "text-embedding-3-large",
    name: "text-embedding-3-large",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["embedding"],
    contextWindow: "8K",
    maxOutput: "—",
    latencyTier: "fast",
    costTier: "low",
    status: "available",
    description: "High-quality text embeddings for RAG, search, and classification.",
    usedByAgents: 2,
    usedByWorkflows: 5,
  },
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["image"],
    contextWindow: "—",
    maxOutput: "—",
    latencyTier: "slow",
    costTier: "medium",
    status: "available",
    description: "State-of-the-art image generation from text prompts.",
    usedByAgents: 0,
    usedByWorkflows: 1,
  },
  {
    id: "whisper-v3",
    name: "Whisper V3",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["audio"],
    contextWindow: "—",
    maxOutput: "—",
    latencyTier: "standard",
    costTier: "low",
    status: "available",
    description: "Speech-to-text transcription supporting 100+ languages.",
    usedByAgents: 0,
    usedByWorkflows: 2,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    providerIcon: "🟢",
    modality: ["text"],
    contextWindow: "16K",
    maxOutput: "4K",
    latencyTier: "fast",
    costTier: "free",
    status: "deprecated",
    description: "Legacy model. Recommended to migrate to GPT-4o Mini.",
    usedByAgents: 0,
    usedByWorkflows: 0,
    badge: "Deprecated",
  },
];

/* ── Filters ── */
const providers = ["All", "OpenAI", "Anthropic", "Google", "DeepSeek"] as const;
const modalities = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "text", label: "Text", icon: MessageSquare },
  { id: "vision", label: "Vision", icon: Eye },
  { id: "code", label: "Code", icon: Code },
  { id: "image", label: "Image", icon: Image },
  { id: "audio", label: "Audio", icon: Mic },
  { id: "embedding", label: "Embedding", icon: Zap },
] as const;

const latencyColors = { fast: "text-green-600 bg-green-50", standard: "text-blue-600 bg-blue-50", slow: "text-amber-600 bg-amber-50" };
const costLabels = { free: "Free", low: "$", medium: "$$", high: "$$$", premium: "$$$$" };
const costColors = { free: "text-green-600", low: "text-green-600", medium: "text-blue-600", high: "text-amber-600", premium: "text-red-600" };

export function ModelDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("All");
  const [selectedModality, setSelectedModality] = useState<string>("all");

  const { data: apiModels } = useModels();

  const models: AIModel[] = useMemo(() => {
    if (apiModels && apiModels.length > 0) {
      return apiModels.map((m: ModelInfo) => ({
        id: m.id,
        name: m.name,
        provider: m.provider,
        providerIcon: m.provider === "OpenAI" ? "🟢" : m.provider === "Anthropic" ? "🟠" : m.provider === "Google" ? "🔵" : m.provider === "Groq" ? "⚡" : "🟣",
        modality: m.modality as AIModel["modality"],
        contextWindow: m.contextWindow,
        maxOutput: m.maxOutput,
        latencyTier: m.latencyTier,
        costTier: m.costTier,
        status: m.status,
        description: m.description,
        usedByAgents: 0,
        usedByWorkflows: 0,
        featured: m.featured,
        badge: m.featured ? "Free" : undefined,
      }));
    }
    return mockModels;
  }, [apiModels]);

  const filtered = models.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.provider.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedProvider !== "All" && m.provider !== selectedProvider) return false;
    if (selectedModality !== "all" && !m.modality.includes(selectedModality as any)) return false;
    return true;
  });

  const stats = {
    total: models.length,
    available: models.filter((m) => m.status === "available").length,
    providers: new Set(models.map((m) => m.provider)).size,
  };

  return (
    <div className="mx-auto max-w-[1100px] px-8 py-8">
      <PageHeader
        title="Model Directory"
        description="Browse and compare AI models available across your connected providers."
        actions={
          <Button variant="primary" size="md">
            <SlidersHorizontal size={14} />
            Manage Providers
          </Button>
        }
      />

      {/* Stats bar */}
      <div className="mt-5 flex items-center gap-6 text-[12px] text-zinc-500">
        <span><span className="font-semibold text-zinc-800">{stats.total}</span> models</span>
        <span><span className="font-semibold text-green-600">{stats.available}</span> available</span>
        <span><span className="font-semibold text-zinc-800">{stats.providers}</span> providers</span>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models…"
            className="pl-9"
          />
        </div>

        {/* Provider pills */}
        <div className="flex items-center gap-1.5">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium transition-all",
                selectedProvider === p
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Modality pills */}
        <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-3">
          {modalities.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModality(mod.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all",
                selectedModality === mod.id
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              <mod.icon size={12} />
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 text-[12px] text-zinc-400 mb-3">
        {filtered.length} model{filtered.length !== 1 ? "s" : ""}
      </div>

      <div className="space-y-2">
        {filtered.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
            <Sparkles size={28} className="text-zinc-300 mb-3" />
            <p className="text-[14px] font-medium text-zinc-500">No models match your filters</p>
            <p className="text-[12px] text-zinc-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Model Card ── */
function ModelCard({ model }: { model: AIModel }) {
  const modalityIcons: Record<string, typeof MessageSquare> = {
    text: MessageSquare,
    vision: Eye,
    code: Code,
    image: Image,
    audio: Mic,
    embedding: Zap,
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-xl border bg-white px-5 py-4 transition-all hover:shadow-sm",
        model.status === "deprecated"
          ? "border-zinc-200 opacity-60"
          : model.featured
            ? "border-zinc-200 shadow-xs"
            : "border-zinc-100"
      )}
    >
      {/* Provider icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-[18px]">
        {model.providerIcon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-zinc-900">{model.name}</h3>
          {model.badge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                model.badge === "Deprecated"
                  ? "bg-red-50 text-red-600"
                  : model.badge === "New"
                    ? "bg-blue-50 text-blue-600"
                    : model.badge === "Popular"
                      ? "bg-green-50 text-green-600"
                      : model.badge === "Premium"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-zinc-100 text-zinc-600"
              )}
            >
              {model.badge}
            </span>
          )}
          <span className="text-[11px] text-zinc-400">{model.provider}</span>
        </div>

        <p className="mt-1 text-[12px] text-zinc-500 leading-relaxed">{model.description}</p>

        {/* Modality pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {model.modality.map((mod) => {
            const Icon = modalityIcons[mod] || Sparkles;
            return (
              <span
                key={mod}
                className="flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500"
              >
                <Icon size={10} />
                {mod}
              </span>
            );
          })}
        </div>
      </div>

      {/* Specs */}
      <div className="flex flex-shrink-0 items-start gap-6 text-[12px]">
        <div className="text-center">
          <p className="text-zinc-400 mb-1">Context</p>
          <p className="font-semibold text-zinc-800">{model.contextWindow}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400 mb-1">Output</p>
          <p className="font-semibold text-zinc-800">{model.maxOutput}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400 mb-1">Speed</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", latencyColors[model.latencyTier])}>
            {model.latencyTier}
          </span>
        </div>
        <div className="text-center">
          <p className="text-zinc-400 mb-1">Cost</p>
          <span className={cn("text-[12px] font-semibold", costColors[model.costTier])}>
            {costLabels[model.costTier]}
          </span>
        </div>
        <div className="text-center">
          <p className="text-zinc-400 mb-1">Status</p>
          <StatusDot
            status={model.status === "available" ? "success" : model.status === "limited" ? "warning" : "failed"}
            label={model.status}
          />
        </div>
      </div>
    </div>
  );
}
