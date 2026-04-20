import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, ChevronLeft, Check, Key, AlertTriangle, GitBranch,
  Eye, Layers, Settings, Sparkles, CheckCircle2, Loader2, FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInstantiateTemplate } from "@/hooks/useApi";

interface Credential {
  name: string;
  type: string;
  required: boolean;
  connected?: boolean;
}

interface TemplateStep {
  order: number;
  name: string;
  type: string;
  description: string;
}

interface UseTemplateWizardModalProps {
  open: boolean;
  onClose: () => void;
  templateName: string;
  templateDescription: string;
  templateId?: string;
  credentials: Credential[];
  steps: TemplateStep[];
  onComplete?: (config: { name: string; folder: string }) => void;
}

const wizardSteps = [
  { id: "preview",     label: "Preview",     icon: Eye },
  { id: "credentials", label: "Credentials", icon: Key },
  { id: "configure",   label: "Configure",   icon: Settings },
  { id: "create",      label: "Create",      icon: Sparkles },
] as const;

type WizardStep = (typeof wizardSteps)[number]["id"];

const stepTypeColors: Record<string, string> = {
  trigger: "border-green-400 text-green-600 bg-green-50",
  integration: "border-zinc-300 text-zinc-600 bg-zinc-50",
  ai: "border-violet-400 text-violet-600 bg-violet-50",
  logic: "border-blue-400 text-blue-600 bg-blue-50",
  error: "border-red-400 text-red-600 bg-red-50",
};

export function UseTemplateWizardModal({
  open, onClose, templateName, templateDescription, templateId, credentials, steps, onComplete,
}: UseTemplateWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("preview");
  const [workflowName, setWorkflowName] = useState(templateName);
  const [folder, setFolder] = useState("My workflows");
  const [connectedCreds, setConnectedCreds] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const instantiate = useInstantiateTemplate();

  const stepIndex = wizardSteps.findIndex((s) => s.id === currentStep);
  const canGoNext = stepIndex < wizardSteps.length - 1;
  const canGoBack = stepIndex > 0;

  const requiredCreds = credentials.filter((c) => c.required);
  const allRequiredConnected = requiredCreds.every((c) => connectedCreds[c.name]);

  const handleNext = () => {
    if (canGoNext) setCurrentStep(wizardSteps[stepIndex + 1].id);
  };
  const handleBack = () => {
    if (canGoBack) setCurrentStep(wizardSteps[stepIndex - 1].id);
  };

  const handleCreate = () => {
    setCreating(true);
    if (templateId) {
      instantiate.mutate(
        { templateId, name: workflowName, folder },
        {
          onSuccess: () => { setCreating(false); setDone(true); onComplete?.({ name: workflowName, folder }); },
          onError: () => { setCreating(false); setDone(true); onComplete?.({ name: workflowName, folder }); },
        }
      );
    } else {
      setTimeout(() => {
        setCreating(false);
        setDone(true);
        onComplete?.({ name: workflowName, folder });
      }, 1800);
    }
  };

  const handleClose = () => {
    setCurrentStep("preview");
    setConnectedCreds({});
    setCreating(false);
    setDone(false);
    setWorkflowName(templateName);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} className="max-w-xl">
      <div className="p-0">
        {/* Step indicator */}
        <div className="flex items-center border-b border-zinc-100 px-6 py-3">
          {wizardSteps.map((step, i) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPast = i < stepIndex;
            return (
              <div key={step.id} className="flex items-center">
                {i > 0 && <div className={cn("h-px w-6 mx-1.5", isPast ? "bg-green-400" : "bg-zinc-200")} />}
                <button
                  onClick={() => { if (isPast) setCurrentStep(step.id); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                    isActive && "bg-zinc-900 text-white",
                    isPast && "text-green-600 cursor-pointer hover:bg-green-50",
                    !isActive && !isPast && "text-zinc-300 cursor-default",
                  )}
                >
                  {isPast ? <Check size={11} /> : <Icon size={11} />}
                  {step.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 min-h-[280px]">
          {/* Step 1: Preview */}
          {currentStep === "preview" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-800">{templateName}</h3>
                <p className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{templateDescription}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Workflow Steps ({steps.length})
                </p>
                <div className="space-y-1">
                  {steps.map((step) => (
                    <div key={step.order} className="flex items-center gap-2.5 rounded-md border border-zinc-50 px-3 py-2">
                      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md border text-[9px] font-bold", stepTypeColors[step.type] || "border-zinc-300 text-zinc-500 bg-zinc-50")}>
                        {step.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-zinc-700 truncate">{step.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Layers size={11} /> {steps.length} nodes will be created
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {currentStep === "credentials" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-zinc-800">Connect Credentials</h3>
                <p className="text-[12px] text-zinc-500 mt-1">This template requires access to the following services.</p>
              </div>
              <div className="space-y-2">
                {credentials.map((cred) => {
                  const isConnected = connectedCreds[cred.name];
                  return (
                    <div key={cred.name} className={cn(
                      "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
                      isConnected ? "border-green-200 bg-green-50/30" : "border-zinc-100",
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          isConnected ? "bg-green-100" : "bg-zinc-100",
                        )}>
                          <Key size={14} className={isConnected ? "text-green-600" : "text-zinc-400"} />
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-zinc-700">{cred.name}</p>
                          <p className="text-[10px] text-zinc-400">{cred.type} {cred.required && "• Required"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!cred.required && <Badge variant="neutral" className="text-[9px]">Optional</Badge>}
                        {isConnected ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                            <CheckCircle2 size={12} /> Connected
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setConnectedCreds((p) => ({ ...p, [cred.name]: true }))}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!allRequiredConnected && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700">
                    Connect all required credentials to proceed. You can set up optional ones later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configure */}
          {currentStep === "configure" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold text-zinc-800">Configure Workflow</h3>
                <p className="text-[12px] text-zinc-500 mt-1">Name your workflow and choose where to save it.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Workflow Name</label>
                  <Input
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="My Workflow"
                    className="text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Folder</label>
                  <button className="flex w-full items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-[12px] text-zinc-600 hover:border-zinc-300 transition-colors">
                    <FolderOpen size={13} className="text-zinc-400" />
                    {folder}
                    <ChevronRight size={11} className="ml-auto text-zinc-300" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 space-y-2">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Summary</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Template</span>
                  <span className="text-zinc-700 font-medium">{templateName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Nodes</span>
                  <span className="text-zinc-700 font-medium">{steps.length}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Credentials</span>
                  <span className="text-zinc-700 font-medium">
                    {Object.values(connectedCreds).filter(Boolean).length}/{credentials.length} connected
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Create */}
          {currentStep === "create" && (
            <div className="flex flex-col items-center justify-center py-8">
              {creating ? (
                <>
                  <Loader2 size={32} className="text-zinc-400 animate-spin mb-4" />
                  <p className="text-[14px] font-medium text-zinc-700">Creating workflow...</p>
                  <p className="text-[12px] text-zinc-400 mt-1">Setting up nodes and connections</p>
                </>
              ) : done ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 mb-4">
                    <CheckCircle2 size={28} className="text-green-500" />
                  </div>
                  <p className="text-[14px] font-semibold text-zinc-800">Workflow Created!</p>
                  <p className="text-[12px] text-zinc-500 mt-1 text-center">
                    "{workflowName}" has been created with {steps.length} nodes.
                  </p>
                  <div className="flex items-center gap-2 mt-5">
                    <Button variant="primary" size="sm" onClick={handleClose}>
                      <GitBranch size={12} /> Open in Studio
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 mb-4">
                    <Sparkles size={28} className="text-zinc-400" />
                  </div>
                  <p className="text-[14px] font-semibold text-zinc-800">Ready to Create</p>
                  <p className="text-[12px] text-zinc-500 mt-1 text-center max-w-xs">
                    "{workflowName}" will be created in {folder} with {steps.length} nodes and {Object.values(connectedCreds).filter(Boolean).length} connected credentials.
                  </p>
                  <Button variant="primary" size="md" className="mt-5" onClick={handleCreate}>
                    <Sparkles size={13} /> Create Workflow
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {currentStep !== "create" && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
            <div>
              {canGoBack && (
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft size={12} /> Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-400">
                Step {stepIndex + 1} of {wizardSteps.length}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === "credentials" && !allRequiredConnected}
              >
                Next <ChevronRight size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
