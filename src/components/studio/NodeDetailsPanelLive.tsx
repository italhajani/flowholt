import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  Code,
  Copy,
  Filter,
  GitBranch,
  Globe,
  HelpCircle,
  KeyRound,
  Loader2,
  Merge,
  MessageSquarePlus,
  Minus,
  Play,
  Plus,
  Repeat,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Webhook,
  X,
  Users,
  Clock3,
  Link2,
  Sliders,
  Database,
  Brain,
  Cpu,
  Zap,
  FileText,
  Settings,
  Search,
  ToggleLeft,
} from "lucide-react";
import type {
  ApiNodeConfigValidationResponse,
  ApiNodeEditorField,
  ApiNodeEditorResponse,
  ApiNodePreviewResponse,
  ApiWorkflowEdge,
  ApiWorkflowStep,
} from "@/lib/api";
import { api } from "@/lib/api";

/* ─────────────────────────────── Interfaces ─────────────────────────────── */

interface NodeDetailsPanelLiveProps {
  workflowId?: string | null;
  workflowName: string;
  triggerType?: string | null;
  step: ApiWorkflowStep | null;
  steps: ApiWorkflowStep[];
  edges: ApiWorkflowEdge[];
  saving: boolean;
  onSave: (step: ApiWorkflowStep) => void;
  onConnectionsChange: (
    stepId: string,
    targets: { defaultTarget?: string; trueTarget?: string; falseTarget?: string },
  ) => void;
  onDuplicate: (step: ApiWorkflowStep) => void;
  onDelete: (stepId: string) => void;
  onMove: (stepId: string, direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onClose: () => void;
  onTestStep?: (step: ApiWorkflowStep, payload: Record<string, unknown>) => Promise<StepTestResult>;
}

interface StepTestResult {
  status: "success" | "failed" | "error";
  output?: Record<string, unknown> | null;
  error?: string | null;
  duration_ms: number;
}

type TabId = "setup" | "configure" | "test";

/* ─────────────────────────────── Node type meta ─────────────────────────── */

const typeMeta: Record<string, { icon: React.ElementType; subtitle: string; iconClass: string; iconBg: string }> = {
  trigger: { icon: Webhook, subtitle: "Trigger", iconClass: "text-sky-600", iconBg: "bg-sky-50" },
  transform: { icon: Sparkles, subtitle: "Transform", iconClass: "text-amber-600", iconBg: "bg-amber-50" },
  condition: { icon: GitBranch, subtitle: "Condition", iconClass: "text-emerald-600", iconBg: "bg-emerald-50" },
  llm: { icon: Bot, subtitle: "AI / LLM", iconClass: "text-violet-600", iconBg: "bg-violet-50" },
  output: { icon: Send, subtitle: "Output", iconClass: "text-rose-600", iconBg: "bg-rose-50" },
  delay: { icon: Clock3, subtitle: "Delay", iconClass: "text-slate-600", iconBg: "bg-slate-50" },
  human: { icon: Users, subtitle: "Human Task", iconClass: "text-fuchsia-600", iconBg: "bg-fuchsia-50" },
  callback: { icon: Link2, subtitle: "Callback Wait", iconClass: "text-cyan-600", iconBg: "bg-cyan-50" },
  loop: { icon: Repeat, subtitle: "Loop / Iterator", iconClass: "text-teal-600", iconBg: "bg-teal-50" },
  code: { icon: Code, subtitle: "Code / Script", iconClass: "text-indigo-600", iconBg: "bg-indigo-50" },
  http_request: { icon: Globe, subtitle: "HTTP Request", iconClass: "text-blue-600", iconBg: "bg-blue-50" },
  filter: { icon: Filter, subtitle: "Filter", iconClass: "text-orange-600", iconBg: "bg-orange-50" },
  merge: { icon: Merge, subtitle: "Merge", iconClass: "text-pink-600", iconBg: "bg-pink-50" },
  ai_agent: { icon: Brain, subtitle: "AI Agent", iconClass: "text-purple-600", iconBg: "bg-purple-50" },
};

const getTypeMeta = (type: string) => typeMeta[type] ?? typeMeta.transform;

const prettyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (v) => v.toUpperCase());

const normalizeKeyValuePairs = (value: unknown): { key: string; value: string }[] => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object") {
        const pair = item as { key?: unknown; value?: unknown };
        return { key: String(pair.key ?? ""), value: String(pair.value ?? "") };
      }
      return { key: "", value: String(item ?? "") };
    });
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => ({
      key: entryKey,
      value: String(entryValue ?? ""),
    }));
  }
  return [];
};

const normalizeMessages = (value: unknown): { role: string; content: string }[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => {
    if (item && typeof item === "object") {
      const message = item as { role?: unknown; content?: unknown };
      return {
        role: String(message.role ?? "user"),
        content: String(message.content ?? ""),
      };
    }
    return { role: "user", content: String(item ?? "") };
  });
};

const getShowWhenExpectedValue = (showWhen: ApiNodeEditorField["show_when"]) => {
  if (!showWhen) {
    return undefined;
  }
  return showWhen.equals !== undefined ? showWhen.equals : showWhen.value;
};

const shouldShowEditorField = (field: ApiNodeEditorField, config: Record<string, unknown>) => {
  if (!field.show_when) {
    return true;
  }
  return config[field.show_when.field] === getShowWhenExpectedValue(field.show_when);
};

/* ─────────────────────────────── Model lists per provider ──────────────── */

const MODEL_OPTIONS: Record<string, { value: string; label: string; desc: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o", desc: "Most capable, multimodal" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Fast & affordable" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", desc: "128K context" },
    { value: "gpt-4", label: "GPT-4", desc: "Original GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", desc: "Legacy, fast" },
    { value: "o1", label: "o1", desc: "Reasoning model" },
    { value: "o1-mini", label: "o1-mini", desc: "Small reasoning" },
    { value: "o3-mini", label: "o3-mini", desc: "Latest reasoning" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", desc: "Best balance" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", desc: "Ultra-fast" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus", desc: "Most capable" },
  ],
  gemini: [
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "Most capable" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "Fastest" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "Fast multimodal" },
  ],
  groq: [
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", desc: "Versatile" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B", desc: "Instant" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", desc: "32K context" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B", desc: "Efficient" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat", desc: "General purpose" },
    { value: "deepseek-coder", label: "DeepSeek Coder", desc: "Code specialist" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner", desc: "R1 reasoning" },
  ],
  xai: [
    { value: "grok-3", label: "Grok 3", desc: "Latest Grok" },
    { value: "grok-3-mini", label: "Grok 3 Mini", desc: "Fast Grok" },
  ],
  ollama: [
    { value: "llama3", label: "Llama 3", desc: "Local LLM" },
    { value: "mistral", label: "Mistral", desc: "Local 7B" },
    { value: "codellama", label: "Code Llama", desc: "Code model" },
    { value: "phi3", label: "Phi-3", desc: "Microsoft" },
  ],
  together: [
    { value: "meta-llama/Llama-3-70b-chat-hf", label: "Llama 3 70B", desc: "Meta" },
    { value: "mistralai/Mixtral-8x22B-Instruct-v0.1", label: "Mixtral 8x22B", desc: "MoE" },
  ],
  custom: [
    { value: "default", label: "Default Model", desc: "Custom endpoint" },
  ],
};

/* ─────────────────────────────── Shared field components ─────────────────── */

const FieldLabel: React.FC<{ label: string; required?: boolean; help?: string }> = ({ label, required, help }) => (
  <div className="mb-1.5 flex items-center gap-1.5">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
    {help && (
      <span title={help} className="cursor-help">
        <HelpCircle size={10} className="text-slate-300 hover:text-slate-500 transition-colors" />
      </span>
    )}
  </div>
);

const FieldText: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }> = ({ value, onChange, placeholder, disabled }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  />
);

const FieldTextarea: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; mono?: boolean }> = ({ value, onChange, placeholder, rows = 3, mono }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] leading-5 text-slate-800 outline-none resize-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all ${mono ? "font-mono text-[11px]" : ""}`}
  />
);

const FieldSelect: React.FC<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }> = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

const FieldModelSelect: React.FC<{
  provider: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ provider, value, onChange }) => {
  const models = MODEL_OPTIONS[provider] ?? MODEL_OPTIONS.openai;
  return (
    <div className="space-y-1">
      {models.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${
            value === m.value
              ? "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            value === m.value ? "border-violet-500 bg-violet-500" : "border-slate-300 bg-white"
          }`}>
            {value === m.value && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-slate-800">{m.label}</div>
            <div className="text-[10px] text-slate-400">{m.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

const FieldNumber: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }> = ({ value, onChange, min, max, step = 1, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
    />
    {suffix && <span className="shrink-0 text-[11px] text-slate-400">{suffix}</span>}
  </div>
);

const FieldSlider: React.FC<{ value: number; onChange: (v: number) => void; min: number; max: number; step: number; label?: string }> = ({ value, onChange, min, max, step, label }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      {label && <span className="text-[10px] text-slate-500">{label}</span>}
      <span className="text-[12px] font-mono font-medium text-violet-600">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-slate-200 cursor-pointer accent-violet-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
    />
    <div className="flex justify-between text-[9px] text-slate-300">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const FieldToggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }> = ({ checked, onChange, label, help }) => (
  <div className="flex items-center justify-between gap-2 py-1">
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[11px] text-slate-700">{label}</span>
      {help && (
        <span title={help} className="cursor-help shrink-0">
          <HelpCircle size={10} className="text-slate-300 hover:text-slate-500 transition-colors" />
        </span>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-violet-600" : "bg-slate-200"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? "translate-x-[18px]" : "translate-x-[3px]"
      }`} />
    </button>
  </div>
);

const FieldCredential: React.FC<{
  value: string;
  onChange: (v: string) => void;
  credentials: { id: string; name: string; provider?: string }[];
}> = ({ value, onChange, credentials }) => (
  <div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
      >
        <option value="">Default (Free credits)</option>
        {credentials.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}{c.provider ? ` (${c.provider})` : ""}
          </option>
        ))}
      </select>
      <KeyRound size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
    <a
      href="/dashboard/credentials"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 transition-colors"
    >
      <Plus size={10} />
      Connect new credential
    </a>
  </div>
);

const FieldTags: React.FC<{ value: string[]; onChange: (v: string[]) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] text-violet-700">
            {tag}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-violet-400 hover:text-violet-600">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            onChange([...value, input.trim()]);
            setInput("");
          }
        }}
        placeholder={placeholder ?? "Add tag + Enter"}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-800 outline-none focus:border-violet-400 transition-colors"
      />
    </div>
  );
};

const FieldKeyValue: React.FC<{
  value: { key: string; value: string }[];
  onChange: (v: { key: string; value: string }[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}> = ({ value, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }) => (
  <div className="space-y-1.5">
    {value.map((pair, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <input
          value={pair.key}
          onChange={(e) => { const u = [...value]; u[i] = { ...pair, key: e.target.value }; onChange(u); }}
          placeholder={keyPlaceholder}
          className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-800 outline-none focus:border-violet-400 transition-colors"
        />
        <input
          value={pair.value}
          onChange={(e) => { const u = [...value]; u[i] = { ...pair, value: e.target.value }; onChange(u); }}
          placeholder={valuePlaceholder}
          className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-800 outline-none focus:border-violet-400 transition-colors"
        />
        <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <Minus size={12} />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { key: "", value: "" }])}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-slate-200 px-2 text-[11px] text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-colors"
    >
      <Plus size={12} /> Add Row
    </button>
  </div>
);

const FieldMessages: React.FC<{
  value: { role: string; content: string }[];
  onChange: (v: { role: string; content: string }[]) => void;
}> = ({ value, onChange }) => (
  <div className="space-y-2">
    {value.map((msg, i) => (
      <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <select
            value={msg.role}
            onChange={(e) => { const u = [...value]; u[i] = { ...msg, role: e.target.value }; onChange(u); }}
            className="h-7 flex-shrink-0 appearance-none rounded-md border border-slate-200 bg-white px-2 pr-6 text-[11px] text-slate-700 outline-none focus:border-violet-400 cursor-pointer"
          >
            <option value="system">System</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
          <div className="flex-1" />
          <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Minus size={12} />
          </button>
        </div>
        <textarea
          value={msg.content}
          onChange={(e) => { const u = [...value]; u[i] = { ...msg, content: e.target.value }; onChange(u); }}
          placeholder="Message content…"
          className="min-h-[48px] w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] leading-4 text-slate-800 outline-none resize-none focus:border-violet-400 transition-colors"
        />
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { role: "user", content: "" }])}
      className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-slate-200 px-2 text-[11px] text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-colors"
    >
      <MessageSquarePlus size={12} /> Add Message
    </button>
  </div>
);

/* ─────────────────────── Collapsible Section ────────────────────────────── */

const Section: React.FC<{
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, icon: SectionIcon, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 pt-2">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-1.5 py-1 text-left group">
        {open ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
        {SectionIcon && <SectionIcon size={12} className="text-slate-400" />}
        <span className="text-[11px] font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">{title}</span>
        {badge && <span className="ml-auto text-[10px] text-slate-300">{badge}</span>}
      </button>
      {open && <div className="mt-2 space-y-3 pl-0.5">{children}</div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PER-NODE-TYPE CONFIGURE PANELS
   Each function renders the unique configuration UI for that node type.
   ═══════════════════════════════════════════════════════════════════════════ */

function ConfigureTrigger({ config, onChange, credentials }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void; credentials: { id: string; name: string; provider?: string }[] }) {
  const source = String(config.source ?? "manual");
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Trigger Source" required />
        <FieldSelect value={source} onChange={(v) => onChange("source", v)} options={[
          { value: "manual", label: "Manual" },
          { value: "webhook", label: "Webhook" },
          { value: "schedule", label: "Schedule" },
          { value: "event", label: "Event" },
          { value: "form", label: "Form Submission" },
          { value: "email", label: "Email (IMAP)" },
        ]} />
      </div>

      {source === "webhook" && (
        <>
          <div>
            <FieldLabel label="HTTP Method" />
            <FieldSelect value={String(config.method ?? "POST")} onChange={(v) => onChange("method", v)} options={[
              { value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "PATCH", label: "PATCH" }, { value: "DELETE", label: "DELETE" },
            ]} />
          </div>
          <div>
            <FieldLabel label="Webhook Path" help="URL path for the webhook endpoint" />
            <FieldText value={String(config.path ?? "/webhook")} onChange={(v) => onChange("path", v)} placeholder="/webhook/my-flow" />
          </div>
          <div>
            <FieldLabel label="Authentication" />
            <FieldSelect value={String(config.auth ?? "none")} onChange={(v) => onChange("auth", v)} options={[
              { value: "none", label: "None" }, { value: "api_key", label: "API Key" }, { value: "basic", label: "Basic Auth" }, { value: "bearer", label: "Bearer Token" },
            ]} />
          </div>
          <FieldToggle checked={config.verify_signature === true} onChange={(v) => onChange("verify_signature", v)} label="Verify Webhook Signature" help="Verify the webhook signature header for security" />
        </>
      )}

      {source === "schedule" && (
        <>
          <div>
            <FieldLabel label="Frequency" />
            <FieldSelect value={String(config.frequency ?? "hourly")} onChange={(v) => onChange("frequency", v)} options={[
              { value: "every_5m", label: "Every 5 minutes" }, { value: "every_15m", label: "Every 15 minutes" }, { value: "every_30m", label: "Every 30 minutes" },
              { value: "hourly", label: "Every hour" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "custom", label: "Custom (cron)" },
            ]} />
          </div>
          {String(config.frequency) === "custom" && (
            <div>
              <FieldLabel label="Cron Expression" help="Standard 5-field cron expression" />
              <FieldText value={String(config.cron ?? "0 * * * *")} onChange={(v) => onChange("cron", v)} placeholder="0 * * * *" />
            </div>
          )}
          <div>
            <FieldLabel label="Timezone" />
            <FieldSelect value={String(config.timezone ?? "UTC")} onChange={(v) => onChange("timezone", v)} options={[
              { value: "UTC", label: "UTC" }, { value: "America/New_York", label: "Eastern (US)" }, { value: "America/Chicago", label: "Central (US)" },
              { value: "America/Los_Angeles", label: "Pacific (US)" }, { value: "Europe/London", label: "London" }, { value: "Europe/Berlin", label: "Berlin" },
              { value: "Asia/Tokyo", label: "Tokyo" }, { value: "Asia/Shanghai", label: "Shanghai" }, { value: "Asia/Kolkata", label: "India (IST)" },
            ]} />
          </div>
        </>
      )}

      {source === "email" && (
        <>
          <div>
            <FieldLabel label="IMAP Credential" />
            <FieldCredential value={String(config.credential_id ?? "")} onChange={(v) => onChange("credential_id", v)} credentials={credentials} />
          </div>
          <div>
            <FieldLabel label="Mailbox" />
            <FieldText value={String(config.mailbox ?? "INBOX")} onChange={(v) => onChange("mailbox", v)} />
          </div>
          <FieldToggle checked={config.mark_read === true} onChange={(v) => onChange("mark_read", v)} label="Mark as Read" />
        </>
      )}
    </div>
  );
}

function ConfigureLLM({ config, onChange, credentials }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void; credentials: { id: string; name: string; provider?: string }[] }) {
  const provider = String(config.provider ?? "openai");
  const model = String(config.model ?? "gpt-4o");
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Provider" required />
        <FieldSelect value={provider} onChange={(v) => { onChange("provider", v); const firstModel = (MODEL_OPTIONS[v] ?? MODEL_OPTIONS.openai)[0]; if (firstModel) onChange("model", firstModel.value); }}
          options={[
            { value: "openai", label: "OpenAI" }, { value: "anthropic", label: "Anthropic" }, { value: "gemini", label: "Google Gemini" },
            { value: "groq", label: "Groq" }, { value: "deepseek", label: "DeepSeek" }, { value: "xai", label: "xAI (Grok)" },
            { value: "ollama", label: "Ollama (Local)" }, { value: "together", label: "Together AI" }, { value: "custom", label: "Custom Endpoint" },
          ]} />
      </div>

      <div>
        <FieldLabel label="Credential" help="API key for the selected provider" />
        <FieldCredential value={String(config.credential_id ?? "")} onChange={(v) => onChange("credential_id", v)} credentials={credentials} />
      </div>

      <div>
        <FieldLabel label="Model" required help="Select the AI model to use" />
        <FieldModelSelect provider={provider} value={model} onChange={(v) => onChange("model", v)} />
      </div>

      {provider === "custom" && (
        <div>
          <FieldLabel label="Base URL" required help="OpenAI-compatible API endpoint" />
          <FieldText value={String(config.base_url ?? "")} onChange={(v) => onChange("base_url", v)} placeholder="https://your-server.com/v1" />
        </div>
      )}

      <div>
        <FieldLabel label="Prompt" required />
        <FieldTextarea value={String(config.prompt ?? "")} onChange={(v) => onChange("prompt", v)} placeholder="Describe what this AI step should do. Use {{variable}} for data from previous steps." rows={4} />
      </div>

      <Section title="Model Parameters" icon={Sliders} defaultOpen>
        <div>
          <FieldLabel label="Temperature" help="Controls randomness. Lower = more deterministic, higher = more creative." />
          <FieldSlider value={Number(config.temperature ?? 0.7)} onChange={(v) => onChange("temperature", v)} min={0} max={2} step={0.05} />
        </div>
        <div>
          <FieldLabel label="Max Tokens" help="Maximum tokens in the response" />
          <FieldNumber value={Number(config.max_tokens ?? 4096)} onChange={(v) => onChange("max_tokens", v)} min={1} max={128000} suffix="tokens" />
        </div>
        <div>
          <FieldLabel label="Top P" help="Nucleus sampling: limit token selection to top probability mass" />
          <FieldSlider value={Number(config.top_p ?? 1.0)} onChange={(v) => onChange("top_p", v)} min={0} max={1} step={0.05} />
        </div>
        <div>
          <FieldLabel label="Frequency Penalty" help="Reduce repetition of recently used tokens" />
          <FieldSlider value={Number(config.frequency_penalty ?? 0)} onChange={(v) => onChange("frequency_penalty", v)} min={-2} max={2} step={0.1} />
        </div>
        <div>
          <FieldLabel label="Presence Penalty" help="Encourage the model to talk about new topics" />
          <FieldSlider value={Number(config.presence_penalty ?? 0)} onChange={(v) => onChange("presence_penalty", v)} min={-2} max={2} step={0.1} />
        </div>
      </Section>

      <Section title="System Message & Examples" icon={MessageSquarePlus}>
        <div>
          <FieldLabel label="System Message" help="Set the AI's personality, role, and instructions" />
          <FieldTextarea value={String(config.system_message ?? "")} onChange={(v) => onChange("system_message", v)} placeholder="You are a helpful assistant that..." rows={3} />
        </div>
        <div>
          <FieldLabel label="Stop Sequences" help="Tokens that signal the model to stop generating" />
          <FieldTags value={Array.isArray(config.stop_sequences) ? config.stop_sequences as string[] : []} onChange={(v) => onChange("stop_sequences", v)} placeholder="Add stop sequence + Enter" />
        </div>
      </Section>

      <Section title="Output Parsing" icon={FileText}>
        <div>
          <FieldLabel label="Output Format" />
          <FieldSelect value={String(config.output_format ?? "text")} onChange={(v) => onChange("output_format", v)} options={[
            { value: "text", label: "Plain Text" }, { value: "json", label: "JSON Object" }, { value: "markdown", label: "Markdown" },
          ]} />
        </div>
        <div>
          <FieldLabel label="Store Result As" help="Context key where the output is stored" />
          <FieldText value={String(config.output_key ?? "llm_response")} onChange={(v) => onChange("output_key", v)} placeholder="llm_response" />
        </div>
      </Section>

      <Section title="Advanced" icon={Settings}>
        <FieldToggle checked={config.streaming === true} onChange={(v) => onChange("streaming", v)} label="Stream Response" help="Stream tokens incrementally for faster perceived response" />
        <FieldToggle checked={config.cache_response === true} onChange={(v) => onChange("cache_response", v)} label="Cache Response" help="Cache identical inputs to save API costs" />
        {config.cache_response === true && (
          <div>
            <FieldLabel label="Cache TTL" help="How long to cache the response (seconds)" />
            <FieldNumber value={Number(config.cache_ttl ?? 3600)} onChange={(v) => onChange("cache_ttl", v)} min={60} max={86400} suffix="sec" />
          </div>
        )}
      </Section>

      <Section title="Vision & Multimodal" icon={Search}>
        <FieldToggle checked={config.vision_enabled === true} onChange={(v) => onChange("vision_enabled", v)} label="Enable Vision" help="Send images to the model for visual analysis (GPT-4o, Claude, Gemini)" />
        {config.vision_enabled === true && (
          <>
            <div>
              <FieldLabel label="Image Source" help="Where to get the image from" />
              <FieldSelect value={String(config.image_source ?? "url")} onChange={(v) => onChange("image_source", v)} options={[
                { value: "url", label: "Image URL" }, { value: "base64", label: "Base64 Data" }, { value: "variable", label: "From Variable" },
              ]} />
            </div>
            <div>
              <FieldLabel label={String(config.image_source) === "variable" ? "Variable Name" : "Image URL / Data"} />
              <FieldText value={String(config.image_input ?? "")} onChange={(v) => onChange("image_input", v)} placeholder={String(config.image_source) === "variable" ? "{{previous_step.image}}" : "https://example.com/image.png"} />
            </div>
            <div>
              <FieldLabel label="Detail Level" help="Controls image resolution sent to the model" />
              <FieldSelect value={String(config.image_detail ?? "auto")} onChange={(v) => onChange("image_detail", v)} options={[
                { value: "auto", label: "Auto" }, { value: "low", label: "Low (faster, cheaper)" }, { value: "high", label: "High (more detail)" },
              ]} />
            </div>
          </>
        )}
      </Section>

      <Section title="Function Calling" icon={Zap}>
        <FieldToggle checked={config.function_calling === true} onChange={(v) => onChange("function_calling", v)} label="Enable Function Calling" help="Allow the model to call pre-defined functions/tools" />
        {config.function_calling === true && (
          <>
            <div>
              <FieldLabel label="Tool Choice" help="How the model decides which function to call" />
              <FieldSelect value={String(config.tool_choice ?? "auto")} onChange={(v) => onChange("tool_choice", v)} options={[
                { value: "auto", label: "Auto – Model decides" }, { value: "required", label: "Required – Must call a function" },
                { value: "none", label: "None – No function calls" },
              ]} />
            </div>
            <FieldToggle checked={config.parallel_tool_calls !== false} onChange={(v) => onChange("parallel_tool_calls", v)} label="Parallel Tool Calls" help="Allow multiple function calls in one response" />
            <div>
              <FieldLabel label="Functions (JSON)" help="Array of function definitions in OpenAI format" />
              <FieldTextarea value={String(config.functions_json ?? "[]")} onChange={(v) => onChange("functions_json", v)} mono rows={5} placeholder='[{"name":"get_weather","description":"Get weather for a city","parameters":{"type":"object","properties":{"city":{"type":"string"}}}}]' />
            </div>
          </>
        )}
      </Section>

      <Section title="Response Format" icon={FileText}>
        <div>
          <FieldLabel label="Response Type" help="Enforce a specific output structure" />
          <FieldSelect value={String(config.response_format ?? "text")} onChange={(v) => onChange("response_format", v)} options={[
            { value: "text", label: "Plain Text" }, { value: "json_object", label: "JSON Object" },
            { value: "json_schema", label: "JSON Schema (Structured)" },
          ]} />
        </div>
        {String(config.response_format) === "json_schema" && (
          <div>
            <FieldLabel label="JSON Schema" help="Define the exact structure and field types for the response" />
            <FieldTextarea value={String(config.response_schema ?? '{"type":"object","properties":{}}')} onChange={(v) => onChange("response_schema", v)} mono rows={5} placeholder='{"type":"object","properties":{"answer":{"type":"string"},"confidence":{"type":"number"}}}' />
          </div>
        )}
      </Section>

      {provider === "openai" && ["o1", "o1-mini", "o3-mini"].includes(model) && (
        <Section title="Reasoning Settings" icon={Brain}>
          <div>
            <FieldLabel label="Reasoning Effort" help="How much effort the model puts into reasoning (o1/o3 models)" />
            <FieldSelect value={String(config.reasoning_effort ?? "medium")} onChange={(v) => onChange("reasoning_effort", v)} options={[
              { value: "low", label: "Low – Faster, less thorough" }, { value: "medium", label: "Medium – Balanced" }, { value: "high", label: "High – Most thorough" },
            ]} />
          </div>
        </Section>
      )}

      <Section title="Safety & Guardrails" icon={Shield}>
        <FieldToggle checked={config.content_filter === true} onChange={(v) => onChange("content_filter", v)} label="Content Filter" help="Filter harmful or inappropriate outputs" />
        <div>
          <FieldLabel label="Max Retries" help="Retry on transient API errors" />
          <FieldNumber value={Number(config.max_retries ?? 2)} onChange={(v) => onChange("max_retries", v)} min={0} max={10} />
        </div>
        <div>
          <FieldLabel label="Timeout" help="Maximum wait time for a response" />
          <FieldNumber value={Number(config.timeout ?? 60)} onChange={(v) => onChange("timeout", v)} min={5} max={600} suffix="sec" />
        </div>
        <FieldToggle checked={config.log_prompt === true} onChange={(v) => onChange("log_prompt", v)} label="Log Prompts" help="Include the full prompt in execution logs (may contain sensitive data)" />
      </Section>
    </div>
  );
}

function ConfigureAIAgent({ config, onChange, credentials }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void; credentials: { id: string; name: string; provider?: string }[] }) {
  const provider = String(config.provider ?? "openai");
  const model = String(config.model ?? "gpt-4o");
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Agent Type" required help="The reasoning strategy the agent uses" />
        <FieldSelect value={String(config.agent_type ?? "conversational")} onChange={(v) => onChange("agent_type", v)} options={[
          { value: "conversational", label: "Conversational Agent" },
          { value: "openai_functions", label: "OpenAI Functions Agent" },
          { value: "react", label: "ReAct Agent" },
          { value: "plan_and_execute", label: "Plan & Execute Agent" },
        ]} />
      </div>

      <div>
        <FieldLabel label="LLM Provider" required />
        <FieldSelect value={provider} onChange={(v) => { onChange("provider", v); const first = (MODEL_OPTIONS[v] ?? MODEL_OPTIONS.openai)[0]; if (first) onChange("model", first.value); }}
          options={[
            { value: "openai", label: "OpenAI" }, { value: "anthropic", label: "Anthropic" }, { value: "gemini", label: "Google Gemini" },
            { value: "groq", label: "Groq" }, { value: "deepseek", label: "DeepSeek" },
          ]} />
      </div>

      <div>
        <FieldLabel label="Credential" />
        <FieldCredential value={String(config.credential_id ?? "")} onChange={(v) => onChange("credential_id", v)} credentials={credentials} />
      </div>

      <div>
        <FieldLabel label="Model" required />
        <FieldModelSelect provider={provider} value={model} onChange={(v) => onChange("model", v)} />
      </div>

      <div>
        <FieldLabel label="System Message" help="Instructions that define the agent's role and behavior" />
        <FieldTextarea value={String(config.system_message ?? "You are a helpful AI assistant.")} onChange={(v) => onChange("system_message", v)} rows={3} />
      </div>

      <div>
        <FieldLabel label="User Prompt" required help="The task or question. Use {{variable}} for data." />
        <FieldTextarea value={String(config.prompt ?? "")} onChange={(v) => onChange("prompt", v)} placeholder="Analyze the customer inquiry and determine the best response." rows={4} />
      </div>

      <Section title="Tools & Abilities" icon={Zap} defaultOpen>
        <div>
          <FieldLabel label="Available Tools" help="Tools the agent can use during reasoning (e.g. web_search, calculator)" />
          <FieldTags value={Array.isArray(config.tools) ? config.tools as string[] : []} onChange={(v) => onChange("tools", v)} placeholder="Add tool name + Enter" />
        </div>
        <FieldToggle checked={config.allow_code_execution === true} onChange={(v) => onChange("allow_code_execution", v)} label="Allow Code Execution" help="Let the agent run code snippets" />
        <FieldToggle checked={config.allow_web_search === true} onChange={(v) => onChange("allow_web_search", v)} label="Allow Web Search" help="Let the agent search the web" />
        <FieldToggle checked={config.allow_file_access === true} onChange={(v) => onChange("allow_file_access", v)} label="Allow File Access" help="Let the agent read and write files" />
        <FieldToggle checked={config.allow_api_calls === true} onChange={(v) => onChange("allow_api_calls", v)} label="Allow API Calls" help="Let the agent make HTTP requests" />
      </Section>

      <Section title="Sub-Agents (Cluster)" icon={Users} defaultOpen={Array.isArray(config.sub_agents) && (config.sub_agents as unknown[]).length > 0}>
        <div className="text-[10px] text-slate-400 mb-2">Add specialized sub-agents that this agent can delegate to. Creates a cluster of cooperating AI agents.</div>
        {(Array.isArray(config.sub_agents) ? config.sub_agents as { name: string; role: string; model: string; provider: string }[] : []).map((sa, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 space-y-2 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Brain size={12} className="text-purple-500" />
                <span className="text-[11px] font-medium text-slate-700">{sa.name || `Sub-Agent ${i + 1}`}</span>
              </div>
              <button onClick={() => { const u = [...(config.sub_agents as unknown[])]; u.splice(i, 1); onChange("sub_agents", u); }} className="text-slate-400 hover:text-red-500"><Minus size={12} /></button>
            </div>
            <input value={sa.name} onChange={(e) => { const u = [...(config.sub_agents as { name: string; role: string; model: string; provider: string }[])]; u[i] = { ...sa, name: e.target.value }; onChange("sub_agents", u); }} placeholder="Agent name" className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] outline-none focus:border-violet-400" />
            <textarea value={sa.role} onChange={(e) => { const u = [...(config.sub_agents as { name: string; role: string; model: string; provider: string }[])]; u[i] = { ...sa, role: e.target.value }; onChange("sub_agents", u); }} placeholder="Role/instructions for this sub-agent…" className="min-h-[40px] w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] outline-none resize-none focus:border-violet-400" />
            <div className="grid grid-cols-2 gap-1.5">
              <select value={sa.provider} onChange={(e) => { const u = [...(config.sub_agents as { name: string; role: string; model: string; provider: string }[])]; u[i] = { ...sa, provider: e.target.value, model: (MODEL_OPTIONS[e.target.value] ?? MODEL_OPTIONS.openai)[0]?.value ?? "" }; onChange("sub_agents", u); }} className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] outline-none cursor-pointer">
                <option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option><option value="groq">Groq</option><option value="deepseek">DeepSeek</option>
              </select>
              <select value={sa.model} onChange={(e) => { const u = [...(config.sub_agents as { name: string; role: string; model: string; provider: string }[])]; u[i] = { ...sa, model: e.target.value }; onChange("sub_agents", u); }} className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[10px] outline-none cursor-pointer">
                {(MODEL_OPTIONS[sa.provider] ?? MODEL_OPTIONS.openai).map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onChange("sub_agents", [...(Array.isArray(config.sub_agents) ? config.sub_agents as unknown[] : []), { name: "", role: "", model: "gpt-4o", provider: "openai" }])} className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-slate-200 px-2 text-[11px] text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-colors">
          <Plus size={12} /> Add Sub-Agent
        </button>
        {Array.isArray(config.sub_agents) && (config.sub_agents as unknown[]).length > 0 && (
          <div className="mt-2">
            <FieldLabel label="Delegation Strategy" help="How the main agent assigns tasks to sub-agents" />
            <FieldSelect value={String(config.delegation_strategy ?? "auto")} onChange={(v) => onChange("delegation_strategy", v)} options={[
              { value: "auto", label: "Auto – Agent decides" }, { value: "round_robin", label: "Round Robin" },
              { value: "parallel", label: "Parallel – All at once" }, { value: "sequential", label: "Sequential – One by one" },
            ]} />
          </div>
        )}
      </Section>

      <Section title="Agent Settings" icon={Sliders}>
        <div>
          <FieldLabel label="Max Iterations" help="Maximum reasoning loops before stopping" />
          <FieldSlider value={Number(config.max_iterations ?? 10)} onChange={(v) => onChange("max_iterations", v)} min={1} max={50} step={1} />
        </div>
        <div>
          <FieldLabel label="Temperature" />
          <FieldSlider value={Number(config.temperature ?? 0.7)} onChange={(v) => onChange("temperature", v)} min={0} max={2} step={0.05} />
        </div>
        <div>
          <FieldLabel label="Max Tokens" />
          <FieldNumber value={Number(config.max_tokens ?? 4096)} onChange={(v) => onChange("max_tokens", v)} min={1} max={128000} suffix="tokens" />
        </div>
        <FieldToggle checked={config.return_intermediate_steps === true} onChange={(v) => onChange("return_intermediate_steps", v)} label="Return Intermediate Steps" help="Include agent's reasoning in output (useful for debugging)" />
      </Section>

      <Section title="Memory" icon={Database}>
        <FieldToggle checked={config.memory_enabled === true} onChange={(v) => onChange("memory_enabled", v)} label="Enable Memory" help="Track conversation history across executions" />
        {config.memory_enabled === true && (
          <>
            <div>
              <FieldLabel label="Memory Type" />
              <FieldSelect value={String(config.memory_type ?? "buffer")} onChange={(v) => onChange("memory_type", v)} options={[
                { value: "buffer", label: "Buffer – Keep last N messages" },
                { value: "summary", label: "Summary – Compress history" },
                { value: "window", label: "Window – Sliding window" },
              ]} />
            </div>
            <div>
              <FieldLabel label="Window Size" help="Number of messages to retain" />
              <FieldNumber value={Number(config.memory_window ?? 10)} onChange={(v) => onChange("memory_window", v)} min={1} max={100} />
            </div>
          </>
        )}
      </Section>

      <Section title="Output" icon={FileText}>
        <div>
          <FieldLabel label="Output Format" />
          <FieldSelect value={String(config.output_format ?? "text")} onChange={(v) => onChange("output_format", v)} options={[
            { value: "text", label: "Plain Text" }, { value: "json", label: "JSON Object" }, { value: "markdown", label: "Markdown" },
          ]} />
        </div>
        <div>
          <FieldLabel label="Store Result As" />
          <FieldText value={String(config.output_key ?? "agent_response")} onChange={(v) => onChange("output_key", v)} />
        </div>
      </Section>
    </div>
  );
}

function ConfigureCondition({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Condition Mode" required />
        <FieldSelect value={String(config.mode ?? "expression")} onChange={(v) => onChange("mode", v)} options={[
          { value: "expression", label: "Expression (field comparison)" },
          { value: "code", label: "Code (JavaScript expression)" },
          { value: "regex", label: "Regex Match" },
        ]} />
      </div>

      {String(config.mode ?? "expression") === "expression" && (
        <>
          <div>
            <FieldLabel label="Field" required help="The data field to evaluate" />
            <FieldText value={String(config.field ?? "")} onChange={(v) => onChange("field", v)} placeholder="e.g. payload.status" />
          </div>
          <div>
            <FieldLabel label="Operator" required />
            <FieldSelect value={String(config.operator ?? "equals")} onChange={(v) => onChange("operator", v)} options={[
              { value: "equals", label: "Equals" }, { value: "not_equals", label: "Not Equals" },
              { value: "contains", label: "Contains" }, { value: "not_contains", label: "Not Contains" },
              { value: "gt", label: "Greater Than" }, { value: "gte", label: "Greater Than or Equal" },
              { value: "lt", label: "Less Than" }, { value: "lte", label: "Less Than or Equal" },
              { value: "is_empty", label: "Is Empty" }, { value: "is_not_empty", label: "Is Not Empty" },
              { value: "starts_with", label: "Starts With" }, { value: "ends_with", label: "Ends With" },
              { value: "in", label: "In List" }, { value: "regex", label: "Matches Regex" },
            ]} />
          </div>
          <div>
            <FieldLabel label="Value" required />
            <FieldText value={String(config.equals ?? "")} onChange={(v) => onChange("equals", v)} placeholder="Expected value" />
          </div>
          <FieldToggle checked={config.case_sensitive === true} onChange={(v) => onChange("case_sensitive", v)} label="Case Sensitive" />
        </>
      )}

      {String(config.mode ?? "expression") === "code" && (
        <div>
          <FieldLabel label="Expression" required help="JavaScript expression that returns true or false" />
          <FieldTextarea value={String(config.expression ?? "")} onChange={(v) => onChange("expression", v)} mono placeholder='payload.score > 0.8 && payload.status === "active"' rows={3} />
        </div>
      )}

      {String(config.mode ?? "expression") === "regex" && (
        <>
          <div>
            <FieldLabel label="Field" required />
            <FieldText value={String(config.field ?? "")} onChange={(v) => onChange("field", v)} placeholder="e.g. payload.email" />
          </div>
          <div>
            <FieldLabel label="Pattern" required help="Regular expression pattern" />
            <FieldText value={String(config.pattern ?? "")} onChange={(v) => onChange("pattern", v)} placeholder="^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$" />
          </div>
        </>
      )}
    </div>
  );
}

function ConfigureTransform({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Mode" />
        <FieldSelect value={String(config.mode ?? "template")} onChange={(v) => onChange("mode", v)} options={[
          { value: "template", label: "Template (Interpolation)" },
          { value: "mapping", label: "Field Mapping" },
          { value: "jq", label: "JQ Expression" },
          { value: "javascript", label: "JavaScript" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Template" required help="Use {{variable}} to reference data from previous steps" />
        <FieldTextarea value={String(config.template ?? "")} onChange={(v) => onChange("template", v)} placeholder="{{message}}" rows={4} mono={String(config.mode) === "jq" || String(config.mode) === "javascript"} />
      </div>
      <FieldToggle checked={config.keep_only_set === true} onChange={(v) => onChange("keep_only_set", v)} label="Keep Only Set Fields" help="Discard all original data and keep only transformed fields" />
      <div>
        <FieldLabel label="Store Result As" />
        <FieldText value={String(config.output_key ?? "transformed")} onChange={(v) => onChange("output_key", v)} />
      </div>
    </div>
  );
}

function ConfigureHTTP({ config, onChange, credentials }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void; credentials: { id: string; name: string; provider?: string }[] }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Method" required />
        <FieldSelect value={String(config.method ?? "GET")} onChange={(v) => onChange("method", v)} options={[
          { value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" },
          { value: "PATCH", label: "PATCH" }, { value: "DELETE", label: "DELETE" }, { value: "HEAD", label: "HEAD" },
        ]} />
      </div>
      <div>
        <FieldLabel label="URL" required />
        <FieldText value={String(config.url ?? "")} onChange={(v) => onChange("url", v)} placeholder="https://api.example.com/v1/resource" />
      </div>

      <Section title="Authentication" icon={KeyRound} defaultOpen>
        <div>
          <FieldLabel label="Auth Type" />
          <FieldSelect value={String(config.auth_type ?? "none")} onChange={(v) => onChange("auth_type", v)} options={[
            { value: "none", label: "No Authentication" }, { value: "api_key", label: "API Key" },
            { value: "bearer", label: "Bearer Token" }, { value: "basic", label: "Basic Auth" },
            { value: "oauth2", label: "OAuth 2.0" }, { value: "credential", label: "Stored Credential" },
          ]} />
        </div>
        {String(config.auth_type) === "credential" && (
          <div>
            <FieldLabel label="Credential" />
            <FieldCredential value={String(config.credential_id ?? "")} onChange={(v) => onChange("credential_id", v)} credentials={credentials} />
          </div>
        )}
        {String(config.auth_type) === "bearer" && (
          <div>
            <FieldLabel label="Token" />
            <FieldText value={String(config.bearer_token ?? "")} onChange={(v) => onChange("bearer_token", v)} placeholder="your-token-here" />
          </div>
        )}
        {String(config.auth_type) === "api_key" && (
          <>
            <div>
              <FieldLabel label="Header Name" />
              <FieldText value={String(config.api_key_header ?? "X-API-Key")} onChange={(v) => onChange("api_key_header", v)} />
            </div>
            <div>
              <FieldLabel label="API Key" />
              <FieldText value={String(config.api_key_value ?? "")} onChange={(v) => onChange("api_key_value", v)} placeholder="••••••" />
            </div>
          </>
        )}
      </Section>

      <Section title="Headers" icon={FileText}>
        <FieldKeyValue
          value={Array.isArray(config.headers) ? config.headers as { key: string; value: string }[] : []}
          onChange={(v) => onChange("headers", v)}
          keyPlaceholder="Header Name"
          valuePlaceholder="Header Value"
        />
      </Section>

      {["POST", "PUT", "PATCH"].includes(String(config.method ?? "GET")) && (
        <Section title="Request Body" icon={FileText} defaultOpen>
          <div>
            <FieldLabel label="Body Type" />
            <FieldSelect value={String(config.body_type ?? "json")} onChange={(v) => onChange("body_type", v)} options={[
              { value: "json", label: "JSON" }, { value: "form", label: "Form Data" },
              { value: "raw", label: "Raw Text" }, { value: "none", label: "None" },
            ]} />
          </div>
          {String(config.body_type ?? "json") !== "none" && (
            <div>
              <FieldLabel label="Body" />
              <FieldTextarea value={String(config.body ?? "")} onChange={(v) => onChange("body", v)} placeholder='{ "key": "value" }' rows={5} mono />
            </div>
          )}
        </Section>
      )}

      <Section title="Response" icon={Settings}>
        <div>
          <FieldLabel label="Extract With" />
          <FieldSelect value={String(config.response_extract ?? "full")} onChange={(v) => onChange("response_extract", v)} options={[
            { value: "full", label: "Full Response" }, { value: "jsonpath", label: "JSONPath" },
            { value: "jq", label: "JQ" }, { value: "regex", label: "Regex" },
          ]} />
        </div>
        {String(config.response_extract) !== "full" && (
          <div>
            <FieldLabel label="Expression" />
            <FieldText value={String(config.response_expression ?? "")} onChange={(v) => onChange("response_expression", v)} placeholder="$.data.items" />
          </div>
        )}
        <FieldToggle checked={config.follow_redirects !== false} onChange={(v) => onChange("follow_redirects", v)} label="Follow Redirects" />
        <FieldToggle checked={config.ignore_ssl === true} onChange={(v) => onChange("ignore_ssl", v)} label="Ignore SSL Errors" help="Skip TLS certificate validation (not recommended for production)" />
      </Section>

      <Section title="Pagination" icon={Repeat}>
        <FieldToggle checked={config.pagination_enabled === true} onChange={(v) => onChange("pagination_enabled", v)} label="Enable Pagination" help="Automatically fetch all pages of results" />
        {config.pagination_enabled === true && (
          <>
            <div>
              <FieldLabel label="Pagination Method" />
              <FieldSelect value={String(config.pagination_method ?? "offset")} onChange={(v) => onChange("pagination_method", v)} options={[
                { value: "offset", label: "Offset / Limit" }, { value: "cursor", label: "Cursor / Next Token" },
                { value: "link_header", label: "Link Header" }, { value: "page_number", label: "Page Number" },
              ]} />
            </div>
            <div>
              <FieldLabel label="Max Pages" />
              <FieldNumber value={Number(config.max_pages ?? 10)} onChange={(v) => onChange("max_pages", v)} min={1} max={1000} />
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

function ConfigureCode({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Language" required />
        <FieldSelect value={String(config.language ?? "python")} onChange={(v) => onChange("language", v)} options={[
          { value: "python", label: "Python" }, { value: "javascript", label: "JavaScript" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Script" required />
        <textarea
          value={String(config.script ?? "")}
          onChange={(e) => onChange("script", e.target.value)}
          spellCheck={false}
          className="min-h-[180px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-[11px] leading-5 text-emerald-400 outline-none resize-y font-mono"
          placeholder={String(config.language ?? "python") === "python"
            ? "# Access: payload, context, items\nresult = {'processed': True}"
            : "// Access: payload, context, items\nreturn { processed: true };"}
        />
      </div>
      <Section title="Runtime" icon={Cpu}>
        <div>
          <FieldLabel label="Timeout" />
          <FieldNumber value={Number(config.timeout ?? 30)} onChange={(v) => onChange("timeout", v)} min={1} max={300} suffix="sec" />
        </div>
        <div>
          <FieldLabel label="Memory Limit" />
          <FieldNumber value={Number(config.memory_mb ?? 128)} onChange={(v) => onChange("memory_mb", v)} min={64} max={2048} suffix="MB" />
        </div>
        <FieldToggle checked={config.sandbox === true || config.sandbox == null} onChange={(v) => onChange("sandbox", v)} label="Run in Sandbox" help="Restrict network and filesystem access" />
      </Section>
    </div>
  );
}

function ConfigureDelay({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Delay Mode" />
        <FieldSelect value={String(config.mode ?? "fixed")} onChange={(v) => onChange("mode", v)} options={[
          { value: "fixed", label: "Fixed Delay" }, { value: "until", label: "Until Date/Time" },
          { value: "webhook_resume", label: "Wait for Webhook" },
        ]} />
      </div>
      {String(config.mode ?? "fixed") === "fixed" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel label="Duration" />
            <FieldNumber value={Number(config.minutes ?? config.hours ? Number(config.hours) * 60 : 15)} onChange={(v) => onChange("minutes", v)} min={1} max={10080} />
          </div>
          <div>
            <FieldLabel label="Unit" />
            <FieldSelect value={String(config.unit ?? "minutes")} onChange={(v) => onChange("unit", v)} options={[
              { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" },
              { value: "hours", label: "Hours" }, { value: "days", label: "Days" },
            ]} />
          </div>
        </div>
      )}
      {String(config.mode) === "until" && (
        <div>
          <FieldLabel label="Resume At" help="Workflow pauses until this date/time" />
          <FieldText value={String(config.resume_at ?? "")} onChange={(v) => onChange("resume_at", v)} placeholder="2025-01-15T09:00:00Z" />
        </div>
      )}
      <FieldToggle checked={config.resume_on_restart !== false} onChange={(v) => onChange("resume_on_restart", v)} label="Resume After Restart" help="Continue waiting even if the server restarts" />
    </div>
  );
}

function ConfigureHuman({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Task Title" required />
        <FieldText value={String(config.title ?? "")} onChange={(v) => onChange("title", v)} placeholder="Approval required" />
      </div>
      <div>
        <FieldLabel label="Instructions" required help="Detailed instructions shown to the assignee" />
        <FieldTextarea value={String(config.instructions ?? "")} onChange={(v) => onChange("instructions", v)} placeholder="Review this data and choose an action." rows={3} />
      </div>
      <div>
        <FieldLabel label="Choices" required help="Options presented to the assignee" />
        <FieldTags value={Array.isArray(config.choices) ? config.choices as string[] : ["approved", "rejected"]} onChange={(v) => onChange("choices", v)} />
      </div>
      <div>
        <FieldLabel label="Assignee Role" />
        <FieldSelect value={String(config.assignee_role ?? "admin")} onChange={(v) => onChange("assignee_role", v)} options={[
          { value: "admin", label: "Admin" }, { value: "builder", label: "Builder" },
          { value: "reviewer", label: "Reviewer" }, { value: "operator", label: "Operator" },
        ]} />
      </div>
      <Section title="Timeouts & Escalation" icon={Clock3}>
        <div>
          <FieldLabel label="Timeout" help="Auto-escalate or auto-decide after this period" />
          <FieldNumber value={Number(config.timeout_hours ?? 24)} onChange={(v) => onChange("timeout_hours", v)} min={1} max={720} suffix="hours" />
        </div>
        <div>
          <FieldLabel label="On Timeout" />
          <FieldSelect value={String(config.on_timeout ?? "escalate")} onChange={(v) => onChange("on_timeout", v)} options={[
            { value: "escalate", label: "Escalate to Admin" }, { value: "auto_approve", label: "Auto-Approve" },
            { value: "auto_reject", label: "Auto-Reject" }, { value: "fail", label: "Fail Workflow" },
          ]} />
        </div>
        <FieldToggle checked={config.send_reminder === true} onChange={(v) => onChange("send_reminder", v)} label="Send Reminder" />
      </Section>
    </div>
  );
}

function ConfigureOutput({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Channel" required />
        <FieldSelect value={String(config.channel ?? "email")} onChange={(v) => onChange("channel", v)} options={[
          { value: "email", label: "Email" }, { value: "slack", label: "Slack" },
          { value: "webhook", label: "Webhook" }, { value: "sms", label: "SMS" },
          { value: "teams", label: "Microsoft Teams" }, { value: "discord", label: "Discord" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Destination" help="Email address, Slack channel, webhook URL, etc." />
        <FieldText value={String(config.destination ?? "")} onChange={(v) => onChange("destination", v)} placeholder={String(config.channel) === "slack" ? "#channel-name" : "recipient@example.com"} />
      </div>
      <div>
        <FieldLabel label="Message" required />
        <FieldTextarea value={String(config.message ?? "")} onChange={(v) => onChange("message", v)} placeholder="Workflow completed: {{result}}" rows={4} />
      </div>
      {String(config.channel) === "email" && (
        <div>
          <FieldLabel label="Subject" />
          <FieldText value={String(config.subject ?? "")} onChange={(v) => onChange("subject", v)} placeholder="Workflow notification" />
        </div>
      )}
    </div>
  );
}

function ConfigureLoop({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Items Expression" required help="Path to the array to iterate over" />
        <FieldText value={String(config.items ?? "")} onChange={(v) => onChange("items", v)} placeholder="payload.results" />
      </div>
      <div>
        <FieldLabel label="Item Variable" help="Variable name for each iteration's item" />
        <FieldText value={String(config.item_variable ?? "item")} onChange={(v) => onChange("item_variable", v)} />
      </div>
      <div>
        <FieldLabel label="Execution Mode" />
        <FieldSelect value={String(config.execution_mode ?? "sequential")} onChange={(v) => onChange("execution_mode", v)} options={[
          { value: "sequential", label: "Sequential (one at a time)" },
          { value: "parallel", label: "Parallel (concurrent)" },
          { value: "batch", label: "Batch (N at a time)" },
        ]} />
      </div>
      {String(config.execution_mode) === "parallel" && (
        <div>
          <FieldLabel label="Concurrency" help="Maximum parallel executions" />
          <FieldSlider value={Number(config.concurrency ?? 5)} onChange={(v) => onChange("concurrency", v)} min={1} max={50} step={1} />
        </div>
      )}
      {String(config.execution_mode) === "batch" && (
        <div>
          <FieldLabel label="Batch Size" />
          <FieldNumber value={Number(config.batch_size ?? 10)} onChange={(v) => onChange("batch_size", v)} min={1} max={1000} />
        </div>
      )}
      <div>
        <FieldLabel label="Max Iterations" help="Safety cap to prevent infinite loops" />
        <FieldNumber value={Number(config.max_iterations ?? 100)} onChange={(v) => onChange("max_iterations", v)} min={1} max={10000} />
      </div>
      <div>
        <FieldLabel label="On Item Failure" />
        <FieldSelect value={String(config.on_item_failure ?? "continue")} onChange={(v) => onChange("on_item_failure", v)} options={[
          { value: "continue", label: "Continue to Next" }, { value: "retry", label: "Retry Item" },
          { value: "abort", label: "Abort Loop" },
        ]} />
      </div>
    </div>
  );
}

function ConfigureFilter({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Items Expression" required help="Path to the array to filter" />
        <FieldText value={String(config.items ?? "")} onChange={(v) => onChange("items", v)} placeholder="payload.results" />
      </div>
      <div>
        <FieldLabel label="Filter Field" required help="Field to evaluate on each item" />
        <FieldText value={String(config.field ?? "")} onChange={(v) => onChange("field", v)} placeholder="status" />
      </div>
      <div>
        <FieldLabel label="Operator" required />
        <FieldSelect value={String(config.operator ?? "equals")} onChange={(v) => onChange("operator", v)} options={[
          { value: "equals", label: "Equals" }, { value: "not_equals", label: "Not Equals" },
          { value: "contains", label: "Contains" }, { value: "gt", label: "Greater Than" }, { value: "lt", label: "Less Than" },
          { value: "is_empty", label: "Is Empty" }, { value: "is_not_empty", label: "Is Not Empty" },
          { value: "regex", label: "Matches Regex" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Value" required />
        <FieldText value={String(config.value ?? "")} onChange={(v) => onChange("value", v)} placeholder="active" />
      </div>
    </div>
  );
}

function ConfigureMerge({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Merge Mode" required />
        <FieldSelect value={String(config.mode ?? "append")} onChange={(v) => onChange("mode", v)} options={[
          { value: "append", label: "Append – Combine arrays" },
          { value: "object", label: "Merge – Combine objects" },
          { value: "zip", label: "Zip – Pair by index" },
          { value: "combine_by_field", label: "Join – Match by field" },
          { value: "multiplex", label: "Multiplex – Cross product" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Source Keys" required help="Context/payload keys to combine" />
        <FieldTags value={Array.isArray(config.sources) ? config.sources as string[] : []} onChange={(v) => onChange("sources", v)} />
      </div>
      {String(config.mode) === "combine_by_field" && (
        <div>
          <FieldLabel label="Join Field" help="Field to match items between sources" />
          <FieldText value={String(config.join_field ?? "")} onChange={(v) => onChange("join_field", v)} placeholder="id" />
        </div>
      )}
      {String(config.mode) === "object" && (
        <div>
          <FieldLabel label="On Conflict" />
          <FieldSelect value={String(config.prefer_source ?? "last")} onChange={(v) => onChange("prefer_source", v)} options={[
            { value: "first", label: "First Source Wins" }, { value: "last", label: "Last Source Wins" },
          ]} />
        </div>
      )}
    </div>
  );
}

function ConfigureCallback({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Instructions" required help="Description of what external system should do" />
        <FieldTextarea value={String(config.instructions ?? "")} onChange={(v) => onChange("instructions", v)} placeholder="This step pauses until an external system sends a callback payload." rows={3} />
      </div>
      <div>
        <FieldLabel label="Expected Fields" help="Fields expected in the callback payload" />
        <FieldTags value={Array.isArray(config.expected_fields) ? config.expected_fields as string[] : []} onChange={(v) => onChange("expected_fields", v)} placeholder="Field name + Enter" />
      </div>
      <div>
        <FieldLabel label="Resume Mode" />
        <FieldSelect value={String(config.mode ?? "payload")} onChange={(v) => onChange("mode", v)} options={[
          { value: "payload", label: "Resume with Payload" }, { value: "signal", label: "Signal Only" },
        ]} />
      </div>
      <div>
        <FieldLabel label="Timeout" help="Maximum wait time before the callback expires" />
        <FieldNumber value={Number(config.timeout_hours ?? 72)} onChange={(v) => onChange("timeout_hours", v)} min={1} max={720} suffix="hours" />
      </div>
    </div>
  );
}

/** Fallback: generic key-value config for unknown node types */
function ConfigureGeneric({ config, onChange }: { config: Record<string, unknown>; onChange: (k: string, v: unknown) => void }) {
  const entries = Object.entries(config).filter(([k]) => !k.startsWith("_") && k !== "ui_position");
  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-[11px] text-slate-400">
          No configuration fields for this step type.
        </div>
      ) : (
        entries.map(([key, value]) => (
          <div key={key}>
            <FieldLabel label={prettyLabel(key)} />
            {typeof value === "boolean" ? (
              <FieldToggle checked={value} onChange={(v) => onChange(key, v)} label={prettyLabel(key)} />
            ) : (
              <FieldText value={value == null ? "" : String(value)} onChange={(v) => onChange(key, v)} />
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const NodeDetailsPanelLive: React.FC<NodeDetailsPanelLiveProps> = ({
  workflowId,
  workflowName,
  triggerType,
  step,
  steps,
  edges,
  saving,
  onSave,
  onConnectionsChange,
  onDuplicate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  onClose,
  onTestStep,
}) => {
  const [tab, setTab] = useState<TabId>("configure");
  const [draft, setDraft] = useState<ApiWorkflowStep | null>(step);
  const [testPayload, setTestPayload] = useState("{}");
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<StepTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [vaultCredentials, setVaultCredentials] = useState<{ id: string; name: string; provider?: string }[]>([]);
  const [errorHandlingOpen, setErrorHandlingOpen] = useState(false);
  const [editor, setEditor] = useState<ApiNodeEditorResponse | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ApiNodeConfigValidationResponse | null>(null);
  const [preview, setPreview] = useState<ApiNodePreviewResponse | null>(null);
  const [liveStateError, setLiveStateError] = useState<string | null>(null);

  useEffect(() => {
    api.listVaultCredentials().then((creds) => setVaultCredentials(creds as { id: string; name: string; provider?: string }[])).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!step) {
      setEditor(null);
      setEditorError(null);
      setEditorLoading(false);
      return () => {
        ignore = true;
      };
    }

    setEditorLoading(true);
    setEditorError(null);

    api
      .getStudioNodeEditor(step.type, {
        workflowId: workflowId ?? undefined,
        stepId: step.id,
        triggerType: triggerType ?? undefined,
      })
      .then((payload) => {
        if (!ignore) {
          setEditor(payload);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setEditor(null);
          setEditorError(error instanceof Error ? error.message : "Failed to load node editor.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setEditorLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [step, workflowId, triggerType]);

  useEffect(() => {
    setDraft(step);
    setTab("configure");
    setTestResult(null);
    setTestError(null);
    setTestPayload("{}");
    setErrorHandlingOpen(false);
    setValidation(null);
    setPreview(null);
    setLiveStateError(null);
  }, [step]);

  useEffect(() => {
    if (!draft) {
      setValidation(null);
      setPreview(null);
      setLiveStateError(null);
      return;
    }

    let ignore = false;
    const timer = window.setTimeout(() => {
      Promise.all([
        api.validateStudioNode(draft.type, {
          config: draft.config,
          triggerType: triggerType ?? undefined,
          name: draft.name,
        }),
        api.previewStudioNode({
          step: draft,
          triggerType: triggerType ?? undefined,
        }),
      ])
        .then(([validationPayload, previewPayload]) => {
          if (!ignore) {
            setValidation(validationPayload);
            setPreview(previewPayload);
            setLiveStateError(null);
          }
        })
        .catch((error) => {
          if (!ignore) {
            setLiveStateError(error instanceof Error ? error.message : "Failed to validate node configuration.");
          }
        });
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [draft, triggerType]);

  const configEntries = useMemo(() => Object.entries(draft?.config ?? {}), [draft]);

  const connectionTargets = useMemo(() => {
    if (!draft) return { defaultTarget: "", trueTarget: "", falseTarget: "" };
    const outgoing = edges.filter((e) => e.source === draft.id);
    return {
      defaultTarget: outgoing.find((e) => !e.label)?.target ?? "",
      trueTarget: outgoing.find((e) => (e.label ?? "").toLowerCase() === "true")?.target ?? "",
      falseTarget: outgoing.find((e) => (e.label ?? "").toLowerCase() === "false")?.target ?? "",
    };
  }, [draft, edges]);

  const handleConfigChange = useCallback((key: string, value: unknown) => {
    setDraft((c) => (c ? { ...c, config: { ...c.config, [key]: value } } : c));
  }, []);

  const handleSave = useCallback(() => {
    if (draft) {
      onSave(draft);
      onConnectionsChange(draft.id, connectionTargets);
    }
  }, [draft, onSave, onConnectionsChange, connectionTargets]);

  const handleTestRun = useCallback(async () => {
    if (!draft) return;
    setTestRunning(true);
    setTestError(null);
    setTestResult(null);
    try {
      const payload = JSON.parse(testPayload);
      try {
        const result = await api.testStudioNode(draft.type, {
          config: draft.config,
          triggerType: triggerType ?? undefined,
          name: draft.name,
          runPayload: payload,
        });
        setTestResult({
          status: result.status as StepTestResult["status"],
          output: result.output,
          error: result.warnings.length > 0 ? result.warnings.join(" ") : null,
          duration_ms: result.duration_ms,
        });
      } catch (studioTestError) {
        if (!onTestStep) {
          throw studioTestError;
        }
        const result = await onTestStep(draft, payload);
        setTestResult(result);
      }
    } catch (err) {
      setTestError(err instanceof SyntaxError ? "Invalid JSON payload." : err instanceof Error ? err.message : "Test execution failed.");
    } finally {
      setTestRunning(false);
    }
  }, [draft, onTestStep, testPayload, triggerType]);

  /* ── Early return for no selection (after all hooks) ── */
  if (!draft) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-slate-200 bg-white">
        <div className="flex h-full items-center justify-center px-8 text-center">
          <div>
            <div className="text-[13px] font-semibold text-slate-800">Select a step</div>
            <div className="mt-1.5 text-[11px] leading-5 text-slate-400">
              Choose a node from the canvas to edit its configuration.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const meta = getTypeMeta(draft.type);
  const Icon = meta.icon;

  const renderEditorField = (field: ApiNodeEditorField) => {
    if (!draft || !shouldShowEditorField(field, draft.config)) {
      return null;
    }

    const currentValue = draft.config[field.key] ?? field.value;
    const metaBadges = [
      field.source !== "static" ? field.source : null,
      field.bindable && field.binding_kinds.length > 0 ? field.binding_kinds.join(" / ") : null,
    ].filter(Boolean) as string[];

    const renderMeta = metaBadges.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {metaBadges.map((badge) => (
          <span key={`${field.key}-${badge}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {badge}
          </span>
        ))}
      </div>
    ) : null;

    if (field.type === "boolean") {
      return (
        <div key={field.key} className="space-y-1.5">
          <FieldToggle
            checked={Boolean(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            label={field.label}
            help={field.help ?? undefined}
          />
          {renderMeta}
        </div>
      );
    }

    let control: React.ReactNode;
    switch (field.type) {
      case "string":
      case "datetime":
        control = (
          <FieldText
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            placeholder={field.placeholder ?? undefined}
          />
        );
        break;
      case "password":
        control = (
          <input
            type="password"
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(event) => handleConfigChange(field.key, event.target.value)}
            placeholder={field.placeholder ?? undefined}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
          />
        );
        break;
      case "textarea":
        control = (
          <FieldTextarea
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            placeholder={field.placeholder ?? undefined}
            rows={4}
          />
        );
        break;
      case "code":
      case "json":
        control = (
          <FieldTextarea
            value={typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue ?? {}, null, 2)}
            onChange={(value) => handleConfigChange(field.key, value)}
            placeholder={field.placeholder ?? undefined}
            rows={5}
            mono
          />
        );
        break;
      case "select":
        control = (
          <FieldSelect
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            options={field.options ?? []}
            placeholder={field.placeholder ?? undefined}
          />
        );
        break;
      case "number":
        control = (
          <FieldNumber
            value={typeof currentValue === "number" ? currentValue : Number(currentValue ?? 0)}
            onChange={(value) => handleConfigChange(field.key, value)}
          />
        );
        break;
      case "tags":
        control = (
          <FieldTags
            value={Array.isArray(currentValue) ? currentValue.map((item) => String(item)) : []}
            onChange={(value) => handleConfigChange(field.key, value)}
            placeholder={field.placeholder ?? undefined}
          />
        );
        break;
      case "credential":
        control = (
          <FieldSelect
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            options={vaultCredentials.map((credential) => ({
              value: credential.name,
              label: credential.provider ? `${credential.name} (${credential.provider})` : credential.name,
            }))}
            placeholder="Select a saved credential"
          />
        );
        break;
      case "messages":
        control = (
          <FieldMessages
            value={normalizeMessages(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
          />
        );
        break;
      case "keyvalue":
        control = (
          <FieldKeyValue
            value={normalizeKeyValuePairs(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
          />
        );
        break;
      default:
        control = (
          <FieldText
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(value) => handleConfigChange(field.key, value)}
            placeholder={field.placeholder ?? undefined}
          />
        );
        break;
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <FieldLabel label={field.label} required={field.required} help={field.help ?? undefined} />
        {control}
        {renderMeta}
      </div>
    );
  };

  const renderSchemaDrivenConfig = () => {
    if (!editor) {
      return null;
    }

    return (
      <div className="space-y-3">
        {editor.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
              <AlertCircle size={12} /> Editor Warnings
            </div>
            <div className="mt-1.5 space-y-1 text-[10px] leading-4 text-amber-700/90">
              {editor.warnings.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            </div>
          </div>
        )}

        {editor.sections.map((section, index) => {
          const visibleFields = section.fields.filter((field) => shouldShowEditorField(field, draft.config));
          if (visibleFields.length === 0) {
            return null;
          }
          return (
            <Section
              key={section.id}
              title={section.title}
              icon={Settings}
              defaultOpen={index < 2}
              badge={`${visibleFields.length}`}
            >
              {section.description && <div className="text-[10px] leading-4 text-slate-400">{section.description}</div>}
              {visibleFields.map(renderEditorField)}
            </Section>
          );
        })}

        <Section title="Live Runtime" icon={Cpu} defaultOpen>
          {liveStateError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-600">
              {liveStateError}
            </div>
          )}
          {validation && (
            <div className="space-y-2">
              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${validation.valid ? "text-emerald-700" : "text-amber-700"}`}>
                {validation.valid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {validation.valid ? "Configuration is valid" : `${validation.issues.length} issue${validation.issues.length === 1 ? "" : "s"} detected`}
              </div>
              {validation.issues.length > 0 && (
                <div className="space-y-1.5">
                  {validation.issues.map((issue) => (
                    <div key={`${issue.code}-${issue.field ?? "general"}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className={`text-[10px] font-semibold uppercase tracking-wider ${issue.level === "error" ? "text-red-500" : "text-amber-500"}`}>
                        {issue.level}
                        {issue.field ? ` · ${prettyLabel(issue.field)}` : ""}
                      </div>
                      <div className="mt-1 text-[11px] leading-4 text-slate-700">{issue.message}</div>
                    </div>
                  ))}
                </div>
              )}
              {validation.bindings_used.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {validation.bindings_used.map((binding) => (
                    <span key={binding} className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                      {binding}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {preview && (
            <div className="space-y-2">
              {preview.warnings.length > 0 && (
                <div className="space-y-1 text-[10px] leading-4 text-amber-700">
                  {preview.warnings.map((warning) => (
                    <div key={warning}>{warning}</div>
                  ))}
                </div>
              )}
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sample Output</div>
                <pre className="max-h-[180px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-[10px] leading-4 text-slate-100">
                  {JSON.stringify(preview.sample_output, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Section>

        {editor.available_bindings.length > 0 && (
          <Section title="Connected Resources" icon={Database}>
            <div className="space-y-2">
              {editor.available_bindings.map((binding) => (
                <div key={`${binding.kind}-${binding.name}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-medium text-slate-800">{binding.label}</div>
                      <div className="truncate text-[10px] text-slate-400">
                        {binding.kind}
                        {binding.app ? ` · ${binding.app}` : ""}
                        {binding.scope ? ` · ${binding.scope}` : ""}
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      {binding.fields.length} field{binding.fields.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {binding.fields.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {binding.fields.slice(0, 6).map((bindingField) => (
                        <span key={`${binding.name}-${bindingField}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                          {bindingField}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    );
  };

  /* ── Render the correct per-node-type config panel ── */
  const renderConfigPanel = () => {
    const props = { config: draft.config, onChange: handleConfigChange, credentials: vaultCredentials };
    switch (draft.type) {
      case "trigger": return <ConfigureTrigger {...props} />;
      case "llm": return <ConfigureLLM {...props} />;
      case "ai_agent": return <ConfigureAIAgent {...props} />;
      case "condition": return <ConfigureCondition config={draft.config} onChange={handleConfigChange} />;
      case "transform": return <ConfigureTransform config={draft.config} onChange={handleConfigChange} />;
      case "http_request": return <ConfigureHTTP {...props} />;
      case "code": return <ConfigureCode config={draft.config} onChange={handleConfigChange} />;
      case "delay": return <ConfigureDelay config={draft.config} onChange={handleConfigChange} />;
      case "human": return <ConfigureHuman config={draft.config} onChange={handleConfigChange} />;
      case "output": return <ConfigureOutput config={draft.config} onChange={handleConfigChange} />;
      case "loop": return <ConfigureLoop config={draft.config} onChange={handleConfigChange} />;
      case "filter": return <ConfigureFilter config={draft.config} onChange={handleConfigChange} />;
      case "merge": return <ConfigureMerge config={draft.config} onChange={handleConfigChange} />;
      case "callback": return <ConfigureCallback config={draft.config} onChange={handleConfigChange} />;
      default: return <ConfigureGeneric config={draft.config} onChange={handleConfigChange} />;
    }
  };

  return (
    <aside className="w-[320px] shrink-0 border-l border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        {/* ── Header ── */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}>
                <Icon size={16} className={meta.iconClass} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-slate-900">{draft.name}</div>
                <div className="truncate text-[11px] text-slate-400">{meta.subtitle}</div>
              </div>
            </div>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex rounded-lg bg-slate-50 p-0.5">
            {(["setup", "configure", "test"] as TabId[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 h-7 rounded-md text-[11px] font-medium transition-all ${
                  tab === item ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {/* ════ SETUP TAB ════ */}
          {tab === "setup" && (
            <div className="space-y-4 pt-1">
              <div className="border-b border-slate-100 py-3">
                <FieldLabel label="Step Type" />
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${meta.iconBg}`}>
                    <Icon size={13} className={meta.iconClass} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-800">{meta.subtitle}</span>
                </div>
              </div>

              <div className="border-b border-slate-100 py-3">
                <FieldLabel label="Node Name" required />
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="mt-1.5 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors"
                />
              </div>

              <div className="border-b border-slate-100 py-3">
                <FieldLabel label="Notes" help="Add a note describing what this step does" />
                <textarea
                  value={String(draft.config._notes ?? "")}
                  onChange={(e) => handleConfigChange("_notes", e.target.value)}
                  placeholder="Add a note about this step…"
                  className="mt-1.5 min-h-[48px] w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] leading-4 text-slate-700 outline-none resize-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors"
                />
              </div>

              <div className="py-3">
                <FieldLabel label="Workflow" />
                <div className="mt-1 text-[12px] font-medium text-slate-800">{workflowName}</div>
              </div>

              <FieldToggle checked={draft.config._enabled !== false} onChange={(v) => handleConfigChange("_enabled", v)} label="Enabled" help="Disable to skip this step during execution" />

              <div className="grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-3">
                <button onClick={() => onMove(draft.id, "up")} disabled={!canMoveUp || saving} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                  <ArrowUp size={12} /> Move up
                </button>
                <button onClick={() => onMove(draft.id, "down")} disabled={!canMoveDown || saving} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                  <ArrowDown size={12} /> Move down
                </button>
                <button onClick={() => onDuplicate(draft)} disabled={saving} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                  <Copy size={12} /> Duplicate
                </button>
                <button onClick={() => onDelete(draft.id)} disabled={saving} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-100 text-[11px] font-medium text-red-500 disabled:opacity-40 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          )}

          {/* ════ CONFIGURE TAB ════ */}
          {tab === "configure" && (
            <div className="space-y-3 pt-1">
              {/* Step name (inline) */}
              <div className="pb-2">
                <FieldLabel label="Step Name" />
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[12px] text-slate-800 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 transition-colors"
                />
              </div>

              {/* Per-node-type configuration */}
              {editorError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[11px] leading-4 text-red-600">
                  {editorError}
                </div>
              )}
              {editorLoading ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
                  <Loader2 size={12} className="animate-spin" /> Loading node editor...
                </div>
              ) : editor ? (
                renderSchemaDrivenConfig()
              ) : (
                renderConfigPanel()
              )}

              {/* ── Error Handling (global for every node) ── */}
              <Section title="Error Handling" icon={Shield}>
                <FieldToggle checked={draft.config._continue_on_fail === true} onChange={(v) => handleConfigChange("_continue_on_fail", v)} label="Continue on Fail" help="Continue workflow execution even if this step fails" />
                <div>
                  <FieldLabel label="On Error" />
                  <FieldSelect
                    value={String(draft.config._on_error ?? "stop")}
                    onChange={(v) => handleConfigChange("_on_error", v)}
                    options={[
                      { value: "stop", label: "Stop Workflow" },
                      { value: "continue", label: "Continue" },
                      { value: "continue_default", label: "Continue with Default Output" },
                    ]}
                  />
                </div>
                <FieldToggle checked={draft.config._retry_on_fail === true} onChange={(v) => handleConfigChange("_retry_on_fail", v)} label="Retry on Fail" help="Automatically retry this step if it fails" />
                {draft.config._retry_on_fail === true && (
                  <>
                    <div>
                      <FieldLabel label="Max Retries" />
                      <FieldNumber value={Number(draft.config._max_retries ?? 3)} onChange={(v) => handleConfigChange("_max_retries", v)} min={1} max={10} />
                    </div>
                    <div>
                      <FieldLabel label="Retry Wait" />
                      <FieldNumber value={Number(draft.config._retry_wait_ms ?? 1000)} onChange={(v) => handleConfigChange("_retry_wait_ms", v)} min={100} max={60000} suffix="ms" />
                    </div>
                    <div>
                      <FieldLabel label="Backoff" />
                      <FieldSelect value={String(draft.config._retry_backoff ?? "fixed")} onChange={(v) => handleConfigChange("_retry_backoff", v)} options={[
                        { value: "fixed", label: "Fixed Interval" },
                        { value: "exponential", label: "Exponential Backoff" },
                        { value: "exponential_jitter", label: "Exponential + Jitter" },
                      ]} />
                    </div>
                  </>
                )}
                <div>
                  <FieldLabel label="Timeout" />
                  <FieldNumber value={Number(draft.config._timeout_seconds ?? 300)} onChange={(v) => handleConfigChange("_timeout_seconds", v)} min={1} max={3600} suffix="sec" />
                </div>
              </Section>

              {/* ── Connections ── */}
              <Section title="Connections" icon={GitBranch} defaultOpen>
                {draft.type === "condition" ? (
                  <>
                    <div>
                      <FieldLabel label="True Branch" />
                      <FieldSelect
                        value={connectionTargets.trueTarget}
                        onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, trueTarget: v })}
                        options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                        placeholder="No target"
                      />
                    </div>
                    <div>
                      <FieldLabel label="False Branch" />
                      <FieldSelect
                        value={connectionTargets.falseTarget}
                        onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, falseTarget: v })}
                        options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                        placeholder="No target"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <FieldLabel label="Next Step" />
                    <FieldSelect
                      value={connectionTargets.defaultTarget}
                      onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, defaultTarget: v })}
                      options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                      placeholder="No target"
                    />
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* ════ TEST TAB ════ */}
          {tab === "test" && (
            <div className="space-y-3.5 pt-1">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <Play size={12} className="text-slate-500" />
                  Test this step
                </div>
                <div className="mt-1 text-[10px] leading-4 text-slate-400">
                  Provide sample input data to test in isolation.
                </div>
              </div>

              <div>
                <FieldLabel label="Test Payload (JSON)" />
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  placeholder='{ "key": "value" }'
                  className="min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-[11px] leading-5 text-slate-800 outline-none resize-none font-mono focus:border-violet-400 transition-colors"
                />
              </div>

              <div className="border-b border-slate-100 py-3">
                <FieldLabel label="Step Type" />
                <div className="mt-1 text-[12px] font-medium text-slate-800">{meta.subtitle}</div>
              </div>
              <div className="border-b border-slate-100 py-3">
                <FieldLabel label="Config Fields" />
                <div className="mt-1 text-[12px] font-medium text-slate-800">{configEntries.length}</div>
              </div>

              {testError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-600">
                    <AlertCircle size={12} /> Error
                  </div>
                  <div className="mt-1 text-[10px] leading-4 text-red-500">{testError}</div>
                </div>
              )}

              {testResult && (
                <div className={`rounded-lg border px-3 py-2.5 ${
                  testResult.status === "success" ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      {testResult.status === "success" ? (
                        <><CheckCircle2 size={12} className="text-emerald-600" /> <span className="text-emerald-700">Success</span></>
                      ) : (
                        <><AlertCircle size={12} className="text-red-600" /> <span className="text-red-700">Failed</span></>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={9} /> {testResult.duration_ms}ms
                    </span>
                  </div>
                  {testResult.error && (
                    <div className="mt-1.5 text-[10px] leading-4 text-red-500">{testResult.error}</div>
                  )}
                  {testResult.output && (
                    <div className="mt-1.5">
                      <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400 mb-1">Output</div>
                      <pre className="rounded-md bg-white/80 border border-slate-200 p-1.5 text-[10px] leading-4 text-slate-700 overflow-x-auto max-h-[140px] overflow-y-auto font-mono">
                        {JSON.stringify(testResult.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="py-3.5">
                <div className="text-[11px] text-slate-500">Execution status</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-[12px] text-slate-700">
                  {testRunning ? (
                    <><Loader2 size={10} className="animate-spin text-amber-500" /> Running</>
                  ) : testResult ? (
                    <><Circle size={8} className={`fill-current ${testResult.status === "success" ? "text-emerald-400" : "text-red-400"}`} /> {testResult.status}</>
                  ) : (
                    <><Circle size={8} className="fill-emerald-400 text-emerald-400" /> Ready</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer save button ── */}
        <div className="border-t border-slate-100 bg-white px-4 py-3">
          <button
            onClick={tab === "test" ? handleTestRun : handleSave}
            disabled={saving || testRunning}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 text-[12px] font-semibold text-white disabled:opacity-50 hover:bg-violet-700 transition-colors"
          >
            {tab === "test" ? (
              testRunning ? <><Loader2 size={12} className="animate-spin" /> Running...</> : <><Play size={12} /> Run Test</>
            ) : tab === "setup" ? (
              <><Copy size={12} /> {saving ? "Saving..." : "Save & Continue"}</>
            ) : (
              <><CheckCircle2 size={12} /> {saving ? "Saving..." : "Save Changes"}</>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default NodeDetailsPanelLive;
