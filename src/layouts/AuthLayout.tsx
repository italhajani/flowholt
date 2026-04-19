import { Outlet } from "react-router-dom";
import { GitBranch, Zap, Shield, Bot } from "lucide-react";

const features = [
  { icon: GitBranch, title: "Visual Workflow Builder", desc: "Design automations with a drag-and-drop canvas." },
  { icon: Bot, title: "AI-Powered Agents", desc: "Build intelligent agents with GPT-4o integration." },
  { icon: Zap, title: "500+ Integrations", desc: "Connect your entire stack in seconds." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2, SSO, audit logs, and role-based access." },
];

export function AuthLayout() {
  return (
    <div className="flex h-full w-full" style={{ background: "var(--color-bg-surface)" }}>
      {/* Left feature panel — hidden on small screens */}
      <div className="hidden lg:flex lg:w-[420px] flex-col justify-between p-10 bg-zinc-900 text-white">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <span className="text-[12px] font-bold text-white">F</span>
            </div>
            <span className="text-[16px] font-semibold">FlowHolt</span>
          </div>
          <h1 className="text-[24px] font-semibold leading-tight">
            Automate anything.<br />
            <span className="text-zinc-400">Ship faster.</span>
          </h1>
          <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed max-w-[300px]">
            The modern workflow automation platform for teams that move fast.
          </p>
          <div className="mt-10 space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 mt-0.5">
                  <f.icon size={15} className="text-zinc-400" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{f.title}</p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-zinc-600">© 2026 FlowHolt. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900">
              <span className="text-[11px] font-bold text-white">F</span>
            </div>
            <span className="text-[15px] font-semibold text-zinc-900">FlowHolt</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
