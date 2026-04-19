import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Upload, Globe, Lock, AlertTriangle, CreditCard, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkspaceGeneralSettings() {
  const [name, setName] = useState("FlowHolt Workspace");
  const [slug, setSlug] = useState("flowholt");
  const [description, setDescription] = useState("");
  const [timezone, setTimezone] = useState("UTC (GMT+0)");
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ssoProvider, setSsoProvider] = useState("none");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-zinc-900">General</h2>
        <p className="text-[13px] text-zinc-500 mt-1">Workspace identity and configuration.</p>
      </div>

      {/* Workspace identity */}
      <div className="max-w-lg space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white text-[16px] font-bold shadow-sm">
              FH
            </div>
            <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Upload size={14} className="text-white" />
            </div>
          </div>
          <div>
            <Button variant="secondary" size="sm">Upload avatar</Button>
            <p className="text-[11px] text-zinc-400 mt-1">Square image, 256×256px min. PNG, JPG, or SVG.</p>
          </div>
        </div>

        <Field label="Workspace name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Slug">
          <div className="flex items-center gap-0 rounded-md border border-zinc-200 bg-white overflow-hidden focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400/30 transition-all">
            <span className="pl-3 text-[13px] text-zinc-400">flowholt.com/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 py-2 pr-3 text-[13px] text-zinc-800 bg-transparent outline-none" />
          </div>
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all resize-none" rows={2} placeholder="What is this workspace used for?" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Default timezone">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
              <option>UTC (GMT+0)</option>
              <option>Asia/Karachi (GMT+5)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/London (GMT+0)</option>
              <option>Asia/Tokyo (GMT+9)</option>
            </select>
          </Field>
          <Field label="Date format">
            <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
              <option>YYYY-MM-DD</option>
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>DD.MM.YYYY</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Plan & usage overview */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-zinc-400" />
            <span className="text-[13px] font-semibold text-zinc-700">Plan & Usage</span>
          </div>
          <Badge variant="default">Pro</Badge>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Members", value: "8 / 25", pct: 32 },
            { label: "Workflows", value: "47 / 100", pct: 47 },
            { label: "Executions", value: "12.4k / 50k", pct: 25 },
            { label: "Storage", value: "2.1 GB / 10 GB", pct: 21 },
          ].map((u) => (
            <div key={u.label}>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">{u.label}</p>
              <p className="text-[13px] font-medium text-zinc-800">{u.value}</p>
              <div className="h-1 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-zinc-700 rounded-full transition-all" style={{ width: `${u.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button variant="secondary" size="sm">Upgrade Plan</Button>
          <Button variant="ghost" size="sm">View billing →</Button>
        </div>
      </div>

      {/* SSO / Auth */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-zinc-400" />
            <span className="text-[13px] font-semibold text-zinc-700">Authentication</span>
          </div>
          <button
            onClick={() => setSsoEnabled(!ssoEnabled)}
            className={cn("relative w-8 h-4 rounded-full transition-colors", ssoEnabled ? "bg-zinc-800" : "bg-zinc-200")}
          >
            <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all", ssoEnabled ? "left-[16px]" : "left-0.5")} />
          </button>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">Enforce SSO for all workspace members.</p>
        {ssoEnabled && (
          <div className="space-y-3">
            <Field label="SSO Provider">
              <select value={ssoProvider} onChange={(e) => setSsoProvider(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400/30">
                <option value="none">Select provider…</option>
                <option value="google">Google Workspace</option>
                <option value="okta">Okta</option>
                <option value="azure">Azure AD / Entra</option>
                <option value="saml">Custom SAML 2.0</option>
                <option value="oidc">Custom OIDC</option>
              </select>
            </Field>
            {(ssoProvider === "saml" || ssoProvider === "oidc") && (
              <div className="space-y-2">
                <Field label="Issuer URL">
                  <input placeholder="https://idp.example.com/.well-known/openid-configuration" className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400/30" />
                </Field>
                <Field label="Client ID">
                  <input placeholder="client_abc123" className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[12px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400/30" />
                </Field>
              </div>
            )}
          </div>
        )}
      </div>

      {/* API access */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">API Access</span>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">Manage workspace-level API keys for programmatic access.</p>
        <div className="rounded-md border border-zinc-100 bg-zinc-50 p-3 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-zinc-700">Production API Key</p>
            <p className="text-[11px] text-zinc-400 font-mono">fh_prod_••••••••xxq7</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">Reveal</Button>
            <Button variant="ghost" size="sm">Regenerate</Button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-red-200 bg-red-50/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-[13px] font-semibold text-red-600">Danger Zone</span>
        </div>
        <p className="text-[12px] text-zinc-500 mb-4">Destructive actions that cannot be undone.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md border border-red-100 bg-white">
            <div>
              <p className="text-[12px] font-medium text-zinc-700">Transfer ownership</p>
              <p className="text-[11px] text-zinc-400">Transfer this workspace to another member.</p>
            </div>
            <Button variant="ghost" size="sm">Transfer</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border border-red-100 bg-white">
            <div>
              <p className="text-[12px] font-medium text-zinc-700">Delete workspace</p>
              <p className="text-[11px] text-zinc-400">Permanently remove all workflows, credentials, and data.</p>
            </div>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
          <div className="pt-2">
            <p className="text-[11px] text-zinc-400 mb-1.5">Type <strong className="text-red-500">delete my workspace</strong> to confirm:</p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="delete my workspace"
              className="w-full max-w-xs rounded-md border border-red-200 bg-white px-3 py-1.5 text-[12px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-300/30"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
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
