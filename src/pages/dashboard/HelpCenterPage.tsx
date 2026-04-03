import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, BookOpen, LifeBuoy, MessageSquareText, Search, ShieldQuestion } from "lucide-react";

type HelpTab = "guides" | "troubleshooting" | "security" | "contact";

const tabs: { id: HelpTab; label: string }[] = [
  { id: "guides", label: "Guides" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "security", label: "Security" },
  { id: "contact", label: "Contact" },
];

const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HelpTab>("guides");

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in pb-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">Help Center</h1>
          <p className="text-[14px] text-slate-500 mt-1">Find setup guides, fixes, and support paths for the FlowHolt workspace.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 h-10 min-w-[250px]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search help..."
            className="flex-1 bg-transparent outline-none text-[13px] text-slate-900 placeholder:text-slate-400"
          />
        </div>
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
          {activeTab === "guides" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Guides</h2>
                <p className="text-[14px] text-slate-500 mt-1">Start with the setup steps most teams need first.</p>
              </div>
              <div className="mt-3 max-w-[980px] divide-y divide-slate-200">
                {[
                  ["Connect your first app", "Set up a shared connection and test a trigger."],
                  ["Add AI providers", "Connect GPT-4, Claude, Gemini, or custom endpoints."],
                  ["Publish a workflow", "Move from draft to live with credentials and alerts."],
                ].map(([title, copy]) => (
                  <div key={title} className="py-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <BookOpen size={16} className="text-slate-400" />
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{title}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{copy}</div>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 text-[12px] font-medium text-[#103b71] hover:text-[#0c2a52]">
                      Open <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "troubleshooting" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Troubleshooting</h2>
                <p className="text-[14px] text-slate-500 mt-1">Quick answers for the issues builders hit most often.</p>
              </div>
              <div className="mt-3 max-w-[980px] divide-y divide-slate-200">
                {[
                  ["Broken OAuth connection", "Reconnect the app or rotate the shared client credentials."],
                  ["Webhook not firing", "Check endpoint status, signing secret, and trigger path."],
                  ["Model request failed", "Review provider key, rate limits, and fallback settings."],
                ].map(([title, copy]) => (
                  <div key={title} className="py-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <LifeBuoy size={16} className="text-slate-400" />
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{title}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{copy}</div>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 text-[12px] font-medium text-[#103b71] hover:text-[#0c2a52]">
                      View fix <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Security</h2>
                <p className="text-[14px] text-slate-500 mt-1">Review access, credentials, and workspace protection topics.</p>
              </div>
              <div className="mt-3 max-w-[980px] divide-y divide-slate-200">
                {[
                  ["Workspace access", "Manage 2FA, SSO, IP allowlists, and active sessions."],
                  ["Shared credentials", "Use vault-managed auth instead of personal tokens."],
                  ["Webhook verification", "Validate signatures before processing external events."],
                ].map(([title, copy]) => (
                  <div key={title} className="py-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <ShieldQuestion size={16} className="text-slate-400" />
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{title}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{copy}</div>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-2 text-[12px] font-medium text-[#103b71] hover:text-[#0c2a52]">
                      Read <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "contact" && (
            <>
              <div className="pb-5 border-b border-slate-200">
                <h2 className="text-[22px] font-bold text-slate-900">Contact</h2>
                <p className="text-[14px] text-slate-500 mt-1">Reach support through the channel that matches the urgency.</p>
              </div>
              <div className="mt-3 max-w-[980px] divide-y divide-slate-200">
                {[
                  ["General support", "support@flowholt.com", "Email"],
                  ["Workspace success", "success@flowholt.com", "Email"],
                  ["Urgent incident", "Open priority support chat", "Chat"],
                ].map(([title, copy, type]) => (
                  <div key={title} className="py-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <MessageSquareText size={16} className="text-slate-400" />
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{title}</div>
                        <div className="text-[13px] text-slate-500 mt-1">{copy}</div>
                      </div>
                    </div>
                    <button className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      {type}
                    </button>
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

export default HelpCenterPage;
