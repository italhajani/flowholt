import React, { useEffect, useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { api, type ApiExecution, type ApiNodeCatalogResponse, type ApiVaultConnection, type ApiVaultCredential, type ApiWorkflowStepType, type ApiWorkflowVersionSummary } from "@/lib/api";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Blocks,
  BookOpen,
  Bot,
  Braces,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code,
  Cpu,
  CreditCard,
  Database,
  Edit3,
  ExternalLink,
  Filter,
  FlaskConical,
  FolderGit2,
  GitBranch,
  Globe,
  HelpCircle,
  KeyRound,
  Library,
  Link2,
  Loader2,
  Mail,
  Merge,
  MessageSquare,
  Minus,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Settings2,
  Sheet,
  Sparkles,
  Table,
  Timer,
  Trash2,
  Upload,
  Wand2,
  Webhook,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import Tooltip from "./Tooltip";

interface NodesPanelProps {
  open: boolean;
  onToggle: () => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddStep: (step: {
    type: ApiWorkflowStepType;
    name: string;
    config: Record<string, unknown>;
  }) => void;
  addingNode?: string | null;
  steps?: { id: string; name: string; type: string }[];
  edges?: { id: string; source: string; target: string; label: string | null }[];
  workflowId?: string;
  workflowTriggerType?: "webhook" | "schedule" | "manual" | "event" | null;
  onOpenChat?: () => void;
  onDeleteEdge?: (edgeId: string) => void;
  onUpdateEdge?: (edgeId: string, updates: { label?: string | null }) => void;
  executions?: ApiExecution[];
  onSelectExecution?: (execution: ApiExecution) => void;
  onRetryExecution?: (executionId: string) => void;
}

const categories = [
  {
    name: "Triggers",
    icon: Zap,
    items: [
      { name: "Webhook", meta: "HTTP endpoint", icon: Webhook, stepType: "trigger", config: { source: "webhook", method: "POST" } },
      { name: "Schedule", meta: "Timed runs", icon: Timer, stepType: "trigger", config: { source: "schedule", frequency: "hourly" } },
      { name: "Manual trigger", meta: "Run on demand", icon: Zap, stepType: "trigger", config: { source: "manual" } },
    ],
  },
  {
    name: "Action",
    icon: Blocks,
    items: [
      { name: "HTTP Request", meta: "Call any API", icon: Globe, stepType: "http_request", config: { method: "GET", url: "https://api.example.com" } },
      { name: "Email", meta: "Send workflow emails", icon: Mail, stepType: "output", config: { channel: "email", message: "Workflow update" } },
      { name: "Slack", meta: "Post channel alerts", icon: MessageSquare, stepType: "output", config: { channel: "#ops-alerts", message: "Send workflow update" } },
    ],
  },
  {
    name: "Notification",
    icon: MessageSquare,
    items: [
      { name: "Slack alert", meta: "Send alerts or notifications", icon: MessageSquare, stepType: "output", config: { channel: "#support-alerts", message: "Notify team" } },
      { name: "Email notice", meta: "Route workflow updates", icon: Mail, stepType: "output", config: { channel: "email", message: "Share workflow result" } },
    ],
  },
  {
    name: "Delay",
    icon: Timer,
    items: [
      { name: "Wait", meta: "Pause the workflow", icon: Timer, stepType: "delay", config: { minutes: 15 } },
      { name: "Schedule hold", meta: "Delay until a target time", icon: Timer, stepType: "delay", config: { hours: 1 } },
    ],
  },
  {
    name: "Data Processing",
    icon: Database,
    items: [
      { name: "Loop / Iterator", meta: "Process items in batch", icon: Repeat, stepType: "loop", config: { items: "items", item_variable: "item", sub_template: "Process {{item}}" } },
      { name: "Filter", meta: "Filter array items", icon: Filter, stepType: "filter", config: { items: "items", field: "status", operator: "equals", value: "active" } },
      { name: "Merge", meta: "Combine data sources", icon: Merge, stepType: "merge", config: { sources: ["items", "results"], mode: "append" } },
      { name: "Transform", meta: "Reshape payload data", icon: Wand2, stepType: "transform", config: { template: "{{message}}" } },
    ],
  },
  {
    name: "Code & Logic",
    icon: Code,
    items: [
      { name: "Python Script", meta: "Run custom code", icon: Code, stepType: "code", config: { language: "python", script: "# Access payload, context, items\nresult = {'processed': True}" } },
      { name: "Router", meta: "Branch the workflow", icon: GitBranch, stepType: "condition", config: { field: "priority", operator: "equals", equals: "high" } },
      { name: "Decision", meta: "Evaluate conditions", icon: GitBranch, stepType: "condition", config: { field: "sentiment", operator: "equals", equals: "negative" } },
    ],
  },
  {
    name: "User Task",
    icon: BookOpen,
    items: [
      { name: "Approval", meta: "Assign task to a teammate", icon: BookOpen, stepType: "human", config: { title: "Approval required", instructions: "Approve or reject this request", choices: ["approved", "rejected"], assignee_role: "admin" } },
      { name: "Review", meta: "Collect structured feedback", icon: BookOpen, stepType: "human", config: { title: "Review output", instructions: "Review the response and choose a path", choices: ["approved", "needs_changes"], assignee_role: "builder" } },
    ],
  },
  {
    name: "AI",
    icon: Bot,
    items: [
      { name: "AI Agent", meta: "Autonomous agent with tools", icon: Bot, stepType: "ai_agent", config: { agent_type: "conversational", model: "gpt-4o", prompt: "Help the user accomplish their task." } },
      { name: "AI", meta: "General AI model step", icon: Bot, stepType: "llm", config: { provider: "openai", model: "gpt-4o", prompt: "Classify the request and suggest the next step." } },
      { name: "AI Model", meta: "Model slot for AI clusters", icon: Cpu, stepType: "ai_chat_model", config: { provider: "openai", model: "gpt-4o" } },
      { name: "AI Memory", meta: "Memory slot for AI clusters", icon: Database, stepType: "ai_memory", config: { memory_type: "buffer_window", session_key: "" } },
      { name: "AI Tool", meta: "Tool slot for AI clusters", icon: Wrench, stepType: "ai_tool", config: { tool_name: "calculator", tool_type: "builtin" } },
      { name: "OpenAI (GPT)", meta: "GPT-4o, GPT-4.1", icon: Bot, stepType: "llm", config: { provider: "openai", model: "gpt-4o", prompt: "Classify the request and suggest the next step." } },
      { name: "Anthropic (Claude)", meta: "Claude 4, Sonnet", icon: Bot, stepType: "llm", config: { provider: "anthropic", model: "claude-sonnet-4-20250514", prompt: "Summarize the input and draft the next action." } },
      { name: "Google Gemini", meta: "Gemini 2.5 Pro/Flash", icon: Sparkles, stepType: "llm", config: { provider: "gemini", model: "gemini-2.5-flash", prompt: "Analyze and respond to this input." } },
      { name: "Groq", meta: "Ultra-fast inference", icon: Zap, stepType: "llm", config: { provider: "groq", model: "llama-3.3-70b-versatile", prompt: "Process this data quickly." } },
      { name: "DeepSeek", meta: "DeepSeek Chat/Coder", icon: Bot, stepType: "llm", config: { provider: "deepseek", model: "deepseek-chat", prompt: "Analyze and process this data." } },
      { name: "xAI (Grok)", meta: "Grok-3 models", icon: Sparkles, stepType: "llm", config: { provider: "xai", model: "grok-3", prompt: "Process and respond to this input." } },
      { name: "Ollama (Local)", meta: "Self-hosted models", icon: Bot, stepType: "llm", config: { provider: "ollama", model: "llama3", prompt: "Process this data locally." } },
      { name: "Together AI", meta: "Open-source models", icon: Bot, stepType: "llm", config: { provider: "together", model: "meta-llama/Llama-3-70b-chat-hf", prompt: "Process this data." } },
      { name: "Custom LLM", meta: "Any OpenAI-compatible API", icon: Wand2, stepType: "llm", config: { provider: "custom", model: "default", base_url: "https://your-server.com/v1", prompt: "Describe what this step should do." } },
      { name: "Callback wait", meta: "Wait for an external system", icon: Globe, stepType: "callback", config: { instructions: "Resume when the external system sends the callback payload.", expected_fields: ["status"], mode: "payload" } },
      { name: "ReAct Agent", meta: "Reason & act loop", icon: Bot, stepType: "ai_agent", config: { agent_type: "react", model: "gpt-4o", prompt: "Solve this step-by-step.", max_iterations: 10 } },
      { name: "Plan & Execute", meta: "Plan then run tools", icon: Bot, stepType: "ai_agent", config: { agent_type: "plan_and_execute", model: "gpt-4o", prompt: "Create a plan and execute it.", max_iterations: 15 } },
      { name: "Summarization Chain", meta: "Map-reduce or refine summaries", icon: Sparkles, stepType: "ai_summarize", config: { provider: "openai", model: "gpt-4o-mini", text: "Summarize this content.", summarization_method: "map_reduce" } },
      { name: "Information Extractor", meta: "Structured extraction with schema", icon: Table, stepType: "ai_extract", config: { provider: "openai", model: "gpt-4o-mini", text: "Extract the key fields from this input." } },
      { name: "Text Classifier", meta: "Category routing with AI", icon: Filter, stepType: "ai_classify", config: { provider: "openai", model: "gpt-4o-mini", text: "Classify this text.", enable_autorouting: true } },
      { name: "Sentiment Analysis", meta: "Score and explain sentiment", icon: Bot, stepType: "ai_sentiment", config: { provider: "openai", model: "gpt-4o-mini", text: "Analyze the sentiment." } },
    ],
  },
  {
    name: "Integrations",
    icon: Library,
    items: [
      { name: "GitHub", meta: "Repos, issues, PRs", icon: GitBranch, stepType: "transform", config: { plugin: "github", action: "create_issue", owner: "", repo: "" } },
      { name: "Gmail", meta: "Send & read email", icon: Mail, stepType: "output", config: { channel: "email", message: "Email notification", plugin: "gmail", action: "send_email", to: "", subject: "", body: "" } },
      { name: "Slack", meta: "Channel messages", icon: MessageSquare, stepType: "output", config: { channel: "#general", message: "Channel notification", plugin: "slack", action: "send_message", text: "" } },
      { name: "Discord", meta: "Bot messages", icon: MessageSquare, stepType: "output", config: { channel: "discord", message: "Bot message", plugin: "discord", action: "send_message", channel_id: "", content: "" } },
      { name: "Notion", meta: "Pages & databases", icon: BookOpen, stepType: "transform", config: { plugin: "notion", action: "create_page", parent_id: "", title: "" } },
      { name: "Airtable", meta: "Records & tables", icon: Table, stepType: "transform", config: { plugin: "airtable", action: "create_record", base_id: "", table_name: "" } },
      { name: "Google Sheets", meta: "Spreadsheet rows", icon: Sheet, stepType: "transform", config: { plugin: "google_sheets", action: "append_row", spreadsheet_id: "", range: "" } },
      { name: "Stripe", meta: "Payments & invoices", icon: CreditCard, stepType: "transform", config: { plugin: "stripe", action: "create_charge", amount: 0, currency: "usd" } },
      { name: "Jira", meta: "Issues & projects", icon: Blocks, stepType: "transform", config: { plugin: "jira", action: "create_issue", project_key: "", summary: "" } },
      { name: "Linear", meta: "Issues & cycles", icon: Blocks, stepType: "transform", config: { plugin: "linear", action: "create_issue", team_id: "", title: "" } },
      { name: "Telegram", meta: "Bot messages", icon: Send, stepType: "output", config: { channel: "telegram", message: "Bot message", plugin: "telegram", action: "send_message", chat_id: "", text: "" } },
      { name: "Twilio", meta: "SMS & calls", icon: Phone, stepType: "output", config: { channel: "sms", message: "SMS notification", plugin: "twilio", action: "send_sms", to: "", body: "" } },
      { name: "SendGrid", meta: "Transactional email", icon: Mail, stepType: "output", config: { channel: "email", message: "Email notification", plugin: "sendgrid", action: "send_email", to: "", subject: "", html: "" } },
    ],
  },
];

const studioTools = [
  { id: "nodes", label: "Nodes", icon: Blocks },
  { id: "connections", label: "Connections", icon: Link2 },
  { id: "executions", label: "Executions", icon: Activity },
  { id: "tests", label: "Tests", icon: FlaskConical },
  { id: "versions", label: "Versions", icon: FolderGit2 },
  { id: "code", label: "Code", icon: Braces },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "settings", label: "Studio settings", icon: Settings2 },
  { id: "help", label: "Help", icon: HelpCircle },
];

const quickActions = [
  { id: "add", label: "Add node", icon: Plus },
  { id: "branch", label: "Branch", icon: GitBranch },
  { id: "assist", label: "AI assist", icon: Sparkles },
  { id: "custom", label: "Custom node", icon: Bot },
];

const SETTINGS_KEY = "flowholt_studio_settings";
type SettingsMap = Record<string, boolean>;

const defaultSettings: { key: string; label: string; desc: string; defaultOn: boolean }[] = [
  { key: "snap_grid", label: "Snap to grid", desc: "Align nodes to a 20px grid", defaultOn: true },
  { key: "show_minimap", label: "Show minimap", desc: "Display canvas overview", defaultOn: true },
  { key: "auto_save", label: "Auto-save", desc: "Save changes automatically", defaultOn: true },
  { key: "edge_labels", label: "Edge labels", desc: "Show condition labels on edges", defaultOn: true },
  { key: "animate_edges", label: "Animate edges", desc: "Animate edges during replay", defaultOn: false },
];

type NodeLibraryItem = {
  name: string;
  meta: string;
  icon: React.ElementType;
  stepType: ApiWorkflowStepType;
  config?: Record<string, unknown>;
  description?: string;
  category?: string;
  supportsBranches?: boolean;
  source: "catalog" | "fallback";
};

type NodeLibraryCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  description?: string;
  items: NodeLibraryItem[];
  source: "catalog" | "fallback";
};

const isPresent = <T,>(value: T | null | undefined): value is T => value != null;

const AI_NODE_ORDER: Record<string, number> = {
  ai_agent: 0,
  llm: 1,
  ai_chat_model: 2,
  ai_memory: 3,
  ai_tool: 4,
  ai_output_parser: 5,
  ai_summarize: 6,
  ai_extract: 7,
  ai_classify: 8,
  ai_sentiment: 9,
};

const getLibraryNodeLabel = (nodeType: string, label: string) => {
  if (nodeType === "llm") {
    return "AI";
  }
  return label;
};

const sortLibraryItems = (items: NodeLibraryItem[], categoryName: string) => {
  if (!categoryName.toLowerCase().includes("ai")) {
    return items;
  }

  return [...items].sort((left, right) => {
    const leftPriority = AI_NODE_ORDER[left.stepType] ?? 99;
    const rightPriority = AI_NODE_ORDER[right.stepType] ?? 99;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.name.localeCompare(right.name);
  });
};

const getCatalogGroupIcon = (groupId: string, label: string) => {
  const key = `${groupId} ${label}`.toLowerCase();
  if (key.includes("start") || key.includes("trigger")) return Zap;
  if (key.includes("ai")) return Bot;
  if (key.includes("logic")) return GitBranch;
  if (key.includes("approval") || key.includes("human")) return BookOpen;
  if (key.includes("action")) return Blocks;
  return Library;
};

const getCatalogNodeIcon = (nodeType: string, category: string) => {
  switch (nodeType) {
    case "trigger":
      return Webhook;
    case "http_request":
      return Globe;
    case "output":
      return Send;
    case "delay":
      return Timer;
    case "loop":
      return Repeat;
    case "filter":
      return Filter;
    case "merge":
      return Merge;
    case "condition":
      return GitBranch;
    case "human":
      return BookOpen;
    case "code":
      return Code;
    case "callback":
      return Link2;
    case "llm":
    case "ai_agent":
      return Bot;
    case "ai_chat_model":
      return Cpu;
    case "ai_memory":
      return Database;
    case "ai_tool":
      return Wrench;
    case "ai_output_parser":
      return Braces;
    case "ai_summarize":
    case "ai_extract":
    case "ai_classify":
    case "ai_sentiment":
      return Bot;
    default:
      if (category.toLowerCase().includes("ai")) return Bot;
      if (category.toLowerCase().includes("logic")) return GitBranch;
      if (category.toLowerCase().includes("data")) return Database;
      if (category.toLowerCase().includes("integration")) return Library;
      return Blocks;
  }
};

const buildFallbackCategories = (): NodeLibraryCategory[] =>
  categories.map((category) => ({
    id: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: category.name,
    icon: category.icon,
    description: undefined,
    source: "fallback",
    items: sortLibraryItems(category.items.map((item) => ({
      ...item,
      description: item.meta,
      category: category.name,
      source: "fallback",
    })), category.name),
  }));

const buildCatalogCategories = (catalog: ApiNodeCatalogResponse | null): NodeLibraryCategory[] => {
  if (!catalog) return [];

  const nodesByType = new Map(catalog.nodes.map((node) => [node.type, node]));

  return catalog.groups
    .map((group) => ({
      id: group.id,
      name: group.label,
      icon: getCatalogGroupIcon(group.id, group.label),
      description: group.description ?? undefined,
      source: "catalog" as const,
      items: sortLibraryItems(group.node_types
        .map((nodeType) => nodesByType.get(nodeType))
        .filter(isPresent)
        .map((node) => ({
          name: getLibraryNodeLabel(node.type, node.label),
          meta: node.category,
          icon: getCatalogNodeIcon(node.type, node.category),
          stepType: node.type as ApiWorkflowStepType,
          config: {},
          description: node.description,
          category: node.category,
          supportsBranches: node.supports_branches,
          source: "catalog" as const,
        })), group.label),
    }))
    .filter((group) => group.items.length > 0);
};

function loadSettings(): SettingsMap {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const initial: SettingsMap = {};
  for (const s of defaultSettings) initial[s.key] = s.defaultOn;
  return initial;
}

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<SettingsMap>(loadSettings);

  const toggle = (key: string) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="w-[272px] h-full bg-white border-r border-slate-200 overflow-hidden flex flex-col">
      <div className="h-16 px-4 border-b border-slate-200 flex items-center">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-[#4f46e5]" />
          <span className="text-[13px] font-semibold text-slate-900">Studio settings</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {defaultSettings.map((s) => {
          const on = settings[s.key] ?? s.defaultOn;
          return (
            <div key={s.key} className="flex items-start justify-between">
              <div>
                <div className="text-[12px] font-medium text-slate-800">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
              </div>
              <button
                onClick={() => toggle(s.key)}
                className={`w-8 h-[18px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${on ? "bg-[#4f46e5]" : "bg-slate-200"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${on ? "translate-x-3.5" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NodesPanel: React.FC<NodesPanelProps> = ({ open, onToggle, activeTool, onToolChange, onAddStep, addingNode, steps = [], edges = [], workflowId, workflowTriggerType, onOpenChat, onDeleteEdge, onUpdateEdge, executions: propExecutions, onSelectExecution, onRetryExecution }) => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [versions, setVersions] = useState<ApiWorkflowVersionSummary[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionAction, setVersionAction] = useState<string | null>(null);
  const [executions, setExecutions] = useState<ApiExecution[]>(propExecutions ?? []);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [vaultConnections, setVaultConnections] = useState<ApiVaultConnection[]>([]);
  const [vaultCredentials, setVaultCredentials] = useState<ApiVaultCredential[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<ApiNodeCatalogResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogRequested, setCatalogRequested] = useState(false);
  const [draftingNode, setDraftingNode] = useState<string | null>(null);

  useEffect(() => { if (propExecutions) setExecutions(propExecutions); }, [propExecutions]);

  useEffect(() => {
    if (activeTool === "executions") {
      setExecutionsLoading(true);
      api.listExecutions().then(setExecutions).catch(() => {}).finally(() => setExecutionsLoading(false));
    }
  }, [activeTool]);

  useEffect(() => {
    if (activeTool === "connections") {
      setConnectionsLoading(true);
      Promise.all([api.listVaultConnections(), api.listVaultCredentials()])
        .then(([conns, creds]) => { setVaultConnections(conns); setVaultCredentials(creds); })
        .catch(() => {})
        .finally(() => setConnectionsLoading(false));
    }
  }, [activeTool]);

  useEffect(() => {
    if (activeTool !== "nodes" || catalog || catalogLoading || catalogRequested) {
      return;
    }

    let cancelled = false;
    setCatalogRequested(true);
    setCatalogLoading(true);
    setCatalogError(null);

    api.getStudioCatalog().then((result) => {
      if (!cancelled) {
        setCatalog(result);
      }
    }).catch((error) => {
      if (!cancelled) {
        setCatalogError(error instanceof Error ? error.message : "Failed to load the live node catalog.");
      }
    }).finally(() => {
      if (!cancelled) {
        setCatalogLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeTool, catalog, catalogLoading, catalogRequested]);

  const availableCategories = useMemo(() => {
    const catalogCategories = buildCatalogCategories(catalog);
    if (catalogCategories.length > 0) {
      return catalogCategories;
    }
    return buildFallbackCategories();
  }, [catalog]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return availableCategories;
    }

    return availableCategories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const haystack = [item.name, item.meta, item.description, item.category, item.stepType]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [availableCategories, search]);
  const selectedCategory = filteredCategories.find((category) => category.id === activeCategory) ?? null;

  useEffect(() => {
    if (activeCategory && !filteredCategories.some((category) => category.id === activeCategory)) {
      setActiveCategory(null);
    }
  }, [activeCategory, filteredCategories]);

  useEffect(() => {
    if (activeTool === "versions" && workflowId) {
      setVersionsLoading(true);
      api.listWorkflowVersions(workflowId).then(setVersions).catch(() => setVersions([])).finally(() => setVersionsLoading(false));
    }
  }, [activeTool, workflowId]);

  const activeAddingNode = addingNode ?? draftingNode;

  const handleAddLibraryNode = useCallback(async (item: NodeLibraryItem) => {
    if (activeAddingNode) {
      return;
    }

    setCatalogError(null);
    setDraftingNode(item.name);

    try {
      const draft = await api.draftStudioNode({
        nodeType: item.stepType,
        name: item.name,
        triggerType: workflowTriggerType ?? undefined,
        config: item.config ?? {},
      });
      onAddStep(draft.step);
    } catch (error) {
      if (item.config) {
        onAddStep({
          type: item.stepType,
          name: item.name,
          config: item.config,
        });
        setCatalogError("Loaded local defaults because the backend draft request was unavailable.");
      } else {
        setCatalogError(error instanceof Error ? error.message : "Failed to create the selected node.");
      }
    } finally {
      setDraftingNode(null);
    }
  }, [activeAddingNode, onAddStep, workflowTriggerType]);

  return (
    <div className="h-full flex shrink-0 relative">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`h-full bg-white border-r border-slate-100 transition-[width] duration-200 ease-out ${
          hovered ? "w-[160px]" : "w-[56px]"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 py-3 space-y-0.5">
            {studioTools.map((tool) => (
              <Tooltip key={tool.id} content={!hovered ? tool.label : ""} position="right">
                <button
                  onClick={() => {
                    onToolChange(tool.id);
                    if (tool.id === "nodes") { if (!open) onToggle(); }
                    else if (activeTool === tool.id && open) { onToggle(); }
                    else if (!open) { onToggle(); }
                  }}
                  className={cn(
                    "mx-2 w-[calc(100%-16px)] h-8 rounded-md flex items-center px-2.5 transition-colors",
                    activeTool === tool.id
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                  )}
                >
                  <tool.icon size={14} className="shrink-0" />
                  {hovered && <span className="ml-2.5 text-[11px] font-medium truncate">{tool.label}</span>}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="px-2 py-3">
            <div className="w-full h-8 rounded-md border border-slate-100 bg-white flex items-center justify-center text-slate-400 text-[11px] hover:bg-slate-50 transition-colors cursor-pointer">
              {hovered ? "Settings" : <Wrench size={13} />}
            </div>
          </div>
        </div>
      </aside>

      {open && activeTool === "nodes" && (
        <div className="w-[260px] h-full bg-white border-r border-slate-100 overflow-hidden">
          <div className="h-full flex flex-col overflow-hidden">
            <div className="px-3 py-3 border-b border-slate-100 space-y-2">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 h-8 w-full">
                <Search size={12} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[11px] text-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className={cn("font-medium", catalog ? "text-emerald-600" : "text-slate-400")}>
                  {catalogLoading
                    ? "Loading live catalog..."
                    : catalog
                      ? `${catalog.nodes.length} backend nodes ready`
                      : "Using local starter library"}
                </span>
                <span className="text-slate-400">
                  {availableCategories.reduce((count, category) => count + category.items.length, 0)} items
                </span>
              </div>
              {catalogError && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] text-amber-700">
                  {catalogError}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {filteredCategories.length === 0 ? (
                <div className="h-full flex items-center justify-center px-6 text-center">
                  <div>
                    <Search size={18} className="mx-auto text-slate-200 mb-2" />
                    <div className="text-[11px] font-medium text-slate-500">No matching nodes</div>
                    <div className="text-[10px] text-slate-400 mt-1">Try a different keyword or clear the filter.</div>
                  </div>
                </div>
              ) : (
                <div
                  className="h-full flex transition-transform duration-300"
                  style={{ width: "520px", transform: `translateX(${selectedCategory ? "-260px" : "0px"})`, transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                >
                  <div className="w-[260px] h-full overflow-y-auto px-2.5 py-3">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className="w-full mb-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left hover:border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                            <category.icon size={14} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-semibold text-slate-800">{category.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                              {category.description || `${category.items.length} node${category.items.length !== 1 ? "s" : ""}`}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="w-[260px] h-full overflow-y-auto px-2.5 py-3">
                    <div className="flex items-center gap-2 px-1 mb-2.5">
                      <button
                        onClick={() => setActiveCategory(null)}
                        className="w-7 h-7 rounded-md border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft size={13} />
                      </button>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800 truncate">
                          {selectedCategory?.name || "Nodes library"}
                        </div>
                        {selectedCategory?.description && (
                          <div className="text-[10px] text-slate-400 truncate">{selectedCategory.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {selectedCategory?.items.map((item) => {
                        const isAdding = activeAddingNode === item.name;
                        return (
                          <button
                            key={`${selectedCategory.id}-${item.stepType}-${item.name}`}
                            disabled={!!activeAddingNode}
                            onClick={() => void handleAddLibraryNode(item)}
                            className={cn(
                              "w-full rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left transition-all relative overflow-hidden",
                              isAdding
                                ? "border-violet-300 bg-violet-50"
                                : activeAddingNode
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            {isAdding && (
                              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-violet-100 overflow-hidden">
                                <div className="h-full w-1/3 bg-violet-500 rounded-full animate-[slideRight_1s_ease-in-out_infinite]" style={{ animation: "slideRight 1s ease-in-out infinite" }} />
                              </div>
                            )}
                            <div className="flex items-start gap-2.5">
                              <div className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5",
                                isAdding ? "bg-violet-100 text-violet-600" : "bg-slate-50 text-slate-500"
                              )}>
                                {isAdding ? <Loader2 size={13} className="animate-spin" /> : <item.icon size={13} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="text-[11px] font-semibold text-slate-800 truncate flex-1">
                                    {isAdding ? "Adding node..." : item.name}
                                  </div>
                                  {item.supportsBranches && (
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-emerald-600">
                                      Branches
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  {isAdding ? "Fetching backend defaults" : item.description || item.meta}
                                </div>
                                {!isAdding && (
                                  <div className="text-[9px] text-slate-300 mt-1 uppercase tracking-wide">
                                    {item.category || item.meta}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {open && activeTool === "connections" && (
        <div className="w-[340px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={13} className="text-violet-500" />
              <span className="text-[12px] font-semibold text-slate-800">Connections</span>
            </div>
            <span className="text-[10px] text-slate-400">{edges.length} edge{edges.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pt-3 pb-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Workflow Edges</div>
              {edges.length === 0 ? (
                <div className="text-center py-6">
                  <Link2 size={20} className="mx-auto text-slate-200 mb-2" />
                  <div className="text-[11px] text-slate-400">No connections yet</div>
                  <div className="text-[10px] text-slate-300 mt-1">Connect nodes to create edges</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {edges.map((edge) => {
                    const srcStep = steps.find((s) => s.id === edge.source);
                    const tgtStep = steps.find((s) => s.id === edge.target);
                    const srcName = srcStep?.name ?? edge.source.slice(0, 12);
                    const tgtName = tgtStep?.name ?? edge.target.slice(0, 12);
                    const isEditing = editingEdge === edge.id;
                    return (
                      <div key={edge.id} className={`rounded-lg border px-3 py-2.5 transition-colors ${isEditing ? "border-violet-300 bg-violet-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]" title={srcName}>{srcName}</span>
                              <ArrowRight size={10} className="text-slate-300 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]" title={tgtName}>{tgtName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {edge.label && !isEditing && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                                edge.label === "true" ? "bg-emerald-100 text-emerald-700" :
                                edge.label === "false" ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-500"
                              }`}>
                                {edge.label}
                              </span>
                            )}
                            <button
                              onClick={() => setEditingEdge(isEditing ? null : edge.id)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              <Edit3 size={10} />
                            </button>
                            {onDeleteEdge && (
                              <button
                                onClick={() => onDeleteEdge(edge.id)}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
                            <div>
                              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Label</div>
                              <select
                                value={edge.label ?? ""}
                                onChange={(e) => {
                                  onUpdateEdge?.(edge.id, { label: e.target.value || null });
                                  setEditingEdge(null);
                                }}
                                className="h-7 w-full appearance-none rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none focus:border-violet-400 cursor-pointer"
                              >
                                <option value="">No label</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                                <option value="default">default</option>
                              </select>
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Source: <span className="text-slate-600">{srcStep?.type ?? "unknown"}</span> &middot; Target: <span className="text-slate-600">{tgtStep?.type ?? "unknown"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform Connections Section */}
            <div className="px-3 pt-4 pb-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Platform Connections</div>
                <a href="/dashboard/credentials" target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-500 hover:text-violet-700 flex items-center gap-0.5">
                  <ExternalLink size={9} /> Vault
                </a>
              </div>
              {connectionsLoading ? (
                <div className="text-center py-4">
                  <Loader2 size={14} className="mx-auto text-slate-300 animate-spin mb-1" />
                  <div className="text-[10px] text-slate-400">Loading...</div>
                </div>
              ) : (
                <>
                  {vaultConnections.length === 0 && vaultCredentials.length === 0 ? (
                    <div className="text-center py-4">
                      <KeyRound size={16} className="mx-auto text-slate-200 mb-1.5" />
                      <div className="text-[11px] text-slate-400">No connections configured</div>
                      <a href="/dashboard/credentials" target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700">
                        <Plus size={10} /> Add connection
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {vaultConnections.map((conn) => (
                        <div key={conn.id} className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
                              <Globe size={11} className="text-violet-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-slate-700 truncate">{conn.name}</div>
                              <div className="text-[9px] text-slate-400">{conn.app} &middot; {conn.subtitle}</div>
                            </div>
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                              conn.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>{conn.status}</span>
                          </div>
                        </div>
                      ))}
                      {vaultCredentials.map((cred) => (
                        <div key={cred.id} className="rounded-lg border border-slate-100 bg-white px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                              <KeyRound size={11} className="text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-slate-700 truncate">{cred.name}</div>
                              <div className="text-[9px] text-slate-400">{cred.credential_type} &middot; {cred.scope}</div>
                            </div>
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                              cred.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                            }`}>{cred.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Executions Tab ═══ */}
      {open && activeTool === "executions" && (
        <div className="w-[340px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-violet-500" />
              <span className="text-[12px] font-semibold text-slate-800">Execution History</span>
            </div>
            <button
              onClick={() => {
                setExecutionsLoading(true);
                api.listExecutions().then(setExecutions).catch(() => {}).finally(() => setExecutionsLoading(false));
              }}
              disabled={executionsLoading}
              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={11} className={executionsLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-3">
            {executionsLoading ? (
              <div className="text-center py-8">
                <Loader2 size={16} className="mx-auto text-slate-300 animate-spin mb-2" />
                <div className="text-[11px] text-slate-400">Loading executions...</div>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-8">
                <Activity size={20} className="mx-auto text-slate-200 mb-2" />
                <div className="text-[11px] text-slate-400">No executions yet</div>
                <div className="text-[10px] text-slate-300 mt-1">Run the workflow to see execution history</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {executions
                  .filter((e) => !workflowId || e.workflow_id === workflowId)
                  .slice(0, 50)
                  .map((exec) => {
                    const statusIcon = exec.status === "success" ? CheckCircle2 :
                      exec.status === "failed" ? XCircle :
                      exec.status === "running" ? Loader2 : Clock;
                    const statusColor = exec.status === "success" ? "text-emerald-500" :
                      exec.status === "failed" ? "text-red-500" :
                      exec.status === "running" ? "text-amber-500 animate-spin" : "text-slate-400";
                    const StatusIcon = statusIcon;
                    return (
                      <button
                        key={exec.id}
                        onClick={() => onSelectExecution?.(exec)}
                        className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left hover:border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <StatusIcon size={12} className={statusColor} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-slate-800 truncate">
                              {exec.workflow_name || "Execution"}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400">
                                {new Date(exec.started_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {exec.duration_ms != null && (
                                <span className="text-[9px] text-slate-300">{exec.duration_ms}ms</span>
                              )}
                              <span className={`rounded px-1 py-px text-[8px] font-semibold ${
                                exec.status === "success" ? "bg-emerald-100 text-emerald-700" :
                                exec.status === "failed" ? "bg-red-100 text-red-700" :
                                exec.status === "running" ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-500"
                              }`}>{exec.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {exec.status === "failed" && onRetryExecution && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onRetryExecution(exec.id); }}
                                className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-violet-500 transition-colors"
                                title="Retry"
                              >
                                <RefreshCw size={10} />
                              </button>
                            )}
                            <ChevronRight size={10} className="text-slate-300" />
                          </div>
                        </div>
                        {exec.steps && exec.steps.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-0.5">
                            {exec.steps.slice(0, 8).map((step, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${
                                step.status === "success" ? "bg-emerald-400" :
                                step.status === "failed" ? "bg-red-400" :
                                step.status === "running" ? "bg-amber-400" :
                                "bg-slate-200"
                              }`} title={`${step.name}: ${step.status}`} />
                            ))}
                            {exec.steps.length > 8 && (
                              <span className="text-[8px] text-slate-300 ml-0.5">+{exec.steps.length - 8}</span>
                            )}
                          </div>
                        )}
                        {exec.error_text && (
                          <div className="mt-1 text-[9px] text-red-400 truncate">{exec.error_text}</div>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <a href="/dashboard/executions" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700">
                <ExternalLink size={9} /> View all executions
              </a>
            </div>
          </div>
        </div>
      )}

      {open && activeTool === "tests" && (
        <div className="w-[260px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center">
            <div className="flex items-center gap-2">
              <FlaskConical size={13} className="text-slate-500" />
              <span className="text-[12px] font-semibold text-slate-800">Test runner</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2">
            {steps.length === 0 ? (
              <div className="text-center py-8">
                <FlaskConical size={20} className="mx-auto text-slate-200 mb-2" />
                <div className="text-[11px] text-slate-400">No steps to test</div>
              </div>
            ) : (
              steps.map((step) => (
                <div key={step.id} className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                  <div className="text-[11px] font-semibold text-slate-800 truncate">{step.name}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">{step.type}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">
                      <FlaskConical size={9} /> Test in panel
                    </span>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 text-[11px] text-slate-400">
              Select a step, then use the Test tab in the detail panel to run individual tests with custom payloads.
            </div>
          </div>
        </div>
      )}

      {open && activeTool === "versions" && (
        <div className="w-[260px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 size={13} className="text-slate-500" />
              <span className="text-[12px] font-semibold text-slate-800">Versions</span>
            </div>
            {workflowId && (
              <button
                disabled={!!versionAction}
                onClick={async () => {
                  if (!workflowId) return;
                  setVersionAction("snapshot");
                  try {
                    const v = await api.createWorkflowVersion(workflowId, "Manual snapshot");
                    setVersions((prev) => [v, ...prev]);
                  } catch { /* ignore */ }
                  setVersionAction(null);
                }}
                className="h-6 px-2 rounded-md border border-slate-100 bg-white text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {versionAction === "snapshot" ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Snapshot
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5">
            {versionsLoading ? (
              <div className="text-center py-8">
                <Loader2 size={16} className="mx-auto text-slate-300 animate-spin mb-2" />
                <div className="text-[11px] text-slate-400">Loading versions...</div>
              </div>
            ) : versions.length === 0 ? (
              <>
                <div className="rounded-lg border border-slate-900/10 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-800">Current draft</span>
                    <span className="rounded px-1 py-px text-[9px] font-medium text-white bg-violet-600">latest</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{steps.length} step{steps.length !== 1 ? "s" : ""} &middot; {edges.length} edge{edges.length !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  No snapshots yet. Click Snapshot to save the current state, or Publish to create a production version.
                </div>
              </>
            ) : (
              versions.map((v, i) => {
                const statusColors: Record<string, string> = {
                  published: "bg-emerald-500",
                  staging: "bg-amber-500",
                  draft_snapshot: "bg-slate-400",
                };
                const statusLabels: Record<string, string> = {
                  published: "prod",
                  staging: "staging",
                  draft_snapshot: "draft",
                };
                return (
                  <div key={v.id} className={`rounded-lg border px-3 py-2.5 ${i === 0 ? "border-slate-900/10 bg-slate-50" : "border-slate-100 bg-white"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-800">v{v.version_number}</span>
                      <span className={`rounded px-1 py-px text-[9px] font-medium text-white ${statusColors[v.status] ?? "bg-slate-400"}`}>
                        {statusLabels[v.status] ?? v.status}
                      </span>
                    </div>
                    {v.notes && <div className="text-[10px] text-slate-500 mt-1 truncate">{v.notes}</div>}
                    <div className="text-[10px] text-slate-400 mt-1">{new Date(v.created_at).toLocaleString()}</div>
                    {v.status === "draft_snapshot" && workflowId && (
                      <button
                        disabled={!!versionAction}
                        onClick={async () => {
                          setVersionAction("promote-" + v.id);
                          try {
                            const promoted = await api.promoteWorkflow(workflowId!, "staging", `Promote v${v.version_number}`);
                            setVersions((prev) => prev.map((pv) => pv.id === v.id ? { ...pv, status: "staging" } : pv));
                          } catch { /* ignore */ }
                          setVersionAction(null);
                        }}
                        className="mt-2 h-6 w-full rounded-lg border border-slate-200 bg-white text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {versionAction === "promote-" + v.id ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                        Promote to staging
                      </button>
                    )}
                  </div>
                );
              })
            )}
            {workflowId && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  disabled={!!versionAction}
                  onClick={async () => {
                    if (!workflowId) return;
                    setVersionAction("publish");
                    try {
                      const published = await api.publishWorkflow(workflowId, "Published from studio");
                      setVersions((prev) => [published, ...prev]);
                    } catch { /* ignore */ }
                    setVersionAction(null);
                  }}
                  className="w-full h-8 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {versionAction === "publish" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  Publish to production
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {open && activeTool === "code" && (
        <div className="w-[260px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center">
            <div className="flex items-center gap-2">
              <Braces size={13} className="text-slate-500" />
              <span className="text-[12px] font-semibold text-slate-800">Workflow JSON</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <pre className="p-4 text-[10px] leading-5 text-slate-600 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify({ steps: steps.map((s) => ({ id: s.id, name: s.name, type: s.type })), edges: edges.map((e) => ({ source: e.source, target: e.target, label: e.label })) }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {open && activeTool === "knowledge" && (
        <div className="w-[260px] h-full bg-white border-r border-slate-100 overflow-hidden flex flex-col">
          <div className="h-12 px-3 border-b border-slate-100 flex items-center">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-slate-500" />
              <span className="text-[12px] font-semibold text-slate-800">Knowledge base</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-2">
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-800">Keyboard shortcuts</div>
              <div className="mt-1.5 space-y-1 text-[10px] text-slate-500">
                <div className="flex justify-between"><span>Undo</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+Z</kbd></div>
                <div className="flex justify-between"><span>Redo</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+Y</kbd></div>
                <div className="flex justify-between"><span>Command bar</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+K</kbd></div>
                <div className="flex justify-between"><span>Duplicate</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+D</kbd></div>
                <div className="flex justify-between"><span>Save</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+S</kbd></div>
                <div className="flex justify-between"><span>Run workflow</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Ctrl+Enter</kbd></div>
                <div className="flex justify-between"><span>Open node panel</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">N</kbd></div>
                <div className="flex justify-between"><span>Tidy workflow</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Shift+Alt+T</kbd></div>
                <div className="flex justify-between"><span>Publish workflow</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Shift+P</kbd></div>
                <div className="flex justify-between"><span>Delete</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Del</kbd></div>
                <div className="flex justify-between"><span>Deselect</span><kbd className="font-mono bg-slate-50 px-1 rounded text-[9px]">Esc</kbd></div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <div className="text-[11px] font-semibold text-slate-800">Node types</div>
              <div className="mt-1.5 space-y-1 text-[10px] text-slate-500">
                <div><span className="font-medium text-slate-700">Trigger</span> — starts workflow execution</div>
                <div><span className="font-medium text-slate-700">Transform</span> — processes/transforms data</div>
                <div><span className="font-medium text-slate-700">Condition</span> — branches based on logic</div>
                <div><span className="font-medium text-slate-700">LLM</span> — AI-powered processing</div>
                <div><span className="font-medium text-slate-700">Output</span> — sends results externally</div>
                <div><span className="font-medium text-slate-700">Delay</span> — pauses execution</div>
                <div><span className="font-medium text-slate-700">Human</span> — waits for approval</div>
                <div><span className="font-medium text-slate-700">Callback</span> — waits for external signal</div>
              </div>
            </div>
            <div className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
              <div className="text-[12px] font-semibold text-slate-900">Tips</div>
              <div className="mt-2 space-y-1 text-[10px] text-slate-500">
                <div>Click the + on any edge to insert a node between two steps.</div>
                <div>Toggle the minimap from the canvas controls.</div>
                <div>Use the AI chat panel to generate workflow steps from text.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && activeTool === "settings" && (
        <SettingsPanel />
      )}

      {open && activeTool === "help" && (
        <div className="w-[272px] h-full bg-white border-r border-slate-200 overflow-hidden flex flex-col">
          <div className="h-16 px-4 border-b border-slate-200 flex items-center">
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-[#4f46e5]" />
              <span className="text-[13px] font-semibold text-slate-900">Help</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {[
              { title: "Getting started", desc: "Learn the studio basics" },
              { title: "Building flows", desc: "Add nodes, edges, and conditions" },
              { title: "Testing steps", desc: "Run individual steps with payloads" },
              { title: "AI assistant", desc: "Generate workflows from text prompts" },
              { title: "Import & export", desc: "Share workflows as JSON bundles" },
              { title: "Keyboard shortcuts", desc: "Speed up your workflow building" },
            ].map((item) => (
              <button key={item.title} className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-left hover:border-slate-300 hover:bg-slate-50 transition-all">
                <div className="text-[12px] font-semibold text-slate-900">{item.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-20 flex flex-col gap-2">
        {quickActions.map((action) => (
          <Tooltip key={action.id} content={action.label} position="right">
            <button
              onClick={() => {
                if (action.id === "add") {
                  onToolChange("nodes");
                  if (!open) onToggle();
                } else if (action.id === "branch") {
                  onAddStep({
                    type: "condition",
                    name: "New Branch",
                    config: { field: "", operator: "equals", equals: "" },
                  });
                } else if (action.id === "assist") {
                  onOpenChat?.();
                } else if (action.id === "custom") {
                  onAddStep({
                    type: "code",
                    name: "Custom Node",
                    config: { language: "python", script: "# Custom node logic\nresult = {'processed': True}" },
                  });
                }
              }}
              className={cn(
                "w-10 h-10 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all",
                action.id === "add" && "text-[#4f46e5] border-violet-200 hover:border-violet-300 hover:bg-violet-50",
                action.id === "assist" && "text-violet-500 hover:text-violet-700",
              )}
            >
              <action.icon size={16} />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default NodesPanel;
