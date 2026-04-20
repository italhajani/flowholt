import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Copy, Info } from "lucide-react";
import { useDomainConfig, useUpdateDomainConfig } from "@/hooks/useApi";

export function DomainsSettings() {
  const { data: domainData } = useDomainConfig();
  const updateMut = useUpdateDomainConfig();
  const [baseUrl, setBaseUrl] = useState("https://hooks.flowholt.com");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    webhookSig: true,
    publicWebhooks: true,
    publicChat: false,
  });
  const [queueAlert, setQueueAlert] = useState(1000);
  const [expireAfter, setExpireAfter] = useState(5);

  useEffect(() => {
    if (domainData) {
      setBaseUrl(domainData.baseUrl);
      setToggles({
        webhookSig: domainData.webhookSignature,
        publicWebhooks: domainData.publicWebhooks,
        publicChat: domainData.publicChat,
      });
      setQueueAlert(domainData.queueAlertThreshold);
      setExpireAfter(domainData.expireAfterDays);
    }
  }, [domainData]);

  const toggle = (key: string) => setToggles((v) => ({ ...v, [key]: !v[key] }));

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Domains</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Custom domain configuration for webhooks and public pages.</p>

      <div className="mt-6 space-y-6">
        {/* Section 1: Custom Domain */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Custom Domain</p>
          <div className="space-y-5 max-w-md">
            <Field label="Public base URL" hint="Used for webhook URLs and public forms">
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-zinc-200 bg-zinc-50 px-3.5 py-3">
            <Info size={14} className="text-zinc-400 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-zinc-500">All webhook URLs will use this domain. Make sure DNS is configured.</p>
          </div>
        </div>

        {/* Section 2: Webhook Security */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Webhook Security</p>
          <div className="space-y-5 max-w-md">
            <ToggleRow label="Require webhook signature" checked={toggles.webhookSig} onChange={() => toggle("webhookSig")} />

            <Field label="Signing secret" hint="HMAC-SHA256 · Header: X-FlowHolt-Signature">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[12px] font-mono text-zinc-600 bg-zinc-50 px-3 py-2 rounded-md border border-zinc-100">
                  fh_whsec_****…7f2a
                </code>
                <button className="text-zinc-400 hover:text-zinc-600 transition-colors" title="Copy">
                  <Copy size={13} />
                </button>
              </div>
            </Field>

            <div>
              <Button variant="secondary" size="sm">Rotate Secret</Button>
            </div>
          </div>
        </div>

        {/* Section 3: Rate & Queue Limits */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Rate & Queue Limits</p>
          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-800">Global rate limit</p>
                <p className="text-[12px] text-zinc-400">Plan-based, read only</p>
              </div>
              <span className="text-[13px] text-zinc-600">300 requests / 10 seconds</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-800">Max queue size</p>
                <p className="text-[12px] text-zinc-400">Plan-based, read only</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-zinc-600">10,000</span>
                <Badge variant="default">Pro plan</Badge>
              </div>
            </div>
            <Field label="Queue backlog alert at">
              <Input type="number" value={queueAlert} onChange={(e) => setQueueAlert(Number(e.target.value))} className="w-24" />
            </Field>
          </div>
        </div>

        {/* Section 4: Webhook Policies */}
        <div className="rounded-lg border border-zinc-100 bg-white p-5 shadow-xs">
          <p className="text-[13px] font-semibold text-zinc-800 mb-4">Webhook Policies</p>
          <div className="space-y-5 max-w-md">
            <Field label="Expire after inactivity" hint="days (webhook deactivated after this)">
              <Input type="number" value={expireAfter} onChange={(e) => setExpireAfter(Number(e.target.value))} className="w-24" />
            </Field>
            <ToggleRow label="Allow public webhooks" checked={toggles.publicWebhooks} onChange={() => toggle("publicWebhooks")} />
            <ToggleRow label="Allow public chat triggers" checked={toggles.publicChat} onChange={() => toggle("publicChat")} />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium text-zinc-800">{label}</p>
        {hint && <p className="text-[12px] text-zinc-400">{hint}</p>}
      </div>
      <button
        onClick={onChange}
        className={cn(
          "relative w-9 h-5 rounded-full transition-colors duration-200",
          checked ? "bg-zinc-800" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
