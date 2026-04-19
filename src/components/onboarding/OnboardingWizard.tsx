import { useState } from "react";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2, GitBranch, Plug, Users,
  Zap, Bot, MessageSquare, LayoutTemplate, Play, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface UseCase {
  id: string;
  label: string;
  icon: typeof Zap;
  description: string;
}

interface Integration {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
}

/* ── Data ── */
const useCases: UseCase[] = [
  { id: "sales", label: "Sales & CRM", icon: Zap, description: "Lead scoring, enrichment, CRM sync" },
  { id: "support", label: "Customer Support", icon: MessageSquare, description: "Ticket routing, auto-replies, escalation" },
  { id: "marketing", label: "Marketing", icon: Sparkles, description: "Email campaigns, social posting, analytics" },
  { id: "devops", label: "DevOps & IT", icon: GitBranch, description: "CI/CD triggers, monitoring, alerts" },
  { id: "ai", label: "AI & Automation", icon: Bot, description: "AI agents, document processing, RAG" },
  { id: "data", label: "Data & ETL", icon: LayoutTemplate, description: "Data pipelines, sync, transformations" },
];

const integrations: Integration[] = [
  { id: "slack", name: "Slack", logo: "🔵", connected: false },
  { id: "google", name: "Google Workspace", logo: "🔴", connected: false },
  { id: "github", name: "GitHub", logo: "⚫", connected: false },
  { id: "salesforce", name: "Salesforce", logo: "🔷", connected: false },
  { id: "openai", name: "OpenAI", logo: "🟢", connected: false },
  { id: "stripe", name: "Stripe", logo: "🟣", connected: false },
  { id: "notion", name: "Notion", logo: "⬛", connected: false },
  { id: "hubspot", name: "HubSpot", logo: "🟠", connected: false },
];

const templateSuggestions = [
  { id: "t1", name: "Lead Scoring Pipeline", description: "Score inbound leads with AI", nodes: 5 },
  { id: "t2", name: "Slack Alert Bot", description: "Get alerts in Slack on workflow failures", nodes: 3 },
  { id: "t3", name: "Invoice Processor", description: "Extract data from invoices with AI", nodes: 6 },
];

const steps = ["Welcome", "Use Case", "Integrations", "First Workflow", "Ready!"] as const;

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  const canNext = (): boolean => {
    if (step === 0) return userName.length > 0;
    if (step === 1) return selectedUseCase !== null;
    return true;
  };

  const toggleIntegration = (id: string) => {
    setConnectedIntegrations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-[640px] max-h-[85vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex items-center gap-1 px-6 pt-5 pb-0">
          {steps.map((_s, i) => (
            <div key={i} className="flex-1">
              <div className={cn("h-1 rounded-full transition-all duration-500", i <= step ? "bg-zinc-900" : "bg-zinc-200")} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-6 mt-1 mb-4">
          <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">Step {step + 1} of {steps.length}</span>
          <span className="text-[9px] text-zinc-300">{steps[step]}</span>
        </div>

        <div className="px-6 pb-6 min-h-[380px]">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 py-4">
              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-lg">
                  <Zap size={28} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-zinc-900">Welcome to FlowHolt</h1>
                <p className="text-[14px] text-zinc-400 mt-2">Let's get you set up in under 2 minutes.</p>
              </div>
              <div className="max-w-sm mx-auto">
                <label className="text-[11px] text-zinc-400 font-medium block text-left mb-1.5">What should we call you?</label>
                <input
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 1: Use Case */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-[18px] font-semibold text-zinc-900">What will you build, {userName}?</h2>
                <p className="text-[12px] text-zinc-400 mt-1">Pick your primary use case. You can always explore others later.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {useCases.map(uc => (
                  <button
                    key={uc.id}
                    onClick={() => setSelectedUseCase(uc.id)}
                    className={cn(
                      "rounded-xl border-2 p-3.5 text-left transition-all",
                      selectedUseCase === uc.id
                        ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                    )}
                  >
                    <uc.icon size={18} className={selectedUseCase === uc.id ? "text-zinc-900" : "text-zinc-400"} />
                    <p className={cn("text-[13px] font-medium mt-2", selectedUseCase === uc.id ? "text-zinc-900" : "text-zinc-600")}>{uc.label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{uc.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Integrations */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-[18px] font-semibold text-zinc-900">Connect your tools</h2>
                <p className="text-[12px] text-zinc-400 mt-1">Select the services you use. You can add more anytime.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {integrations.map(int => {
                  const connected = connectedIntegrations.has(int.id);
                  return (
                    <button
                      key={int.id}
                      onClick={() => toggleIntegration(int.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all",
                        connected ? "border-green-300 bg-green-50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <span className="text-[20px]">{int.logo}</span>
                      <span className={cn("text-[12px] font-medium flex-1 text-left", connected ? "text-green-700" : "text-zinc-600")}>{int.name}</span>
                      {connected && <CheckCircle2 size={14} className="text-green-500" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-300 text-center">
                {connectedIntegrations.size > 0 ? `${connectedIntegrations.size} selected` : "Skip to continue without connecting"}
              </p>
            </div>
          )}

          {/* Step 3: First Workflow */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-[18px] font-semibold text-zinc-900">Start with a template</h2>
                <p className="text-[12px] text-zinc-400 mt-1">Based on your use case, we recommend these workflows.</p>
              </div>
              <div className="space-y-2">
                {templateSuggestions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                      selectedTemplate === t.id
                        ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
                      selectedTemplate === t.id ? "bg-zinc-900" : "bg-zinc-100"
                    )}>
                      <GitBranch size={16} className={selectedTemplate === t.id ? "text-white" : "text-zinc-400"} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-zinc-700">{t.name}</p>
                      <p className="text-[10px] text-zinc-400">{t.description} · {t.nodes} nodes</p>
                    </div>
                    {selectedTemplate === t.id && <CheckCircle2 size={16} className="text-zinc-900" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedTemplate("blank")}
                className={cn(
                  "w-full rounded-xl border-2 border-dashed px-4 py-3 text-[12px] text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-all",
                  selectedTemplate === "blank" && "border-zinc-900 text-zinc-700 bg-zinc-50"
                )}
              >
                Or start with a blank workflow
              </button>
            </div>
          )}

          {/* Step 4: Ready! */}
          {step === 4 && (
            <div className="text-center space-y-6 py-8">
              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <Rocket size={28} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-zinc-900">You're all set, {userName}! 🎉</h2>
                <p className="text-[14px] text-zinc-400 mt-2">Your workspace is ready. Let's build something amazing.</p>
              </div>
              <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 w-full">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-[11px] text-zinc-600">Use case: {useCases.find(u => u.id === selectedUseCase)?.label || "—"}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 w-full">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-[11px] text-zinc-600">{connectedIntegrations.size} integrations connected</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 w-full">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-[11px] text-zinc-600">Starter template ready</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
              <ArrowLeft size={12} /> Back
            </button>
          ) : (
            <button onClick={onComplete} className="text-[11px] text-zinc-300 hover:text-zinc-500 transition-colors">Skip setup</button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all",
                canNext() ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              )}
            >
              Continue <ArrowRight size={13} />
            </button>
          ) : (
            <button onClick={onComplete} className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-zinc-800 shadow-sm transition-all">
              <Play size={13} /> Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
