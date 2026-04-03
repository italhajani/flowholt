import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Copy, Play } from "lucide-react";

type ApiTab = "request" | "response" | "auth" | "endpoints";

const tabs: { id: ApiTab; label: string }[] = [
  { id: "request", label: "Test request" },
  { id: "response", label: "Example response" },
  { id: "auth", label: "Auth headers" },
  { id: "endpoints", label: "Useful endpoints" },
];

const ApiPlaygroundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ApiTab>("request");

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">API Playground</h1>
          <p className="text-[14px] text-slate-500 mt-1">Test endpoints, inspect responses, and verify request headers.</p>
        </div>
        <button className="h-10 px-5 rounded-lg bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors">
          Generate token
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-center gap-1 border-b border-slate-200 px-1 pt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-[14px] transition-colors border-b-2 -mb-px rounded-t-lg",
                activeTab === tab.id ? "text-slate-900 border-slate-300 font-semibold bg-slate-100" : "text-slate-400 border-transparent hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-8">
          {activeTab === "request" && (
            <>
              <div className="flex items-end justify-between pb-5 border-b border-slate-200">
                <div>
                  <h2 className="text-[22px] font-bold text-slate-900">Test request</h2>
                  <p className="text-[14px] text-slate-500 mt-1">Send a sample event into a trigger endpoint.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors">
                  <Play size={13} /> Send test
                </button>
              </div>

              <div className="mt-6 max-w-[920px] divide-y divide-slate-200">
                <div className="grid grid-cols-[180px_1fr] gap-6 py-4">
                  <div className="text-[14px] font-medium text-slate-500">Endpoint</div>
                  <div className="text-[14px] font-medium text-slate-800">POST /v1/triggers/customer-ticket-created</div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-6 py-4">
                  <div className="text-[14px] font-medium text-slate-500">Environment</div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-[12px] font-medium text-white">Sandbox</span>
                    <span className="inline-flex h-8 items-center rounded-lg bg-slate-100 px-3 text-[12px] font-medium text-slate-700">Production</span>
                  </div>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-6 py-4">
                  <div className="text-[14px] font-medium text-slate-500">Payload</div>
                  <div className="rounded-2xl bg-slate-950 p-5 text-[12px] leading-6 text-slate-200 font-mono overflow-x-auto">
                    {`{\n  "ticket_id": "cs_20491",\n  "priority": "high",\n  "customer": {\n    "email": "ops@northstar.io",\n    "plan": "enterprise"\n  },\n  "message": "Need immediate refund review."\n}`}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "response" && (
            <>
              <div className="flex items-end justify-between pb-5 border-b border-slate-200">
                <div>
                  <h2 className="text-[22px] font-bold text-slate-900">Example response</h2>
                  <p className="text-[14px] text-slate-500 mt-1">Preview the payload builders get back.</p>
                </div>
                <button className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#103b71] hover:text-[#0c2a52]">
                  <Copy size={13} /> Copy JSON
                </button>
              </div>

              <div className="mt-6 max-w-[920px] rounded-2xl bg-slate-100 p-5 text-[12px] leading-6 text-slate-700 font-mono overflow-x-auto">
                {`{\n  "accepted": true,\n  "execution_id": "run_9dc4q2",\n  "workflow": "support-ticket-classifier",\n  "queued_at": "2026-04-01T11:22:14Z"\n}`}
              </div>
            </>
          )}

          {activeTab === "auth" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Auth headers</h2>
                <p className="text-[14px] text-slate-500 mt-1">Check the required request headers.</p>
              </div>

              <div className="mt-6 max-w-[920px] divide-y divide-slate-200">
                {[
                  ["Authorization", "Bearer fh_live_sk_7f2..."],
                  ["Content-Type", "application/json"],
                  ["X-FlowHolt-Signature", "Optional for signed webhooks"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="grid grid-cols-[180px_1fr] gap-6 py-4">
                    <div className="text-[14px] font-medium text-slate-500">{label}</div>
                    <div className="text-[13px] font-mono text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "endpoints" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Useful endpoints</h2>
                <p className="text-[14px] text-slate-500 mt-1">Common routes builders usually need first.</p>
              </div>

              <div className="mt-6 max-w-[920px] divide-y divide-slate-200">
                {[
                  "POST /v1/triggers/:slug",
                  "GET /v1/executions/:id",
                  "POST /v1/webhooks/test",
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between py-4">
                    <span className="text-[14px] font-mono text-slate-800">{item}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiPlaygroundPage;
