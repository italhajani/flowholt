import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users, Link2, Copy, Check, Globe, Lock, Eye, Pencil, Shield,
  Search, X, ChevronDown, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  workflowName?: string;
}

type Permission = "view" | "edit" | "admin";

interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permission: Permission;
}

const mockTeamMembers = [
  { id: "u1", name: "Sarah Chen", email: "sarah@flowholt.com", avatar: "SC" },
  { id: "u2", name: "Alex Rivera", email: "alex@flowholt.com", avatar: "AR" },
  { id: "u3", name: "Jordan Lee", email: "jordan@flowholt.com", avatar: "JL" },
  { id: "u4", name: "Morgan Kim", email: "morgan@flowholt.com", avatar: "MK" },
  { id: "u5", name: "Taylor Singh", email: "taylor@flowholt.com", avatar: "TS" },
];

const permissionLabels: Record<Permission, { label: string; icon: typeof Eye; color: string }> = {
  view:  { label: "Viewer",  icon: Eye,    color: "text-zinc-500" },
  edit:  { label: "Editor",  icon: Pencil, color: "text-blue-600" },
  admin: { label: "Admin",   icon: Shield, color: "text-amber-600" },
};

export function ShareWorkflowModal({ open, onClose, workflowName = "Untitled Workflow" }: ShareWorkflowModalProps) {
  const [search, setSearch] = useState("");
  const [sharedWith, setSharedWith] = useState<SharedUser[]>([
    { ...mockTeamMembers[0], permission: "edit" },
    { ...mockTeamMembers[2], permission: "view" },
  ]);
  const [linkAccess, setLinkAccess] = useState<"private" | "team" | "public">("private");
  const [copied, setCopied] = useState(false);
  const [showPermDropdown, setShowPermDropdown] = useState<string | null>(null);
  const [invitePermission, setInvitePermission] = useState<Permission>("view");

  const available = mockTeamMembers.filter(
    (m) => !sharedWith.find((s) => s.id === m.id) &&
           (search === "" || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  );

  const addUser = (member: typeof mockTeamMembers[0]) => {
    setSharedWith((prev) => [...prev, { ...member, permission: invitePermission }]);
    setSearch("");
  };

  const removeUser = (id: string) => {
    setSharedWith((prev) => prev.filter((u) => u.id !== id));
  };

  const changePermission = (id: string, perm: Permission) => {
    setSharedWith((prev) => prev.map((u) => u.id === id ? { ...u, permission: perm } : u));
    setShowPermDropdown(null);
  };

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Share "${workflowName}"`} className="max-w-lg">
      <div className="space-y-5">
        {/* Invite section */}
        <div>
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Invite people</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                prefix={<Search size={13} />}
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && available.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-zinc-200 bg-white shadow-lg max-h-40 overflow-y-auto">
                  {available.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => addUser(m)}
                      className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 transition-colors"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-600">
                        {m.avatar}
                      </span>
                      <div className="text-left">
                        <p className="text-[12px] font-medium text-zinc-700">{m.name}</p>
                        <p className="text-[10px] text-zinc-400">{m.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setInvitePermission(invitePermission === "view" ? "edit" : invitePermission === "edit" ? "admin" : "view")}
                className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
              >
                {permissionLabels[invitePermission].label}
                <ChevronDown size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Shared with list */}
        {sharedWith.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Shared with ({sharedWith.length})
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {/* Owner */}
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                  GA
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-zinc-700">You</p>
                  <p className="text-[10px] text-zinc-400">gouhar@flowholt.com</p>
                </div>
                <Badge variant="neutral">Owner</Badge>
              </div>
              {sharedWith.map((user) => {
                const perm = permissionLabels[user.permission];
                const PermIcon = perm.icon;
                return (
                  <div key={user.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50 transition-colors">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-600">
                      {user.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-zinc-700">{user.name}</p>
                      <p className="text-[10px] text-zinc-400">{user.email}</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowPermDropdown(showPermDropdown === user.id ? null : user.id)}
                        className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", perm.color)}
                      >
                        <PermIcon size={10} /> {perm.label} <ChevronDown size={8} />
                      </button>
                      {showPermDropdown === user.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-lg border border-zinc-200 bg-white shadow-lg p-1">
                          {(["view", "edit", "admin"] as Permission[]).map((p) => {
                            const pl = permissionLabels[p];
                            const Icon = pl.icon;
                            return (
                              <button
                                key={p}
                                onClick={() => changePermission(user.id, p)}
                                className={cn(
                                  "flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] hover:bg-zinc-50",
                                  user.permission === p ? "bg-zinc-50 font-semibold" : ""
                                )}
                              >
                                <Icon size={10} className={pl.color} /> {pl.label}
                              </button>
                            );
                          })}
                          <div className="border-t border-zinc-100 mt-1 pt-1">
                            <button
                              onClick={() => { removeUser(user.id); setShowPermDropdown(null); }}
                              className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] text-red-500 hover:bg-red-50"
                            >
                              <X size={10} /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Link access */}
        <div className="border-t border-zinc-100 pt-4">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Link access</p>
          <div className="flex items-center gap-2">
            {([
              { id: "private", label: "Private", icon: Lock, desc: "Only invited people" },
              { id: "team", label: "Team", icon: Users, desc: "Anyone in workspace" },
              { id: "public", label: "Public", icon: Globe, desc: "Anyone with the link" },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLinkAccess(opt.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all",
                  linkAccess === opt.id
                    ? "border-blue-300 bg-blue-50/50"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <opt.icon size={14} className={linkAccess === opt.id ? "text-blue-600" : "text-zinc-400"} />
                <span className={cn("text-[11px] font-medium", linkAccess === opt.id ? "text-blue-700" : "text-zinc-600")}>{opt.label}</span>
                <span className="text-[9px] text-zinc-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
          <Link2 size={13} className="text-zinc-400 flex-shrink-0" />
          <span className="flex-1 text-[11px] text-zinc-500 font-mono truncate">
            https://app.flowholt.com/wf/share/abc123...
          </span>
          <Button variant="ghost" size="sm" onClick={copyLink}>
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* Notify option */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <Mail size={12} className="text-zinc-400" />
          <span>Collaborators will be notified via email</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onClose}>Save & Share</Button>
        </div>
      </div>
    </Modal>
  );
}
