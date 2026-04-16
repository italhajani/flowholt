import React, { useState, useCallback } from "react";
import { X, KeyRound, Loader2, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface CredentialCreateOverlayProps {
  onCreated: (credential: { id: string; name: string; provider?: string }) => void;
  onClose: () => void;
}

const CREDENTIAL_TYPES = [
  { value: "api_key", label: "API key" },
  { value: "oauth2", label: "OAuth 2.0" },
  { value: "token", label: "Bearer token" },
  { value: "basic", label: "Basic auth" },
  { value: "database", label: "Database" },
  { value: "custom", label: "Custom" },
];

const APPS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
  { value: "slack", label: "Slack" },
  { value: "github", label: "GitHub" },
  { value: "stripe", label: "Stripe" },
  { value: "twilio", label: "Twilio" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "custom", label: "Other" },
];

const CredentialCreateOverlay: React.FC<CredentialCreateOverlayProps> = ({
  onCreated,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [credentialType, setCredentialType] = useState("api_key");
  const [app, setApp] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await api.createVaultAsset({
        kind: "credential",
        name: name.trim(),
        credential_type: credentialType,
        app: app || null,
        scope: "workspace",
        status: "active",
        secret: secretKey ? { api_key: secretKey } : {},
      });
      const created = result as { id?: string };
      setSuccess(true);
      setTimeout(() => {
        onCreated({
          id: String(created.id ?? name.trim()),
          name: name.trim(),
          provider: app || undefined,
        });
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create credential",
      );
    } finally {
      setSaving(false);
    }
  }, [name, credentialType, app, secretKey, onCreated]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <KeyRound size={15} className="text-blue-600" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              Create credential
            </div>
            <div className="text-[11px] text-slate-400">
              Add a new credential to your vault
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <Check size={20} className="text-emerald-600" />
            </div>
            <div className="text-[13px] font-medium text-emerald-700">
              Credential created
            </div>
          </div>
        ) : (
          <>
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My OpenAI key"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                Credential type
              </label>
              <div className="relative">
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-[13px] text-slate-800 outline-none cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                >
                  {CREDENTIAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* App */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                App / service
              </label>
              <div className="relative">
                <select
                  value={app}
                  onChange={(e) => setApp(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-[13px] text-slate-800 outline-none cursor-pointer focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                >
                  <option value="">Select an app</option>
                  {APPS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secret */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-slate-700">
                {credentialType === "api_key"
                  ? "API key"
                  : credentialType === "token"
                    ? "Token"
                    : "Secret value"}
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret value"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
              <div className="mt-1.5 text-[11px] text-slate-400">
                Stored securely in your vault. Never exposed in logs.
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-[12px] text-red-600">{error}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!success && (
        <div className="border-t border-slate-100 px-4 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="flex-1 h-10 rounded-xl bg-blue-600 text-[13px] font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <KeyRound size={14} /> Create
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CredentialCreateOverlay;
