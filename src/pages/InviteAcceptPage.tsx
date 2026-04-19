import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Check,
  X,
  Building2,
  GitBranch,
  Bot,
  Zap,
  Loader2,
} from "lucide-react";

interface InviteInfo {
  workspaceName: string;
  workspaceIcon: string;
  inviterName: string;
  inviterEmail: string;
  inviterAvatar: string;
  role: "admin" | "editor" | "viewer";
  memberCount: number;
  workflowCount: number;
  agentCount: number;
}

const roleLabels: Record<string, { label: string; color: string; desc: string }> = {
  admin:  { label: "Admin",  color: "bg-red-50 text-red-600",     desc: "Full access to all resources, settings, and team management" },
  editor: { label: "Editor", color: "bg-blue-50 text-blue-600",   desc: "Create and edit workflows, agents, and credentials" },
  viewer: { label: "Viewer", color: "bg-zinc-100 text-zinc-600",  desc: "View-only access to workflows, executions, and dashboards" },
};

const mockInvite: InviteInfo = {
  workspaceName: "Acme Engineering",
  workspaceIcon: "A",
  inviterName: "Sarah Chen",
  inviterEmail: "sarah@acme.com",
  inviterAvatar: "SC",
  role: "editor",
  memberCount: 12,
  workflowCount: 47,
  agentCount: 8,
};

export function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "accepting" | "accepted" | "declined">("pending");
  const invite = mockInvite;
  const roleInfo = roleLabels[invite.role];

  const accept = () => {
    setStatus("accepting");
    setTimeout(() => {
      setStatus("accepted");
      setTimeout(() => navigate("/home"), 1500);
    }, 1200);
  };

  const decline = () => setStatus("declined");

  if (status === "accepted") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-5">
          <Check size={24} className="text-emerald-500" />
        </div>
        <h2 className="text-[20px] font-semibold text-zinc-900">Welcome aboard!</h2>
        <p className="mt-2 text-[13px] text-zinc-500">
          You've joined <span className="font-medium text-zinc-700">{invite.workspaceName}</span> as {roleInfo.label}.
        </p>
        <p className="mt-1 text-[12px] text-zinc-400">Redirecting to your dashboard…</p>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 mb-5">
          <X size={24} className="text-zinc-400" />
        </div>
        <h2 className="text-[20px] font-semibold text-zinc-900">Invitation declined</h2>
        <p className="mt-2 text-[13px] text-zinc-500">
          You declined the invitation to {invite.workspaceName}.
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="mt-6 text-[13px] font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Go to login →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Workspace avatar */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-[22px] font-bold text-white mb-5"
        style={{ background: "linear-gradient(135deg, #18181b, #3f3f46)" }}
      >
        {invite.workspaceIcon}
      </div>

      <h2 className="text-[20px] font-semibold text-zinc-900">You're invited</h2>
      <p className="mt-1.5 text-[13px] text-zinc-500 text-center max-w-[300px]">
        <span className="font-medium text-zinc-700">{invite.inviterName}</span> invited you to join
      </p>

      {/* Workspace card */}
      <div
        className="mt-5 w-full rounded-xl border p-5"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white text-[14px] font-bold flex-shrink-0">
            {invite.workspaceIcon}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-zinc-900">{invite.workspaceName}</p>
            <p className="text-[11px] text-zinc-400">{invite.memberCount} members</p>
          </div>
        </div>

        {/* Workspace stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: Users, label: "Members", value: invite.memberCount },
            { icon: GitBranch, label: "Workflows", value: invite.workflowCount },
            { icon: Bot, label: "AI Agents", value: invite.agentCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center rounded-lg bg-zinc-50 py-2.5">
              <Icon size={14} className="text-zinc-400 mb-1" />
              <span className="text-[14px] font-semibold text-zinc-800">{value}</span>
              <span className="text-[10px] text-zinc-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2.5">
          <Shield size={14} className="text-zinc-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-zinc-700">Your role:</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">{roleInfo.desc}</p>
          </div>
        </div>
      </div>

      {/* Inviter info */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[8px] font-bold text-zinc-600">
          {invite.inviterAvatar}
        </div>
        <span>Invited by {invite.inviterName} ({invite.inviterEmail})</span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex w-full gap-3">
        <button
          onClick={decline}
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-600 transition-all hover:bg-zinc-50 hover:border-zinc-300"
        >
          Decline
        </button>
        <button
          onClick={accept}
          disabled={status === "accepting"}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-70"
        >
          {status === "accepting" ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Joining…
            </>
          ) : (
            <>
              <Zap size={14} />
              Accept & Join
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-[10px] text-zinc-300 text-center">
        Token: {token?.slice(0, 8)}…
      </p>
    </div>
  );
}
