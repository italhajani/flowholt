import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateVariableModalProps {
  open: boolean;
  onClose: () => void;
}

const scopes = ["Workspace", "Team", "User"] as const;

export function CreateVariableModal({ open, onClose }: CreateVariableModalProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<string>("Workspace");
  const [isSecret, setIsSecret] = useState(false);

  const reset = () => { setKey(""); setValue(""); setScope("Workspace"); setIsSecret(false); };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Variable"
      description="Store a reusable config value for your workflows."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={!key.trim()} onClick={handleClose}>
            Create Variable
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Key">
          <Input
            placeholder="e.g., BASE_URL"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
            autoFocus
            className="font-mono"
          />
          <p className="text-[11px] text-zinc-400 mt-1">Uppercase letters, numbers, and underscores only.</p>
        </Field>

        <Field label="Value">
          <Input
            type={isSecret ? "password" : "text"}
            placeholder="Enter value…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>

        <Field label="Scope">
          <div className="flex items-center gap-2">
            {scopes.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-medium border transition-all",
                  scope === s
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Shield size={14} className={isSecret ? "text-amber-500" : "text-zinc-300"} />
            <div>
              <p className="text-[13px] font-medium text-zinc-800">Mark as secret</p>
              <p className="text-[11px] text-zinc-400">Value will be encrypted and hidden after save.</p>
            </div>
          </div>
          <button
            onClick={() => setIsSecret(!isSecret)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors duration-200",
              isSecret ? "bg-amber-500" : "bg-zinc-200"
            )}
          >
            <span className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
              isSecret ? "left-[18px]" : "left-0.5"
            )} />
          </button>
        </div>
      </div>
    </Modal>
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
