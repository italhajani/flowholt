import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function WorkspaceGeneralSettings() {
  const [name, setName] = useState("FlowHolt Workspace");
  const [slug, setSlug] = useState("flowholt");

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">General</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Workspace identity and configuration.</p>

      <div className="mt-6 space-y-5 max-w-md">
        {/* Workspace icon */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-white text-[14px] font-bold">
            FH
          </div>
          <div>
            <Button variant="secondary" size="sm">Change icon</Button>
            <p className="text-[11px] text-zinc-400 mt-1">Square image, 256×256px minimum.</p>
          </div>
        </div>

        <Field label="Workspace name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Slug">
          <div className="flex items-center gap-0 rounded-md border border-zinc-200 bg-white overflow-hidden focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400/30 transition-all">
            <span className="pl-3 text-[13px] text-zinc-400">flowholt.com/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 py-2 pr-3 text-[13px] text-zinc-800 bg-transparent outline-none"
            />
          </div>
        </Field>

        <Field label="Description">
          <textarea
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all resize-none"
            rows={2}
            placeholder="What is this workspace used for?"
          />
        </Field>

        <Field label="Default timezone">
          <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
            <option>UTC (GMT+0)</option>
            <option>Asia/Karachi (GMT+5)</option>
            <option>America/New_York (GMT-5)</option>
          </select>
        </Field>
      </div>

      {/* Danger zone */}
      <div className="mt-10 rounded-lg border border-red-100 p-4">
        <p className="text-[13px] font-semibold text-red-600">Danger Zone</p>
        <p className="text-[12px] text-zinc-500 mt-1 mb-3">Destructive actions that cannot be undone.</p>
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm">Delete Workspace</Button>
          <Button variant="ghost" size="sm">Transfer Ownership</Button>
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
