import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Share2, Sparkles } from "lucide-react";

interface TopBarProps {
  activeTab: "editor" | "executions";
  onTabChange: (tab: "editor" | "executions") => void;
  onOpenChat: () => void;
}

const teamAvatars = ["AL", "TS", "BK", "RM"];

const TopBar: React.FC<TopBarProps> = ({ onOpenChat }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-5 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => navigate("/dashboard/workflows")}
          className="w-8 h-8 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center text-[13px] font-semibold shrink-0"
        >
          FH
        </button>

        <div className="hidden md:flex items-center gap-2 text-[12px] text-slate-500">
          <span>Team_Lab</span>
          <span>/</span>
          <span>Project</span>
          <span>/</span>
          <span className="text-slate-700 font-medium">Workflow</span>
          <span>/</span>
          <span>New</span>
          <span className="ml-2 px-2 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-500">Draft</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenChat}
          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-600 inline-flex items-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Sparkles size={13} />
          Assist
        </button>

        <button className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-600 inline-flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Share2 size={13} />
          Share
        </button>

        <div className="hidden md:flex items-center -space-x-2 px-1">
          {teamAvatars.map((avatar, index) => (
            <div
              key={avatar}
              className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold ${
                index % 2 === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {avatar}
            </div>
          ))}
        </div>

        <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50">
          <Bell size={14} />
        </button>

        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-semibold text-slate-700">
          GA
        </div>
      </div>
    </header>
  );
};

export default TopBar;
