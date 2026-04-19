import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Search, CheckCircle2, Loader2, AlertCircle, Shield, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateCredentialModalProps {
  open: boolean;
  onClose: () => void;
}

const providers = [
  { id: "openai",     name: "OpenAI",       category: "AI",          fields: ["API Key"],                         authType: "api-key",   icon: "🤖", doc: "https://platform.openai.com/api-keys" },
  { id: "anthropic",  name: "Anthropic",     category: "AI",          fields: ["API Key"],                         authType: "api-key",   icon: "🧠", doc: "https://console.anthropic.com" },
  { id: "github",     name: "GitHub",        category: "Integration", fields: ["OAuth 2.0"],                       authType: "oauth",     icon: "🐙", doc: "https://github.com/settings/tokens" },
  { id: "slack",      name: "Slack",         category: "Integration", fields: ["Bot Token"],                       authType: "api-key",   icon: "💬", doc: "https://api.slack.com/apps" },
  { id: "aws",        name: "AWS",           category: "Cloud",       fields: ["Access Key", "Secret Key"],        authType: "api-key",   icon: "☁️", doc: "https://console.aws.amazon.com" },
  { id: "gcp",        name: "Google Cloud",  category: "Cloud",       fields: ["Service Account JSON"],            authType: "service-account", icon: "🌐", doc: "https://console.cloud.google.com" },
  { id: "salesforce", name: "Salesforce",    category: "CRM",         fields: ["OAuth 2.0"],                       authType: "oauth",     icon: "☁️", doc: "https://login.salesforce.com" },
  { id: "notion",     name: "Notion",        category: "Integration", fields: ["Internal Token"],                  authType: "api-key",   icon: "📝", doc: "https://developers.notion.com" },
  { id: "stripe",     name: "Stripe",        category: "Finance",     fields: ["API Key"],                         authType: "api-key",   icon: "💳", doc: "https://dashboard.stripe.com/apikeys" },
  { id: "postgres",   name: "PostgreSQL",    category: "Database",    fields: ["Host", "Port", "Username", "Password", "Database"], authType: "connection", icon: "🐘", doc: "" },
  { id: "mysql",      name: "MySQL",         category: "Database",    fields: ["Host", "Port", "Username", "Password", "Database"], authType: "connection", icon: "🐬", doc: "" },
  { id: "mongodb",    name: "MongoDB",       category: "Database",    fields: ["Connection String"],               authType: "connection", icon: "🍃", doc: "" },
  { id: "twilio",     name: "Twilio",        category: "Communication", fields: ["Account SID", "Auth Token"],    authType: "api-key",   icon: "📱", doc: "https://console.twilio.com" },
  { id: "sendgrid",   name: "SendGrid",      category: "Communication", fields: ["API Key"],                      authType: "api-key",   icon: "✉️", doc: "https://app.sendgrid.com" },
];

const categories = ["All", "AI", "Integration", "Cloud", "CRM", "Database", "Finance", "Communication"];
const scopes = ["Workspace", "Team", "User"] as const;

type TestStatus = "idle" | "testing" | "success" | "error";

export function CreateCredentialModal({ open, onClose }: CreateCredentialModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("Workspace");
  const [credName, setCredName] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");

  const reset = () => { setStep(1); setSearch(""); setCategory("All"); setSelectedProvider(null); setScope("Workspace"); setCredName(""); setTestStatus("idle"); };
  const handleClose = () => { reset(); onClose(); };

  const provider = providers.find((p) => p.id === selectedProvider);
  const filteredProviders = providers.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => setTestStatus(Math.random() > 0.3 ? "success" : "error"), 1500);
  };

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
      width="w-[520px]"
      footer={
        <div className="flex items-center gap-2 w-full">
          {/* Step dots */}
          <div className="flex items-center gap-1 mr-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 rounded-full transition-all", s === step ? "w-6 bg-zinc-800" : s < step ? "w-3 bg-zinc-400" : "w-3 bg-zinc-200")} />
            ))}
          </div>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => { setStep((s) => (s - 1) as 1 | 2 | 3); setTestStatus("idle"); }} className="mr-auto">
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
          {/* Category pills */}
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all",
                  category === c ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                )}
              >{c}</button>
            ))}
          </div>
          <div className="space-y-1 max-h-[260px] overflow-y-auto">
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
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-[14px]">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-zinc-800">{p.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{p.authType === "oauth" ? "OAuth 2.0" : p.fields.join(", ")}</p>
                </div>
                <Badge variant="neutral">{p.category}</Badge>
              </button>
            ))}
            {filteredProviders.length === 0 && (
              <div className="text-center py-6 text-[12px] text-zinc-400">No providers found</div>
            )}
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

          {/* OAuth banner */}
          {provider.authType === "oauth" && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 flex items-start gap-2">
              <ExternalLink size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-medium text-blue-700">OAuth 2.0 Connection</p>
                <p className="text-[10px] text-blue-500 mt-0.5">Clicking "Connect" will open a browser window for authorization.</p>
                <button className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700 transition-colors">
                  <ExternalLink size={10} /> Connect to {provider.name}
                </button>
              </div>
            </div>
          )}

          {provider.authType !== "oauth" && provider.fields.map((field) => (
            <Field key={field} label={field}>
              <Input
                type={field.toLowerCase().includes("key") || field.toLowerCase().includes("secret") || field.toLowerCase().includes("password") || field.toLowerCase().includes("token") || field.toLowerCase().includes("string") ? "password" : "text"}
                placeholder={`Enter ${field.toLowerCase()}…`}
              />
            </Field>
          ))}

          {provider.doc && (
            <a href={provider.doc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors">
              <ExternalLink size={10} /> Where do I find my {provider.name} credentials?
            </a>
          )}

          {/* Test connection */}
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
            <button onClick={handleTest} disabled={testStatus === "testing"}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              {testStatus === "testing" ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Test Connection
            </button>
            {testStatus === "success" && (
              <span className="flex items-center gap-1 text-[11px] text-green-600"><CheckCircle2 size={11} /> Connection successful</span>
            )}
            {testStatus === "error" && (
              <span className="flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} /> Connection failed — check credentials</span>
            )}
          </div>
        </div>
      )}

      {step === 3 && provider && (
        <div className="space-y-3">
          <ReviewRow label="Provider" value={`${provider.icon} ${provider.name}`} />
          <ReviewRow label="Name" value={credName} />
          <ReviewRow label="Auth type" value={provider.authType === "oauth" ? "OAuth 2.0" : provider.fields.join(", ")} />
          <ReviewRow label="Scope" value={scope} />
          <ReviewRow label="Test status" value={testStatus === "success" ? "✓ Passed" : testStatus === "error" ? "✗ Failed" : "Not tested"} />
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 flex items-start gap-2">
            <Shield size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-amber-700">Encryption Notice</p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Credentials are encrypted at rest using AES-256-GCM and only accessible to authorized workspace members.
              </p>
            </div>
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
