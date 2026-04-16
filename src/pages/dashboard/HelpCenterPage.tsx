import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
  const [search, setSearch] = useState("");

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["help-articles", activeTab, search],
    queryFn: () => api.listHelpArticles(activeTab, search.trim() || undefined),
  });

  const iconByTab = useMemo(() => ({
    guides: BookOpen,
    troubleshooting: LifeBuoy,
    security: ShieldQuestion,
    contact: MessageSquareText,
  }), []);

  const sectionCopy: Record<HelpTab, { title: string; description: string; empty: string }> = {
    guides: {
      title: "Guides",
      description: "Start with the setup steps most teams need first.",
      empty: "No guides matched your search.",
    },
    troubleshooting: {
      title: "Troubleshooting",
      description: "Quick answers for the issues builders hit most often.",
      empty: "No troubleshooting articles matched your search.",
    },
    security: {
      title: "Security",
      description: "Review access, credentials, and workspace protection topics.",
      empty: "No security articles matched your search.",
    },
    contact: {
      title: "Contact",
      description: "Reach support through the channel that matches the urgency.",
      empty: "No contact options matched your search.",
    },
  };

  const section = sectionCopy[activeTab];
  const SectionIcon = iconByTab[activeTab];

  const openAction = (href?: string | null) => {
    if (!href) {
      window.dispatchEvent(new CustomEvent("flowholt-open-support-chat"));
      return;
    }
    window.open(href, href.startsWith("mailto:") ? "_self" : "_self");
  };

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <>
            <div className="pb-5 border-b border-slate-200">
              <h2 className="text-[22px] font-bold text-slate-900">{section.title}</h2>
              <p className="text-[14px] text-slate-500 mt-1">{section.description}</p>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-[14px] text-slate-400">Loading help content...</div>
            ) : error ? (
              <div className="py-12 text-center text-[14px] text-rose-600">{error instanceof Error ? error.message : "Failed to load help content."}</div>
            ) : (
              <div className="mt-3 max-w-[980px] divide-y divide-slate-200">
                {data.length === 0 ? (
                  <div className="py-12 text-center text-[14px] text-slate-400">{section.empty}</div>
                ) : (
                  data.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <SectionIcon size={16} className="text-slate-400" />
                        <div>
                          <div className="text-[14px] font-semibold text-slate-900">{item.title}</div>
                          <div className="text-[13px] text-slate-500 mt-1">{item.summary}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => openAction(item.action_href)}
                        className="inline-flex items-center gap-2 text-[12px] font-medium text-[#103b71] hover:text-[#0c2a52]"
                      >
                        {item.action_label} <ArrowUpRight size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
