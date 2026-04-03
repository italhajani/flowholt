import React from "react";
import {
  Zap,
  Clock,
  GitBranch,
  MoreHorizontal,
  Plus,
  Maximize2,
  AlertTriangle,
  DollarSign,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 w-full max-w-full animate-fade-in pb-32">
      
      {/* Container spacing reduced: gap-6 -> gap-4 for tighter layout as requested */}
      <div className="mb-10 w-full">
        <div className="flex justify-between items-end w-full mb-6">
          <div>
            <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </h3>
            <h1 className="text-[42px] font-[800] text-slate-900 tracking-tight leading-none mb-2">Hello, Ital</h1>
            <h2 className="text-[32px] font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-text leading-[1.1] inline-block mb-2">
              How can I help you automate today?
            </h2>
          </div>

          {/* AI Health Ribbon - Reduced borders and removed shadows per instructions */}
          <div className="flex gap-4 items-center">
             <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engine</span>
                   <span className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" /> OpenAI GPT-4
                   </span>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="flex flex-col">
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Node Latency</span>
                   <span className="text-[14px] font-extrabold text-slate-800 mt-0.5">45ms</span>
                </div>
             </div>
          </div>
        </div>

        {/* The New AI Input Field & Blank Button Injection */}
        <div className="flex items-center gap-4 w-full max-w-4xl">
           <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-2 flex items-center pr-3 focus-within:ring-2 focus-within:ring-[#8A78F3]/30 transition-all">
              <input 
                type="text" 
                placeholder="What do you want to automate? e.g. Sync new Stripe payments to Airtable"
                className="flex-1 w-full bg-transparent border-none outline-none text-[14px] font-medium text-slate-900 placeholder:text-slate-400 px-3 h-10"
              />
              <button className="flex items-center gap-2 bg-[#103b71] text-white px-5 h-10 rounded-xl text-[13px] font-bold hover:bg-[#0c2a52] transition-colors shrink-0">
                 <Sparkles size={16} className="text-white fill-white/20" /> Generate Link
              </button>
           </div>
           
           <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider px-2">OR</span>
           
           <button className="h-14 px-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shrink-0" onClick={() => navigate('/studio/new')}>
              <Plus size={18} /> Create a blank workflow
           </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_minmax(300px,380px)_minmax(300px,380px)] gap-4 w-full shrink-0">
        
        {/* Main Floating "My Tasks" / Executions Widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col group">
          <div className="flex items-center justify-between mb-6 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Zap size={20} className="text-[#8A78F3]" strokeWidth={2.5} />
              <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">Active Executions</h3>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Plus size={18} className="hover:text-slate-900 transition-colors" />
              <Maximize2 size={16} className="hover:text-slate-900 transition-colors hidden sm:block" />
              <MoreHorizontal size={20} className="hover:text-slate-900 transition-colors" />
            </div>
          </div>
          
          <div className="grid grid-cols-[3fr_1fr_1fr] gap-4 px-2 pb-3 border-b border-slate-200/60 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Workflow Area</span>
            <span>Priority</span>
            <span className="text-right">Latency</span>
          </div>

          <div className="flex-1">
            {/* Row 1 */}
            <div className="grid grid-cols-[3fr_1fr_1fr] items-center gap-4 py-4 px-2 border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-slate-400 w-4">1.</span>
                <div className="min-w-0">
                   <h4 className="text-[13px] font-bold text-slate-900 truncate">Support Ticket Classifier</h4>
                   <p className="text-[11px] text-slate-500 font-medium truncate">Customer Operations</p>
                </div>
              </div>
              <div><span className="px-2.5 py-1 rounded bg-[#FFEDD5] text-[#9A3412] text-[11px] font-bold uppercase tracking-wide">High</span></div>
              <div className="text-right text-[13px] font-bold text-[#EF4444]">8.5s</div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-[3fr_1fr_1fr] items-center gap-4 py-4 px-2 border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-slate-400 w-4">2.</span>
                <div className="min-w-0">
                   <h4 className="text-[13px] font-bold text-slate-900 truncate">CRM Data Sync</h4>
                   <p className="text-[11px] text-slate-500 font-medium truncate">Sales Engine</p>
                </div>
              </div>
              <div><span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wide">Low</span></div>
              <div className="text-right text-[13px] font-bold text-slate-900">1.2s</div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-[3fr_1fr_1fr] items-center gap-4 py-4 px-2 hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-slate-400 w-4">3.</span>
                <div className="min-w-0">
                   <h4 className="text-[13px] font-bold text-slate-900 truncate">Slack Notification Router</h4>
                   <p className="text-[11px] text-slate-500 font-medium truncate">Internal Comm</p>
                </div>
              </div>
              <div><span className="px-2.5 py-1 rounded bg-[#FFEDD5] text-[#9A3412] text-[11px] font-bold uppercase tracking-wide">High</span></div>
              <div className="text-right text-[13px] font-bold text-slate-900">0.8s</div>
            </div>
            
            <button className="flex items-center gap-2 mt-4 px-3 py-2 text-[13px] font-bold text-[#8A78F3] hover:bg-slate-50 rounded-lg transition-colors">
              <Plus size={16} /> Add tracker
            </button>
          </div>
        </div>

        {/* Column 2: Core Pipelines & System Goals */}
        <div className="flex flex-col gap-4 w-full">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <GitBranch size={18} className="text-[#8A78F3]" /> Core Pipelines
              </h3>
            </div>
            
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-center h-16 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer group">
                  <Plus size={18} className="text-slate-400 group-hover:text-slate-600 mr-2" strokeWidth={2.5} />
                  <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-800">Create workflow</span>
               </div>
               
               <div className="flex flex-col justify-center rounded-xl border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 transition-all">
                 <div className="flex items-center justify-between">
                    <div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#8A78F3] inline-block mr-2" />
                        <h4 className="text-[14px] font-bold text-slate-900 tracking-tight leading-tight inline-block">Data Integrity Fix</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">12 nodes</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 flex flex-col">
            <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight mb-5">
              <Clock size={18} className="text-[#8A78F3]" /> System Goals
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-slate-800">Uptime Reliability</span>
                  <span className="text-[13px] font-extrabold text-[#8A78F3]">99%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8A78F3] w-[99%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-slate-800">Processing Quota</span>
                  <span className="text-[13px] font-extrabold text-[#38B2AC]">42%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38B2AC] w-[42%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Column 3: The New AI Injection (LLM Cost & Fallback feed) */}
        <div className="flex flex-col gap-4 w-full">
           
           <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <DollarSign size={18} className="text-emerald-500" /> API Budget Wrap
              </h3>
            </div>

            <div className="flex items-center justify-center p-2">
               {/* Minimalist modern ring representation, border shadows removed */}
               <div className="relative w-28 h-28 rounded-full border-[10px] border-slate-50 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[10px] border-emerald-400 border-l-transparent border-b-transparent transform rotate-45" />
                  <div className="text-center">
                     <div className="text-[18px] font-extrabold text-slate-900">$48</div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase">/ $100</div>
                  </div>
               </div>
            </div>
            <p className="text-[12px] text-slate-500 text-center font-medium mt-3">Spend dominated by <strong>Claude-3 Opus</strong></p>
           </div>
           
           <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 flex flex-col">
            <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2 tracking-tight mb-5">
              <AlertTriangle size={18} className="text-amber-500" /> AI Fallbacks
            </h3>
            
            <div className="flex flex-col gap-3">
               <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/80">
                  <div className="flex items-center justify-between mb-1">
                     <h4 className="text-[12px] font-bold text-amber-900">Email Summarization</h4>
                     <span className="text-[10px] font-bold text-amber-600">5m ago</span>
                  </div>
                  <p className="text-[11px] text-amber-700/80 leading-snug">OpenAI rate-limited. Fallback successfully engaged to internal LLaMA-3.</p>
               </div>
               
               <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                     <h4 className="text-[12px] font-bold text-slate-700">Vision Analysis API</h4>
                     <span className="text-[10px] font-bold text-slate-400">1hr ago</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">Input resolution exceeded params. Resized automatically.</p>
               </div>
            </div>
           </div>

        </div>

      </div>

    </div>
  );
};

export default OverviewPage;
