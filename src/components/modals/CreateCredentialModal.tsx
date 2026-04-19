import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateCredentialModalProps {
  open: boolean;
  onClose: () => void;
}

const providers = [
  { id: "openai",     name: "OpenAI",       category: "AI",          fields: ["API Key"] },
  { id: "anthropic",  name: "Anthropic",     category: "AI",          fields: ["API Key"] },
  { id: "github",     name: "GitHub",        category: "Integration", fields: ["OAuth 2.0"] },
  { id: "slack",      name: "Slack",         category: "Integration", fields: ["Bot Token"] },
  { id: "aws",        name: "AWS",           category: "Cloud",       fields: ["Access Key", "Secret Key"] },
  { id: "gcp",        name: "Google Cloud",  category: "Cloud",       fields: ["Service Account JSON"] },
  { id: "salesforce", name: "Salesforce",    category: "CRM",         fields: ["OAuth 2.0"] },
  { id: "notion",     name: "Notion",        category: "Integration", fields: ["Internal Token"] },
  { id: "stripe",     name: "Stripe",        category: "Finance",     fields: ["API Key"] },
  { id: "postgres",   name: "PostgreSQL",    category: "Database",    fields: ["Host", "Port", "Username", "Password"] },
];

const scopes = ["Workspace", "Team", "User"] as const;

export function CreateCredentialModal({ open, onClose }: CreateCredentialModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("Workspace");
  const [credName, setCredName] = useState("");

  const reset = () => { setStep(1); setSearch(""); setSelectedProvider(null); setScope("Workspace"); setCredName(""); };
  const handleClose = () => { reset(); onClose(); };

  const provider = providers.find((p) => p.id === selectedProvider);
  const filteredProviders = providers.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        step === 1 ? "New Credential" :
        step === 2 ? `${provider?.name} Credential` :
        "Review & Save"
      }
      description={
        step === 1 ? "Choose a provider to store credentials for." :
        step === 2 ? "Enter your credential details." :
        "Confirm and save your new credential."
      }
      footer={
        <div className="flex items-center gap-2 w-full">
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="mr-auto">
              Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          {step < 3 ? (
            <Button
              variant="primary"
              size="sm"
              disabled={step === 1 ? !selectedProvider : !credName.trim()}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleClose}>
              Save Credential
            </Button>
          )}
        </div>
      }
    >
      {step === 1 && (
        <div className="space-y-3">
          <Input
            prefix={<Search size={13} />}
            placeholder="Search providers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {filteredProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedProvider(p.id); setCredName(`${p.name} API Key`); }}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg border px-3 py-2.5 text-left transition-all",
                  selectedProvider === p.id
                    ? "border-zinc-800 bg-zinc-50"
                    : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
                  <KeyRound size={13} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-zinc-800">{p.name}</p>
                  <p className="text-[11px] text-zinc-400">{p.fields.join(", ")}</p>
                </div>
                <Badge variant="neutral">{p.category}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && provider && (
        <div className="space-y-4">
          <Field label="Credential name">
            <Input value={credName} onChange={(e) => setCredName(e.target.value)} autoFocus />
          </Field>

          <Field label="Scope">
            <div className="flex items-center gap-2">
              {scopes.map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12px] font-medium border transition-all",
                    scope === s
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {provider.fields.map((field) => (
            <Field key={field} label={field}>
              <Input
                type={field.toLowerCase().includes("key") || field.toLowerCase().includes("secret") || field.toLowerCase().includes("password") || field.toLowerCase().includes("token") ? "password" : "text"}
                placeholder={`Enter ${field.toLowerCase()}…`}
              />
            </Field>
          ))}
        </div>
      )}

      {step === 3 && provider && (
        <div className="space-y-3">
          <ReviewRow label="Provider" value={provider.name} />
          <ReviewRow label="Name" value={credName} />
          <ReviewRow label="Scope" value={scope} />
          <ReviewRow label="Auth type" value={provider.fields.join(", ")} />
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
            <p className="text-[11px] text-amber-700">
              Credentials are encrypted at rest and only accessible to authorized workspace members.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #fafafa" }}>
      <span className="text-[12px] text-zinc-400">{label}</span>
      <span className="text-[13px] font-medium text-zinc-800">{value}</span>
    </div>
  );
}
