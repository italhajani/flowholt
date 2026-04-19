import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface TogglePref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const prefs: TogglePref[] = [
  { id: "animations", label: "Enable animations", description: "Smooth transitions and micro-interactions.", defaultOn: true },
  { id: "dense", label: "Dense mode", description: "Reduce padding for more content on screen.", defaultOn: false },
  { id: "sound", label: "Sound effects", description: "Audible feedback for notifications and actions.", defaultOn: false },
  { id: "commandPalette", label: "Show ⌘K hint", description: "Show command palette hint in search bar.", defaultOn: true },
];

export function PreferencesSettings() {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.id, p.defaultOn]))
  );
  const { theme, setTheme } = useTheme();

  const toggle = (id: string) => setValues((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-zinc-900">Preferences</h2>
      <p className="text-[13px] text-zinc-500 mt-1">Customize your FlowHolt experience.</p>

      {/* Theme */}
      <div className="mt-6">
        <label className="text-[12px] font-medium text-zinc-600 mb-2 block">Theme</label>
        <div className="flex items-center gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-medium transition-all duration-150 capitalize border",
                theme === t
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-6 space-y-4">
        {prefs.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-zinc-800">{p.label}</p>
              <p className="text-[12px] text-zinc-400">{p.description}</p>
            </div>
            <button
              onClick={() => toggle(p.id)}
              className={cn(
                "relative w-9 h-5 rounded-full transition-colors duration-200",
                values[p.id] ? "bg-zinc-800" : "bg-zinc-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
                  values[p.id] ? "left-[18px]" : "left-0.5"
                )}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Language & timezone */}
      <div className="mt-6 space-y-4 max-w-md">
        <div>
          <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Language</label>
          <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Timezone</label>
          <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
            <option>UTC (GMT+0)</option>
            <option>Asia/Karachi (GMT+5)</option>
            <option>America/New_York (GMT-5)</option>
            <option>Europe/London (GMT+0)</option>
          </select>
        </div>
      </div>

      <div className="mt-8 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md">Save Changes</Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}
