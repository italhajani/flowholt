import React from "react";
import { 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Server,
  ChevronDown
} from "lucide-react";
import { useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
  const location = useLocation();
  const { workspace } = useAuth();
  
  // Format pathname into breadcrumbs. 
  // e.g., /dashboard/overview simply maps to specific semantic titles
  const currentPath = location.pathname.split('/').filter(Boolean).pop() || "Overview";
  const capitalPath = currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  return (
    <header className="h-[72px] bg-transparent flex items-center justify-between px-8 bg-white/40 backdrop-blur-md sticky top-0 z-30">
      
      {/* Left side: Context & AI Tools */}
      <div className="flex items-center gap-6">
        
        {/* Simple Monochrome Ask AI Button */}
        <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-slate-200 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Sparkles size={14} className="text-slate-400" /> Ask AI
        </button>
        
        <div className="w-px h-5 bg-slate-200" />

        {/* Global Search */}
        <GlobalSearch />
        
        <div className="w-px h-5 bg-slate-200" />

        {/* Clean Breadcrumb Hierarchy */}
        <div className="flex items-center gap-2 text-[13px] font-bold tracking-wide">
           <span className="text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">{workspace?.name ?? "Workspace"}</span>
           <ChevronRight size={14} className="text-slate-300" />
           <span className="text-slate-900">{capitalPath}</span>
        </div>

      </div>

      {/* Right side: App Context Utility Icons */}
      <div className="flex items-center gap-4">
        
        {/* Environment Toggler */}
        <button className="flex items-center gap-2 h-9 px-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-600 group">
           <Server size={14} className="text-emerald-500" />
           <span className="text-[12px] font-bold flex gap-1.5 items-center">
             Production <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600" />
           </span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Documentation Link */}
        <button className="flex items-center gap-2 h-9 px-3 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all text-[12px] font-bold">
           <BookOpen size={15} />
           <span className="hidden sm:block">Docs</span>
        </button>

        {/* Active Notifications Bell */}
        <NotificationBell />

      </div>
    </header>
  );
}
