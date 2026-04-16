import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Clock3,
  Code,
  Copy,
  Cpu,
  Database,
  FileText,
  Filter,
  GitBranch,
  Globe,
  Link2,
  Loader2,
  Merge,
  Pin,
  Play,
  Plus,
  Repeat,
  Send,
  Settings,
  Shield,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  Users,
  Webhook,
  X,
  Zap,
  FileOutput,
} from "lucide-react";
import type {
  ApiNodeConfigValidationResponse,
  ApiNodeDataReference,
  ApiNodeEditorField,
  ApiNodeEditorResponse,
  ApiNodePreviewResponse,
  ApiWorkflowEdge,
  ApiWorkflowStep,
} from "@/lib/api";
import { api } from "@/lib/api";
import {
  FieldLabel,
  FieldText,
  FieldTextarea,
  FieldNumber,
  FieldSelect,
  FieldToggle,
  FieldSlider,
  FieldTags,
  FieldKeyValue,
  FieldMessages,
  FieldCode,
  FieldJson,
  FieldCredential,
  FieldModelSelect,
  Section,
  normalizeKeyValuePairs,
  normalizeMessages,
  prettyLabel,
} from "./fields";
import CredentialCreateOverlay from "./CredentialCreateOverlay";
import ExpressionBuilderDialog from "./ExpressionBuilderDialog";
import StudioDataViewer from "./StudioDataViewer";
import { buildExpressionPreview, validateExpressionTemplate, type ExpressionValidationIssue } from "./expression-utils";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface NodeConfigPanelProps {
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
  onSelectStep?: (stepId: string) => void;
  onAddClusterNode?: (rootId: string, slotKey: string) => void;
  onClose: () => void;
  onTestStep?: (step: ApiWorkflowStep, payload: Record<string, unknown>) => Promise<StepTestResult>;
}

interface StepTestResult {
  status: "success" | "failed" | "error";
  output?: Record<string, unknown> | null;
  error?: string | null;
  duration_ms: number;
  pinned_data_used?: boolean;
}

type TabId = "parameters" | "settings" | "test";

interface FieldExpressionValidation {
  field: ApiNodeEditorField;
  issues: ExpressionValidationIssue[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   NODE TYPE METADATA
   ═══════════════════════════════════════════════════════════════════════════ */

const typeMeta: Record<string, { icon: React.ElementType; subtitle: string; iconClass: string; iconBg: string }> = {
  trigger: { icon: Webhook, subtitle: "Trigger", iconClass: "text-sky-600", iconBg: "bg-sky-50" },
  transform: { icon: Sparkles, subtitle: "Transform", iconClass: "text-amber-600", iconBg: "bg-amber-50" },
  condition: { icon: GitBranch, subtitle: "Condition", iconClass: "text-emerald-600", iconBg: "bg-emerald-50" },
  llm: { icon: Bot, subtitle: "AI / LLM", iconClass: "text-violet-600", iconBg: "bg-violet-50" },
  output: { icon: Send, subtitle: "Output", iconClass: "text-rose-600", iconBg: "bg-rose-50" },
  delay: { icon: Clock3, subtitle: "Delay", iconClass: "text-slate-600", iconBg: "bg-slate-50" },
  human: { icon: Users, subtitle: "Human task", iconClass: "text-fuchsia-600", iconBg: "bg-fuchsia-50" },
  callback: { icon: Link2, subtitle: "Callback wait", iconClass: "text-cyan-600", iconBg: "bg-cyan-50" },
  loop: { icon: Repeat, subtitle: "Loop / iterator", iconClass: "text-teal-600", iconBg: "bg-teal-50" },
  code: { icon: Code, subtitle: "Code / script", iconClass: "text-indigo-600", iconBg: "bg-indigo-50" },
  http_request: { icon: Globe, subtitle: "HTTP request", iconClass: "text-blue-600", iconBg: "bg-blue-50" },
  filter: { icon: Filter, subtitle: "Filter", iconClass: "text-orange-600", iconBg: "bg-orange-50" },
  merge: { icon: Merge, subtitle: "Merge", iconClass: "text-pink-600", iconBg: "bg-pink-50" },
  ai_agent: { icon: Brain, subtitle: "AI agent", iconClass: "text-purple-600", iconBg: "bg-purple-50" },
  ai_summarize: { icon: Sparkles, subtitle: "Summarization chain", iconClass: "text-purple-600", iconBg: "bg-purple-50" },
  ai_extract: { icon: FileOutput, subtitle: "Information extractor", iconClass: "text-blue-600", iconBg: "bg-blue-50" },
  ai_classify: { icon: Filter, subtitle: "Text classifier", iconClass: "text-fuchsia-600", iconBg: "bg-fuchsia-50" },
  ai_sentiment: { icon: Bot, subtitle: "Sentiment analysis", iconClass: "text-pink-600", iconBg: "bg-pink-50" },
  ai_chat_model: { icon: Cpu, subtitle: "AI model", iconClass: "text-violet-600", iconBg: "bg-violet-50" },
  ai_memory: { icon: Database, subtitle: "Cluster memory", iconClass: "text-emerald-600", iconBg: "bg-emerald-50" },
  ai_tool: { icon: Bot, subtitle: "Cluster tool", iconClass: "text-amber-600", iconBg: "bg-amber-50" },
  ai_output_parser: { icon: FileOutput, subtitle: "Output parser", iconClass: "text-rose-600", iconBg: "bg-rose-50" },
};

const getTypeMeta = (type: string) => typeMeta[type] ?? typeMeta.transform;

interface ClusterAttachmentSlot {
  key: string;
  label: string;
  help: string;
  icon: React.ElementType;
  required: boolean;
  multi?: boolean;
}

const CLUSTER_ATTACHMENT_SLOTS: Record<string, ClusterAttachmentSlot[]> = {
  ai_agent: [
    { key: "model", label: "Model", help: "Required. Supplies the model/provider configuration used by the agent.", icon: Cpu, required: true },
    { key: "memory", label: "Memory", help: "Optional. Adds conversation memory or session state.", icon: Database, required: false },
    { key: "tool", label: "Tool", help: "Required. Agents need at least one callable tool, similar to n8n's AI Agent setup.", icon: Zap, required: true, multi: true },
    { key: "output_parser", label: "Output Parser", help: "Optional. Constrains the agent's structured output.", icon: FileOutput, required: false },
  ],
  ai_summarize: [
    { key: "model", label: "Model", help: "Required. Selects the summarization model.", icon: Cpu, required: true },
  ],
  ai_extract: [
    { key: "model", label: "Model", help: "Required. Selects the extraction model.", icon: Cpu, required: true },
    { key: "output_parser", label: "Output Parser", help: "Optional. Defines the structured extraction format.", icon: FileOutput, required: false },
  ],
  ai_classify: [
    { key: "model", label: "Model", help: "Required. Selects the classification model.", icon: Cpu, required: true },
    { key: "output_parser", label: "Output Parser", help: "Optional. Forces structured classification output.", icon: FileOutput, required: false },
  ],
  ai_sentiment: [
    { key: "model", label: "Model", help: "Required. Selects the sentiment model.", icon: Cpu, required: true },
  ],
};

/* ─── Model lists per provider (for fallback when backend schema unavailable) ── */

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
  custom: [{ value: "default", label: "Default Model", desc: "Custom endpoint" }],
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONDITIONAL VISIBILITY HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

const getShowWhenExpectedValue = (showWhen: ApiNodeEditorField["show_when"]) => {
  if (!showWhen) return undefined;
  return showWhen.equals !== undefined ? showWhen.equals : showWhen.value;
};

const shouldShowField = (field: ApiNodeEditorField, config: Record<string, unknown>) => {
  if (!field.show_when) return true;
  return config[field.show_when.field] === getShowWhenExpectedValue(field.show_when);
};

const fieldSupportsExpressions = (field: ApiNodeEditorField) => (
  field.type === "string"
  || field.type === "datetime"
  || field.type === "password"
  || field.type === "textarea"
);

/* Section icon selector */
const sectionIcon = (title: string): React.ElementType => {
  const t = title.toLowerCase();
  if (t.includes("auth")) return Shield;
  if (t.includes("header") || t.includes("body")) return FileText;
  if (t.includes("response") || t.includes("option")) return Sliders;
  if (t.includes("request")) return Globe;
  if (t.includes("tool") || t.includes("permission") || t.includes("abilit")) return Zap;
  if (t.includes("agent") || t.includes("strateg")) return Brain;
  if (t.includes("memory")) return Database;
  if (t.includes("cluster") || t.includes("sub-agent")) return Users;
  if (t.includes("output")) return Send;
  if (t.includes("model") || t.includes("parameter") || t.includes("provider")) return Cpu;
  if (t.includes("prompt") || t.includes("message") || t.includes("system")) return FileText;
  if (t.includes("advanced")) return Settings;
  if (t.includes("runtime") || t.includes("execution")) return Cpu;
  if (t.includes("safety") || t.includes("guardrail")) return Shield;
  if (t.includes("vision") || t.includes("multimodal")) return Globe;
  if (t.includes("function") || t.includes("calling")) return Zap;
  return Settings;
};

const formatJsonValue = (value: unknown) => JSON.stringify(value ?? {}, null, 2);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
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
  onSelectStep,
  onAddClusterNode,
  onClose,
  onTestStep,
}) => {
  /* ── State ── */
  const [tab, setTab] = useState<TabId>("parameters");
  const [draft, setDraft] = useState<ApiWorkflowStep | null>(step);
  const [testPayload, setTestPayload] = useState("{}");
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<StepTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [vaultCredentials, setVaultCredentials] = useState<{ id: string; name: string; provider?: string }[]>([]);
  const [editor, setEditor] = useState<ApiNodeEditorResponse | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ApiNodeConfigValidationResponse | null>(null);
  const [preview, setPreview] = useState<ApiNodePreviewResponse | null>(null);
  const [liveStateError, setLiveStateError] = useState<string | null>(null);
  const [credOverlayOpen, setCredOverlayOpen] = useState(false);
  const [nameEditing, setNameEditing] = useState(false);
  const [pinnedEditorValue, setPinnedEditorValue] = useState("{}");
  const [pinnedEditorError, setPinnedEditorError] = useState<string | null>(null);
  const [activeExpressionFieldKey, setActiveExpressionFieldKey] = useState<string | null>(null);
  const [expressionBuilderOpen, setExpressionBuilderOpen] = useState(false);
  const [expressionActionMessage, setExpressionActionMessage] = useState<string | null>(null);
  const [mappingSearch, setMappingSearch] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* ── Load vault credentials ── */
  const fetchCredentials = useCallback(() => {
    api.listVaultCredentials()
      .then((creds) => setVaultCredentials(creds as { id: string; name: string; provider?: string }[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  /* ── Load node editor schema from backend ── */
  useEffect(() => {
    let ignore = false;
    if (!step) {
      setEditor(null);
      setEditorError(null);
      setEditorLoading(false);
      return () => { ignore = true; };
    }
    setEditorLoading(true);
    setEditorError(null);
    api
      .getStudioNodeEditor(step.type, {
        workflowId: workflowId ?? undefined,
        stepId: step.id,
        triggerType: triggerType ?? undefined,
      })
      .then((payload) => { if (!ignore) setEditor(payload); })
      .catch((err) => { if (!ignore) { setEditor(null); setEditorError(err instanceof Error ? err.message : "Failed to load node editor."); } })
      .finally(() => { if (!ignore) setEditorLoading(false); });
    return () => { ignore = true; };
  }, [step, workflowId, triggerType]);

  /* ── Reset on step change ── */
  useEffect(() => {
    setDraft(step);
    setTab("parameters");
    setTestResult(null);
    setTestError(null);
    setTestPayload("{}");
    setValidation(null);
    setPreview(null);
    setLiveStateError(null);
    setCredOverlayOpen(false);
    setNameEditing(false);
    setPinnedEditorError(null);
    setPinnedEditorValue(formatJsonValue(step?.config?._pinned_data));
    setActiveExpressionFieldKey(null);
    setExpressionBuilderOpen(false);
    setExpressionActionMessage(null);
    setMappingSearch("");
  }, [step]);

  /* ── Debounced live validation + preview ── */
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
        workflowId
          ? api.validateStudioWorkflowStep(workflowId, draft.id, {
              config: draft.config,
              triggerType: triggerType ?? undefined,
              name: draft.name,
            })
          : api.validateStudioNode(draft.type, {
              config: draft.config,
              triggerType: triggerType ?? undefined,
              name: draft.name,
            }),
        api.previewStudioNode({
          step: draft,
          triggerType: triggerType ?? undefined,
        }),
      ])
        .then(([v, p]) => { if (!ignore) { setValidation(v); setPreview(p); setLiveStateError(null); } })
        .catch((err) => { if (!ignore) setLiveStateError(err instanceof Error ? err.message : "Validation failed."); });
    }, 300);
    return () => { ignore = true; window.clearTimeout(timer); };
  }, [draft, triggerType, workflowId]);

  /* ── Derived ── */
  const connectionTargets = useMemo(() => {
    if (!draft) return { defaultTarget: "", trueTarget: "", falseTarget: "" };
    const outgoing = edges.filter((e) => e.source === draft.id);
    return {
      defaultTarget: outgoing.find((e) => !e.label)?.target ?? "",
      trueTarget: outgoing.find((e) => (e.label ?? "").toLowerCase() === "true")?.target ?? "",
      falseTarget: outgoing.find((e) => (e.label ?? "").toLowerCase() === "false")?.target ?? "",
    };
  }, [draft, edges]);

  const configEntries = useMemo(() => Object.entries(draft?.config ?? {}), [draft]);
  const hasPinnedData = useMemo(
    () => Object.prototype.hasOwnProperty.call(draft?.config ?? {}, "_pinned_data"),
    [draft],
  );
  const pinnedData = useMemo(() => (hasPinnedData ? draft?.config?._pinned_data : null), [draft, hasPinnedData]);
  const latestRuntimeData = useMemo(() => testResult?.output ?? preview?.sample_output ?? null, [preview, testResult]);
  const latestRuntimeSource = testResult?.output
    ? testResult.pinned_data_used
      ? "pinned test output"
      : "test output"
    : preview?.sample_output
      ? preview.data_source === "pinned"
        ? "pinned sample output"
        : "sample output"
      : null;
  const expressionTargetField = useMemo(() => {
    if (!editor || !activeExpressionFieldKey) return null;
    return editor.sections.flatMap((section) => section.fields).find((field) => field.key === activeExpressionFieldKey) ?? null;
  }, [activeExpressionFieldKey, editor]);
  const expressionTargetValue = useMemo(() => {
    if (!expressionTargetField || !draft) return "";
    const currentValue = draft.config[expressionTargetField.key] ?? expressionTargetField.value;
    return typeof currentValue === "string" ? currentValue : "";
  }, [draft, expressionTargetField]);
  const groupedDataReferences = useMemo(() => {
    const groups = new Map<string, ApiNodeDataReference[]>();
    const normalizedSearch = mappingSearch.trim().toLowerCase();
    (editor?.data_references ?? []).forEach((reference) => {
      if (normalizedSearch) {
        const haystack = [
          reference.step_name,
          reference.path,
          reference.expression,
          reference.expression_core ?? "",
          reference.namespace ?? "",
          reference.preview ?? "",
          ...reference.search_terms,
        ].join(" ").toLowerCase();
        if (!haystack.includes(normalizedSearch)) return;
      }
      const list = groups.get(reference.step_name) ?? [];
      list.push(reference);
      groups.set(reference.step_name, list);
    });
    return Array.from(groups.entries()).map(([stepName, references]) => [
      stepName,
      [...references].sort((left, right) => {
        if (left.is_root !== right.is_root) return left.is_root ? -1 : 1;
        if (left.depth !== right.depth) return left.depth - right.depth;
        return left.path.localeCompare(right.path);
      }),
    ] as const);
  }, [editor, mappingSearch]);
  const expressionPreview = useMemo(() => {
    if (!expressionTargetField || !expressionTargetValue.includes("{{")) return null;
    return buildExpressionPreview(expressionTargetValue, editor?.data_references ?? []);
  }, [editor, expressionTargetField, expressionTargetValue]);
  const expressionValidations = useMemo<FieldExpressionValidation[]>(() => {
    if (!editor || !draft) return [];
    return [...editor.sections, ...editor.node_settings]
      .flatMap((section) => section.fields)
      .filter((field) => fieldSupportsExpressions(field) && shouldShowField(field, draft.config))
      .map((field) => {
        const currentValue = draft.config[field.key] ?? field.value;
        if (typeof currentValue !== "string") return null;
        if (!currentValue.includes("{{") && !currentValue.includes("}}")) return null;
        const issues = validateExpressionTemplate(currentValue, editor.data_references ?? []);
        return issues.length > 0 ? { field, issues } : null;
      })
      .filter((entry): entry is FieldExpressionValidation => entry !== null);
  }, [draft, editor]);
  const expressionErrorCount = useMemo(
    () => expressionValidations.reduce((total, entry) => total + entry.issues.filter((issue) => issue.severity === "error").length, 0),
    [expressionValidations],
  );
  const expressionWarningCount = useMemo(
    () => expressionValidations.reduce((total, entry) => total + entry.issues.filter((issue) => issue.severity === "warning").length, 0),
    [expressionValidations],
  );
  const hasAnyDataReferences = (editor?.data_references?.length ?? 0) > 0;
  const clusterSlots = useMemo(() => CLUSTER_ATTACHMENT_SLOTS[draft?.type ?? ""] ?? [], [draft?.type]);
  const clusterParentId = typeof draft?.config?.cluster_parent_id === "string" ? draft.config.cluster_parent_id : null;
  const clusterSlotKey = typeof draft?.config?.cluster_slot === "string" ? draft.config.cluster_slot : null;
  const clusterParentStep = useMemo(
    () => (clusterParentId ? steps.find((stepItem) => stepItem.id === clusterParentId) ?? null : null),
    [clusterParentId, steps],
  );
  const clusterChildrenBySlot = useMemo(() => {
    const grouped: Record<string, ApiWorkflowStep[]> = {};
    if (!draft || clusterSlots.length === 0) return grouped;
    steps
      .filter((stepItem) => stepItem.config?.cluster_parent_id === draft.id)
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach((stepItem) => {
        const slotKey = typeof stepItem.config?.cluster_slot === "string" ? stepItem.config.cluster_slot : "model";
        grouped[slotKey] = [...(grouped[slotKey] ?? []), stepItem];
      });
    return grouped;
  }, [clusterSlots.length, draft, steps]);

  /* ── Handlers ── */
  const handleConfigChange = useCallback((key: string, value: unknown) => {
    setExpressionActionMessage(null);
    setDraft((c) => (c ? { ...c, config: { ...c.config, [key]: value } } : c));
  }, []);

  const handleInsertExpression = useCallback((expression: string) => {
    if (!activeExpressionFieldKey || !draft) return;
    const currentValue = draft.config[activeExpressionFieldKey];
    const nextValue = typeof currentValue === "string" && currentValue.length > 0
      ? `${currentValue}${currentValue.endsWith(" ") ? "" : " "}${expression}`
      : expression;
    handleConfigChange(activeExpressionFieldKey, nextValue);
  }, [activeExpressionFieldKey, draft, handleConfigChange]);

  const openExpressionBuilder = useCallback((field: ApiNodeEditorField) => {
    setActiveExpressionFieldKey(field.key);
    setExpressionBuilderOpen(true);
  }, []);

  const handleApplyExpressionBuilder = useCallback((value: string) => {
    if (!expressionTargetField) return;
    handleConfigChange(expressionTargetField.key, value);
    setActiveExpressionFieldKey(expressionTargetField.key);
  }, [expressionTargetField, handleConfigChange]);

  const persistStep = useCallback((nextStep: ApiWorkflowStep) => {
    setDraft(nextStep);
    onSave(nextStep);
    onConnectionsChange(nextStep.id, connectionTargets);
  }, [connectionTargets, onConnectionsChange, onSave]);

  const handleSave = useCallback(() => {
    if (expressionErrorCount > 0) {
      setExpressionActionMessage("Fix expression errors before saving this step.");
      setActiveExpressionFieldKey(expressionValidations[0]?.field.key ?? null);
      setTab("parameters");
      return;
    }
    if (draft) {
      persistStep(draft);
    }
  }, [draft, expressionErrorCount, expressionValidations, persistStep]);

  const handleTestRun = useCallback(async () => {
    if (!draft) return;
    if (expressionErrorCount > 0) {
      setExpressionActionMessage("Fix expression errors before running this test.");
      setActiveExpressionFieldKey(expressionValidations[0]?.field.key ?? null);
      setTab("parameters");
      return;
    }
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
          pinned_data_used: result.pinned_data_used,
        });
      } catch (studioErr) {
        if (!onTestStep) throw studioErr;
        const result = await onTestStep(draft, payload);
        setTestResult(result);
      }
    } catch (err) {
      setTestError(err instanceof SyntaxError ? "Invalid JSON payload." : err instanceof Error ? err.message : "Test execution failed.");
    } finally {
      setTestRunning(false);
    }
  }, [draft, expressionErrorCount, expressionValidations, onTestStep, testPayload, triggerType]);

  const handleCredentialCreated = useCallback((cred: { id: string; name: string; provider?: string }) => {
    setCredOverlayOpen(false);
    fetchCredentials();
    // Auto-select the newly created credential in the first credential field
    if (draft) {
      const credField = editor?.sections
        .flatMap((s) => s.fields)
        .find((f) => f.type === "credential");
      if (credField) {
        handleConfigChange(credField.key, cred.name);
      } else {
        handleConfigChange("credential_id", cred.name);
      }
    }
  }, [draft, editor, fetchCredentials, handleConfigChange]);

  const handlePinData = useCallback(() => {
    if (!draft || latestRuntimeData == null) return;
    const nextStep: ApiWorkflowStep = {
      ...draft,
      config: {
        ...draft.config,
        _pinned_data: latestRuntimeData,
      },
    };
    setPinnedEditorValue(formatJsonValue(latestRuntimeData));
    setPinnedEditorError(null);
    persistStep(nextStep);
  }, [draft, latestRuntimeData, persistStep]);

  const handleSavePinnedData = useCallback(() => {
    if (!draft) return;
    try {
      const parsed = JSON.parse(pinnedEditorValue);
      const nextStep: ApiWorkflowStep = {
        ...draft,
        config: {
          ...draft.config,
          _pinned_data: parsed,
        },
      };
      setPinnedEditorError(null);
      persistStep(nextStep);
    } catch {
      setPinnedEditorError("Pinned data must be valid JSON.");
    }
  }, [draft, persistStep, pinnedEditorValue]);

  const handleUnpinData = useCallback(() => {
    if (!draft) return;
    const nextConfig = { ...draft.config };
    delete nextConfig._pinned_data;
    const nextStep: ApiWorkflowStep = {
      ...draft,
      config: nextConfig,
    };
    setPinnedEditorValue("{}");
    setPinnedEditorError(null);
    persistStep(nextStep);
  }, [draft, persistStep]);

  const handleManageClusterSlot = useCallback((slotKey: string) => {
    if (!draft) return;
    const slot = clusterSlots.find((item) => item.key === slotKey);
    const attachedSteps = clusterChildrenBySlot[slotKey] ?? [];
    if (!slot) return;
    if (!slot.multi && attachedSteps[0] && onSelectStep) {
      onSelectStep(attachedSteps[0].id);
      return;
    }
    onAddClusterNode?.(draft.id, slotKey);
  }, [clusterChildrenBySlot, clusterSlots, draft, onAddClusterNode, onSelectStep]);

  /* ── Early return: no step selected ── */
  if (!draft) {
    return (
      <aside className="w-[380px] h-full shrink-0 border-l border-slate-200 bg-white">
        <div className="flex h-full items-center justify-center px-8 text-center">
          <div>
            <div className="text-[14px] font-semibold text-slate-800">Select a step</div>
            <div className="mt-2 text-[13px] leading-5 text-slate-400">
              Choose a node from the canvas to edit its configuration.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const meta = getTypeMeta(draft.type);
  const Icon = meta.icon;
  const validationCount = validation ? validation.issues.length : 0;

  const renderClusterAttachments = () => {
    if (clusterSlots.length === 0 && !clusterParentStep) return null;

    return (
      <Section title={clusterParentStep ? "AI attachment" : "AI attachments"} icon={Users} defaultOpen>
        <div className="space-y-3">
          {clusterParentStep && clusterSlotKey && (
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">Attached To</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium text-violet-900">{clusterParentStep.name}</div>
                  <div className="text-[11px] text-violet-700">{clusterSlotKey.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase())} slot</div>
                </div>
                {onSelectStep && (
                  <button
                    type="button"
                    onClick={() => onSelectStep(clusterParentStep.id)}
                    className="inline-flex h-8 items-center justify-center rounded-xl border border-violet-200 bg-white px-3 text-[12px] font-medium text-violet-700 transition-colors hover:bg-violet-100"
                  >
                    Open parent
                  </button>
                )}
              </div>
            </div>
          )}

          {clusterSlots.map((slot) => {
            const SlotIcon = slot.icon;
            const attachedSteps = clusterChildrenBySlot[slot.key] ?? [];
            return (
              <div key={slot.key} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <SlotIcon size={14} />
                      </span>
                      <div>
                        <div className="text-[13px] font-medium text-slate-800">{slot.label}</div>
                        <div className="text-[11px] text-slate-400">{slot.required ? "Required" : "Optional"}{slot.multi ? " · Multiple allowed" : ""}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[12px] leading-5 text-slate-500">{slot.help}</div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    {attachedSteps.length} attached
                  </span>
                </div>

                {attachedSteps.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachedSteps.map((attachedStep) => (
                      <button
                        key={attachedStep.id}
                        type="button"
                        onClick={() => onSelectStep?.(attachedStep.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 transition-colors hover:bg-violet-100"
                      >
                        <SlotIcon size={11} />
                        {attachedStep.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
                    Nothing attached yet.
                  </div>
                )}

                {onAddClusterNode && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleManageClusterSlot(slot.key)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Plus size={12} />
                      {!slot.multi && attachedSteps[0] ? `Open ${slot.label}` : attachedSteps.length > 0 ? `Add ${slot.label}` : `Attach ${slot.label}`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     FIELD RENDERER — renders a single ApiNodeEditorField to a field component
     ═══════════════════════════════════════════════════════════════════════════ */

  const renderEditorField = (field: ApiNodeEditorField) => {
    if (!shouldShowField(field, draft.config)) return null;
    const currentValue = draft.config[field.key] ?? field.value;
    const supportsExpressions = fieldSupportsExpressions(field) || !(field.type === "boolean" || field.type === "number" || field.type === "select" || field.type === "tags" || field.type === "credential" || field.type === "messages" || field.type === "keyvalue" || field.type === "json" || field.type === "code");

    /* Boolean → toggle inline */
    if (field.type === "boolean") {
      return (
        <div key={field.key}>
          <FieldToggle
            checked={Boolean(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
            label={field.label}
            help={field.help ?? undefined}
          />
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
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            allowExpressions
            onFocus={() => setActiveExpressionFieldKey(field.key)}
            onExpressionDrop={() => setActiveExpressionFieldKey(field.key)}
          />
        );
        break;
      case "password":
        control = (
          <FieldText
            type="password"
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            allowExpressions
            onFocus={() => setActiveExpressionFieldKey(field.key)}
            onExpressionDrop={() => setActiveExpressionFieldKey(field.key)}
          />
        );
        break;
      case "textarea":
        control = (
          <FieldTextarea
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            rows={4}
            allowExpressions
            onFocus={() => setActiveExpressionFieldKey(field.key)}
            onExpressionDrop={() => setActiveExpressionFieldKey(field.key)}
          />
        );
        break;
      case "code":
        control = (
          <FieldCode
            value={typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue ?? "", null, 2)}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            rows={6}
          />
        );
        break;
      case "json":
        control = (
          <FieldJson
            value={typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue ?? {}, null, 2)}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            rows={5}
          />
        );
        break;
      case "select":
        /* Special handling: if this is a model field with a provider sibling, use model select */
        if (field.key === "model" && field.options && field.options.length > 0) {
          const provider = String(draft.config.provider ?? "openai");
          const models = MODEL_OPTIONS[provider] ?? field.options.map((o) => ({ value: o.value, label: o.label, desc: "" }));
          control = (
            <FieldModelSelect
              models={models}
              value={currentValue == null ? "" : String(currentValue)}
              onChange={(v) => handleConfigChange(field.key, v)}
            />
          );
        } else {
          /* Provider select: auto-switch model when provider changes */
          const isProvider = field.key === "provider";
          control = (
            <FieldSelect
              value={currentValue == null ? "" : String(currentValue)}
              onChange={(v) => {
                handleConfigChange(field.key, v);
                if (isProvider) {
                  const firstModel = (MODEL_OPTIONS[v] ?? MODEL_OPTIONS.openai)[0];
                  if (firstModel) handleConfigChange("model", firstModel.value);
                }
              }}
              options={field.options?.map((o) => ({ value: o.value, label: o.label })) ?? []}
              placeholder={field.placeholder ?? undefined}
              searchable={field.options ? field.options.length > 6 : false}
            />
          );
        }
        break;
      case "number":
        control = (
          <FieldNumber
            value={typeof currentValue === "number" ? currentValue : Number(currentValue ?? 0)}
            onChange={(v) => handleConfigChange(field.key, v)}
            min={field.min}
            max={field.max}
            step={field.step}
            suffix={field.suffix ?? undefined}
          />
        );
        break;
      case "tags":
        control = (
          <FieldTags
            value={Array.isArray(currentValue) ? currentValue.map((i) => String(i)) : []}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
          />
        );
        break;
      case "credential":
        control = (
          <FieldCredential
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
            credentials={vaultCredentials}
            onCreateNew={() => setCredOverlayOpen(true)}
          />
        );
        break;
      case "messages":
        control = (
          <FieldMessages
            value={normalizeMessages(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
          />
        );
        break;
      case "keyvalue":
        control = (
          <FieldKeyValue
            value={normalizeKeyValuePairs(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
          />
        );
        break;
      default:
        control = (
          <FieldText
            value={currentValue == null ? "" : String(currentValue)}
            onChange={(v) => handleConfigChange(field.key, v)}
            placeholder={field.placeholder ?? undefined}
            allowExpressions
            onFocus={() => setActiveExpressionFieldKey(field.key)}
            onExpressionDrop={() => setActiveExpressionFieldKey(field.key)}
          />
        );
        break;
    }

    return (
      <div key={field.key} className="space-y-1">
        <FieldLabel label={field.label} required={field.required} help={field.help ?? undefined} />
        {control}
        {supportsExpressions && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-400">
              {activeExpressionFieldKey === field.key
                ? "Input pane is ready for this field."
                : "Use =, drag references, or open the full editor."}
            </div>
            <button
              type="button"
              onClick={() => openExpressionBuilder(field)}
              className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
            >
              <Sparkles size={11} /> Expression editor
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSchemaSections = (
    sections: NonNullable<ApiNodeEditorResponse["node_settings"]>,
    options?: { defaultOpenCount?: number; emptyState?: string },
  ) => {
    const defaultOpenCount = options?.defaultOpenCount ?? 2;
    const renderedSections: React.ReactNode[] = [];

    sections.forEach((section, idx) => {
      const visible = section.fields.filter((field) => shouldShowField(field, draft.config));
      if (visible.length === 0) return;
      renderedSections.push(
        <Section
          key={section.id}
          title={section.title}
          icon={sectionIcon(section.title)}
          defaultOpen={idx < defaultOpenCount}
          badge={visible.length}
        >
          {section.description && (
            <div className="mb-1 text-[12px] leading-5 text-slate-400">{section.description}</div>
          )}
          <div className="space-y-4">
            {visible.map(renderEditorField)}
          </div>
        </Section>,
      );
    });

    if (renderedSections.length > 0) {
      return renderedSections;
    }

    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-[13px] text-slate-500">
        {options?.emptyState ?? "No fields available for this node."}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     PARAMETERS TAB — schema-driven sections + fields
     ═══════════════════════════════════════════════════════════════════════════ */

  const renderParametersTab = () => {
    /* Step name at top */
    const nameBlock = (
      <div className="space-y-1">
        <FieldLabel label="Step name" required />
        <FieldText
          value={draft.name}
          onChange={(v) => setDraft({ ...draft, name: v })}
          placeholder="Step name"
        />
      </div>
    );

    /* Loading / error states */
    if (editorLoading) {
      return (
        <div className="space-y-4">
          {nameBlock}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-[13px] text-slate-500">
            <Loader2 size={14} className="animate-spin" /> Loading editor…
          </div>
        </div>
      );
    }

    if (editorError) {
      return (
        <div className="space-y-4">
          {nameBlock}
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {editorError}
          </div>
        </div>
      );
    }

    /* Schema-driven rendering */
    if (editor) {
      return (
        <div className="space-y-5">
          {nameBlock}

          {/* Editor warnings */}
          {editor.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-medium text-amber-700">
                <AlertCircle size={14} /> Warnings
              </div>
              <div className="mt-1.5 space-y-1 text-[12px] leading-5 text-amber-700/90">
                {editor.warnings.map((w, i) => <div key={i}>{w}</div>)}
              </div>
            </div>
          )}

          {liveStateError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {liveStateError}
            </div>
          )}

          {expressionActionMessage && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {expressionActionMessage}
            </div>
          )}

          {/* Sections */}
          {renderSchemaSections(editor.sections, { defaultOpenCount: 2, emptyState: "No parameters available for this node." })}

          {/* Validation indicator */}
          {validation && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium ${
              validation.valid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}>
              {validation.valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {validation.valid
                ? "Configuration valid"
                : `${validation.issues.length} issue${validation.issues.length === 1 ? "" : "s"} found`}
            </div>
          )}

          {/* Validation issues */}
          {validation && validation.issues.length > 0 && (
            <div className="space-y-2">
              {validation.issues.map((issue, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-2.5">
                  <div className={`text-[11px] font-medium ${issue.level === "error" ? "text-red-500" : "text-amber-500"}`}>
                    {issue.level === "error" ? "Error" : "Warning"}
                    {issue.field ? ` · ${prettyLabel(issue.field)}` : ""}
                  </div>
                  <div className="mt-0.5 text-[12px] leading-5 text-slate-700">{issue.message}</div>
                </div>
              ))}
            </div>
          )}

          {renderClusterAttachments()}

          {expressionValidations.length > 0 && (
            <Section
              title="Expression checks"
              icon={Sparkles}
              defaultOpen
              badge={expressionErrorCount > 0 ? expressionErrorCount : expressionWarningCount}
            >
              <div className="space-y-2">
                {expressionValidations.map((entry) => (
                  <div key={entry.field.key} className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12px] font-medium text-slate-700">{entry.field.label}</div>
                      <button
                        type="button"
                        onClick={() => setActiveExpressionFieldKey(entry.field.key)}
                        className="text-[11px] font-medium text-sky-600 transition-colors hover:text-sky-700"
                      >
                        Focus field
                      </button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {entry.issues.map((issue, index) => (
                        <div
                          key={`${entry.field.key}-${issue.token ?? index}`}
                          className={`rounded-lg px-3 py-2 text-[12px] leading-5 ${issue.severity === "error" ? "border border-red-100 bg-red-50 text-red-700" : "border border-amber-100 bg-amber-50 text-amber-700"}`}
                        >
                          {issue.message}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Sample output preview */}
          {preview && preview.sample_output && Object.keys(preview.sample_output).length > 0 && (
            <Section title="Sample output" icon={FileText} badge={preview.data_source === "pinned" ? "Pinned" : undefined}>
              <StudioDataViewer data={preview.sample_output} />
            </Section>
          )}

          {hasAnyDataReferences && (
            <Section title="Data references" icon={Database} defaultOpen>
              <div className="space-y-3">
                <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-[12px] leading-5 text-sky-800">
                  Focus a text field, then click or drag data from an upstream step to build expressions the same way you would in n8n.
                </div>
                <div className="text-[12px] text-slate-500">
                  {expressionTargetField
                    ? `Inserting into ${expressionTargetField.label}.`
                    : "Focus a text field to enable insertion."}
                </div>
                {expressionTargetField && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExpressionBuilderOpen(true)}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Sparkles size={12} /> Open full expression editor
                    </button>
                  </div>
                )}
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={mappingSearch}
                    onChange={(event) => setMappingSearch(event.target.value)}
                    placeholder="Search fields, steps, or expressions"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-50"
                  />
                </div>

                {expressionPreview && expressionTargetField && (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[12px] font-medium text-slate-700">Live preview</div>
                      <div className="text-[11px] text-slate-400">{expressionTargetField.label}</div>
                    </div>
                    {expressionPreview.unresolved.length > 0 && (
                      <div className="mt-2 text-[11px] text-amber-600">
                        Unresolved: {expressionPreview.unresolved.slice(0, 3).join(", ")}
                      </div>
                    )}
                    <div className="mt-3">
                      {expressionPreview.exactValue !== null && typeof expressionPreview.exactValue === "object" ? (
                        <StudioDataViewer data={expressionPreview.exactValue} className="bg-white" />
                      ) : (
                        <pre className="overflow-auto rounded-xl bg-slate-950 px-3 py-3 text-[11px] leading-5 text-slate-100">{expressionPreview.renderedText}</pre>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {groupedDataReferences.map(([stepName, references]) => (
                    <div key={stepName} className="rounded-xl border border-slate-100 bg-white px-3 py-3">
                      <div className="mb-2 text-[12px] font-medium text-slate-700">{stepName}</div>
                      <div className="flex flex-wrap gap-2">
                        {references.slice(0, 12).map((reference) => (
                          <button
                            key={`${reference.step_id}-${reference.path}`}
                            type="button"
                            draggable={Boolean(expressionTargetField)}
                            disabled={!expressionTargetField}
                            onClick={() => handleInsertExpression(reference.expression)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData("application/x-flowholt-expression", reference.expression);
                              event.dataTransfer.setData("text/plain", reference.expression);
                              event.dataTransfer.effectAllowed = "copy";
                            }}
                            className="inline-flex cursor-grab items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title={reference.expression}
                          >
                            <span className="font-medium">{reference.path.replace(`${stepName}.`, "")}</span>
                            {reference.is_root && (
                              <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                                Root
                              </span>
                            )}
                            {reference.preview && <span className="text-slate-400">{reference.preview}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {groupedDataReferences.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-[12px] text-slate-500">
                      No matching references for this search.
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Available bindings */}
          {editor.available_bindings.length > 0 && (
            <Section title="Connected resources" icon={Database}>
              <div className="space-y-2">
                {editor.available_bindings.map((b) => (
                  <div key={`${b.kind}-${b.name}`} className="rounded-xl border border-slate-100 bg-white px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-slate-800">{b.label}</div>
                        <div className="truncate text-[11px] text-slate-400">
                          {b.kind}{b.app ? ` · ${b.app}` : ""}{b.scope ? ` · ${b.scope}` : ""}
                        </div>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {b.fields.length} field{b.fields.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      );
    }

    /* Absolute fallback: generic key-value config */
    return (
      <div className="space-y-4">
        {nameBlock}
        {configEntries.filter(([k]) => !k.startsWith("_") && k !== "ui_position").map(([key, value]) => (
          <div key={key}>
            <FieldLabel label={prettyLabel(key)} />
            {typeof value === "boolean" ? (
              <FieldToggle checked={value} onChange={(v) => handleConfigChange(key, v)} label={prettyLabel(key)} />
            ) : (
              <FieldText value={value == null ? "" : String(value)} onChange={(v) => handleConfigChange(key, v)} />
            )}
          </div>
        ))}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     SETTINGS TAB — universal node settings
     ═══════════════════════════════════════════════════════════════════════════ */

  const renderSettingsTab = () => (
    <div className="space-y-5">
      {editorLoading || (!editor && !editorError) ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-[13px] text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Loading settings…
        </div>
      ) : editorError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {editorError}
        </div>
      ) : (
        renderSchemaSections(editor?.node_settings ?? [], {
          defaultOpenCount: Math.max(1, editor?.node_settings?.length ?? 1),
          emptyState: "No shared node settings are available for this node yet.",
        })
      )}

      {/* Connections */}
      <Section title="Connections" icon={GitBranch} defaultOpen>
        <div className="space-y-3">
          {draft.type === "condition" ? (
            <>
              <div className="space-y-1">
                <FieldLabel label="True branch" />
                <FieldSelect
                  value={connectionTargets.trueTarget}
                  onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, trueTarget: v })}
                  options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="No target"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel label="False branch" />
                <FieldSelect
                  value={connectionTargets.falseTarget}
                  onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, falseTarget: v })}
                  options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="No target"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <FieldLabel label="Next step" />
              <FieldSelect
                value={connectionTargets.defaultTarget}
                onChange={(v) => onConnectionsChange(draft.id, { ...connectionTargets, defaultTarget: v })}
                options={steps.filter((s) => s.id !== draft.id).map((s) => ({ value: s.id, label: s.name }))}
                placeholder="No target"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Actions */}
      <Section title="Actions" icon={Sliders}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onMove(draft.id, "up")}
            disabled={!canMoveUp || saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ArrowUp size={13} /> Move up
          </button>
          <button
            onClick={() => onMove(draft.id, "down")}
            disabled={!canMoveDown || saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ArrowDown size={13} /> Move down
          </button>
          <button
            onClick={() => onDuplicate(draft)}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <Copy size={13} /> Duplicate
          </button>
          <button
            onClick={() => onDelete(draft.id)}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-100 text-[13px] font-medium text-red-500 disabled:opacity-40 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </Section>

      {/* Workflow info */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3">
        <div className="text-[12px] text-slate-400">Workflow</div>
        <div className="mt-0.5 text-[13px] font-medium text-slate-800">{workflowName}</div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     TEST TAB — payload editor + run + results
     ═══════════════════════════════════════════════════════════════════════════ */

  const renderTestTab = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
          <Play size={14} className="text-slate-500" />
          Test this step
        </div>
        <div className="mt-1 text-[12px] leading-5 text-slate-400">
          Provide sample input data to test in isolation.
        </div>
      </div>

      <div className="space-y-1">
        <FieldLabel label="Test payload (JSON)" />
        <FieldJson
          value={testPayload}
          onChange={setTestPayload}
          placeholder='{ "key": "value" }'
          rows={5}
        />
      </div>

      <div className="flex items-center gap-4 text-[12px] text-slate-500">
        <span>Type: <span className="font-medium text-slate-700">{meta.subtitle}</span></span>
        <span>Fields: <span className="font-medium text-slate-700">{configEntries.length}</span></span>
      </div>

      <Section
        title="Pinned data"
        icon={Pin}
        defaultOpen
        badge={hasPinnedData ? 1 : undefined}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-800">
            Pinned data is used for editor previews, test runs, and manual draft runs. Production executions still use live data.
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePinData}
              disabled={latestRuntimeData == null}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[12px] font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pin size={12} /> Pin latest {latestRuntimeSource ?? "data"}
            </button>
            <button
              type="button"
              onClick={handleSavePinnedData}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <CheckCircle2 size={12} /> Save pinned JSON
            </button>
            <button
              type="button"
              onClick={handleUnpinData}
              disabled={!hasPinnedData}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={12} /> Unpin
            </button>
          </div>

          {!hasPinnedData && latestRuntimeSource && latestRuntimeData != null && (
            <div className="text-[12px] text-slate-500">
              Latest runtime data is available from {latestRuntimeSource}. Pin it to reuse this output while editing.
            </div>
          )}

          <div className="space-y-1">
            <FieldLabel label="Pinned JSON" />
            <FieldJson
              value={pinnedEditorValue}
              onChange={(value) => {
                setPinnedEditorValue(value);
                setPinnedEditorError(null);
              }}
              placeholder='{ "items": [] }'
              rows={6}
            />
          </div>

          {pinnedEditorError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-600">
              {pinnedEditorError}
            </div>
          )}

          {hasPinnedData && pinnedData != null && <StudioDataViewer data={pinnedData} />}
        </div>
      </Section>

      {testError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-red-600">
            <AlertCircle size={14} /> Error
          </div>
          <div className="mt-1 text-[12px] leading-5 text-red-500">{testError}</div>
        </div>
      )}

      {testResult && (
        <div className={`rounded-xl border px-4 py-3 ${
          testResult.status === "success" ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-medium">
              {testResult.status === "success" ? (
                <><CheckCircle2 size={14} className="text-emerald-600" /> <span className="text-emerald-700">Success</span></>
              ) : (
                <><AlertCircle size={14} className="text-red-600" /> <span className="text-red-700">Failed</span></>
              )}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={11} /> {testResult.duration_ms}ms
            </span>
          </div>
          {testResult.pinned_data_used && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
              <Pin size={11} /> Pinned data used
            </div>
          )}
          {testResult.error && (
            <div className="mt-2 text-[12px] leading-5 text-red-500">{testResult.error}</div>
          )}
          {testResult.output && (
            <div className="mt-3 space-y-2">
              <div className="text-[11px] font-medium text-slate-500">Output</div>
              <StudioDataViewer data={testResult.output} className="bg-white/80" />
            </div>
          )}
        </div>
      )}

      <div className="pt-2">
        <div className="text-[12px] text-slate-500">Execution status</div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[13px] text-slate-700">
          {testRunning ? (
            <><Loader2 size={12} className="animate-spin text-amber-500" /> Running</>
          ) : testResult ? (
            <><Circle size={9} className={`fill-current ${testResult.status === "success" ? "text-emerald-400" : "text-red-400"}`} /> {testResult.status}</>
          ) : (
            <><Circle size={9} className="fill-emerald-400 text-emerald-400" /> Ready</>
          )}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════════ */

  return (
    <aside className="relative w-[380px] h-full shrink-0 border-l border-slate-200 bg-white overflow-hidden">
      {/* Credential create overlay */}
      {credOverlayOpen && (
        <CredentialCreateOverlay
          onCreated={handleCredentialCreated}
          onClose={() => setCredOverlayOpen(false)}
        />
      )}

      <ExpressionBuilderDialog
        open={expressionBuilderOpen}
        onOpenChange={setExpressionBuilderOpen}
        fieldLabel={expressionTargetField?.label ?? "this field"}
        initialValue={expressionTargetValue}
        references={editor?.data_references ?? []}
        onApply={handleApplyExpressionBuilder}
      />

      <div className="flex h-full flex-col">
        {/* ── Header ── */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}>
                <Icon size={18} className={meta.iconClass} />
              </div>
              <div className="min-w-0">
                {nameEditing ? (
                  <input
                    ref={nameInputRef}
                    autoFocus
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    onBlur={() => setNameEditing(false)}
                    onKeyDown={(e) => { if (e.key === "Enter") setNameEditing(false); }}
                    className="text-[14px] font-semibold text-slate-900 bg-transparent border-b border-blue-400 outline-none w-full pb-0.5"
                  />
                ) : (
                  <button
                    onClick={() => setNameEditing(true)}
                    className="text-[14px] font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left truncate block max-w-[220px]"
                    title="Click to rename"
                  >
                    {draft.name}
                  </button>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] text-slate-400">{meta.subtitle}</span>
                  {hasPinnedData && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                  {validation && (
                    <span className={`inline-flex items-center gap-1 text-[11px] ${validation.valid ? "text-emerald-500" : "text-amber-500"}`}>
                      {validation.valid
                        ? <CheckCircle2 size={11} />
                        : <><AlertCircle size={11} /> {validationCount}</>
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex rounded-xl bg-slate-100/70 p-1">
            {(["parameters", "settings", "test"] as TabId[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 h-8 rounded-lg text-[13px] font-medium transition-all ${
                  tab === item
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === "parameters" && renderParametersTab()}
          {tab === "settings" && renderSettingsTab()}
          {tab === "test" && renderTestTab()}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-100 bg-white px-5 py-3.5">
          <div className="flex gap-2">
            {tab === "test" ? (
              <button
                onClick={handleTestRun}
                disabled={testRunning}
                className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 text-[13px] font-semibold text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
              >
                {testRunning ? (
                  <><Loader2 size={14} className="animate-spin" /> Running…</>
                ) : (
                  <><Play size={14} /> Run test</>
                )}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-[13px] font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 size={14} /> Save changes</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NodeConfigPanel;
