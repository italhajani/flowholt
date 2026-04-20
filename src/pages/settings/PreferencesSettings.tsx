import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Type, Palette, Keyboard, Accessibility, Monitor, Sun, Moon, Eye, MousePointer, Loader2, Check } from "lucide-react";
import { usePreferences, useUpdatePreferences } from "@/hooks/useApi";

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
  { id: "autoSave", label: "Auto-save workflows", description: "Save changes automatically every 30 seconds.", defaultOn: true },
  { id: "confirmDelete", label: "Confirm before delete", description: "Show confirmation dialog for destructive actions.", defaultOn: true },
];

const shortcuts = [
  { action: "Command palette", keys: ["⌘", "K"] },
  { action: "Save workflow", keys: ["⌘", "S"] },
  { action: "Undo", keys: ["⌘", "Z"] },
  { action: "Redo", keys: ["⌘", "⇧", "Z"] },
  { action: "Execute workflow", keys: ["⌘", "↵"] },
  { action: "Toggle sidebar", keys: ["⌘", "B"] },
  { action: "Search nodes", keys: ["⌘", "⇧", "P"] },
  { action: "Zoom to fit", keys: ["⌘", "0"] },
];

const colorThemes = [
  { id: "zinc", label: "Zinc", from: "#27272a", to: "#18181b" },
  { id: "slate", label: "Slate", from: "#334155", to: "#1e293b" },
  { id: "green", label: "Emerald", from: "#059669", to: "#047857" },
  { id: "blue", label: "Blue", from: "#2563eb", to: "#1d4ed8" },
  { id: "purple", label: "Purple", from: "#7c3aed", to: "#6d28d9" },
  { id: "rose", label: "Rose", from: "#e11d48", to: "#be123c" },
];

export function PreferencesSettings() {
  const { data: prefs_data } = usePreferences();
  const updateMut = useUpdatePreferences();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.id, p.defaultOn]))
  );
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState("13");
  const [accentColor, setAccentColor] = useState("zinc");
  const [editorFont, setEditorFont] = useState("mono");
  const [cursorStyle, setCursorStyle] = useState("line");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Sync from backend preferences
  useEffect(() => {
    if (prefs_data) {
      setFontSize(String(prefs_data.editor_font_size));
      if (prefs_data.theme && prefs_data.theme !== "system") setTheme(prefs_data.theme as any);
      if (prefs_data.code_theme) setAccentColor(prefs_data.code_theme);
    }
  }, [prefs_data]);

  const toggle = (id: string) => setValues((v) => ({ ...v, [id]: !v[id] }));

  const handleSave = () => {
    updateMut.mutate({
      theme: theme as string,
      editor_font_size: parseInt(fontSize) || 13,
      code_theme: accentColor,
      keyboard_shortcuts: "default",
    }, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[16px] font-semibold text-zinc-900">Preferences</h2>
        <p className="text-[13px] text-zinc-500 mt-1">Customize your FlowHolt experience.</p>
      </div>

      {/* Theme & appearance */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={14} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">Appearance</span>
        </div>

        <div className="space-y-4">
          {/* Theme mode */}
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-2 block">Theme</label>
            <div className="flex items-center gap-2">
              {([
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all duration-150 border",
                    theme === t.value ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <t.icon size={12} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-2 block">Accent Color</label>
            <div className="flex items-center gap-2">
              {colorThemes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id)}
                  className={cn("h-7 w-7 rounded-full transition-all", accentColor === c.id ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "hover:scale-105")}
                  style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor settings */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Type size={14} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">Editor</span>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Font size</label>
            <div className="flex items-center gap-2">
              <input type="range" min="11" max="18" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="flex-1 accent-zinc-800" />
              <span className="text-[12px] font-mono text-zinc-600 w-8 text-center">{fontSize}px</span>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Font family</label>
            <select value={editorFont} onChange={(e) => setEditorFont(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400/30">
              <option value="mono">System Mono</option>
              <option value="jetbrains">JetBrains Mono</option>
              <option value="fira">Fira Code</option>
              <option value="cascadia">Cascadia Code</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Cursor style</label>
            <select value={cursorStyle} onChange={(e) => setCursorStyle(e.target.value)} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400/30">
              <option value="line">Line</option>
              <option value="block">Block</option>
              <option value="underline">Underline</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Tab size</label>
            <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400/30">
              <option>2 spaces</option>
              <option>4 spaces</option>
              <option>Tab character</option>
            </select>
          </div>
        </div>

        {/* Font preview */}
        <div className="mt-3 rounded-md bg-zinc-50 border border-zinc-100 p-3">
          <p className="text-[10px] text-zinc-400 mb-1">Preview</p>
          <pre className="text-zinc-700" style={{ fontSize: `${fontSize}px`, fontFamily: editorFont === "mono" ? "ui-monospace, monospace" : editorFont }}>
            {`const result = items.filter(item => item.active);`}
          </pre>
        </div>
      </div>

      {/* Toggle preferences */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <MousePointer size={14} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">Behavior</span>
        </div>
        <div className="space-y-4">
          {prefs.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-800">{p.label}</p>
                <p className="text-[12px] text-zinc-400">{p.description}</p>
              </div>
              <button
                onClick={() => toggle(p.id)}
                className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", values[p.id] ? "bg-zinc-800" : "bg-zinc-200")}
              >
                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", values[p.id] ? "left-[18px]" : "left-0.5")} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard size={14} className="text-zinc-400" />
            <span className="text-[13px] font-semibold text-zinc-700">Keyboard Shortcuts</span>
          </div>
          <Button variant="ghost" size="sm">Reset to defaults</Button>
        </div>
        <div className="space-y-1.5">
          {shortcuts.map((s) => (
            <div key={s.action} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-zinc-50 transition-colors">
              <span className="text-[12px] text-zinc-600">{s.action}</span>
              <div className="flex items-center gap-0.5">
                {s.keys.map((k, i) => (
                  <kbd key={i} className="min-w-[22px] h-5 flex items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-[10px] text-zinc-500 font-mono px-1">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Accessibility size={14} className="text-zinc-400" />
          <span className="text-[13px] font-semibold text-zinc-700">Accessibility</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-zinc-800">Reduced motion</p>
              <p className="text-[12px] text-zinc-400">Minimize animations for motion sensitivity.</p>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", reducedMotion ? "bg-zinc-800" : "bg-zinc-200")}
            >
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", reducedMotion ? "left-[18px]" : "left-0.5")} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-zinc-800">High contrast</p>
              <p className="text-[12px] text-zinc-400">Increase contrast ratio for better visibility.</p>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", highContrast ? "bg-zinc-800" : "bg-zinc-200")}
            >
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200", highContrast ? "left-[18px]" : "left-0.5")} />
            </button>
          </div>
        </div>
      </div>

      {/* Language & region */}
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Language</label>
          <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
            <option>日本語</option>
            <option>한국어</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-600 mb-1.5 block">Timezone</label>
          <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-800 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/30 transition-all">
            <option>UTC (GMT+0)</option>
            <option>Asia/Karachi (GMT+5)</option>
            <option>America/New_York (GMT-5)</option>
            <option>Europe/London (GMT+0)</option>
            <option>Asia/Tokyo (GMT+9)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex items-center gap-3" style={{ borderTop: "1px solid #f4f4f5" }}>
        <Button variant="primary" size="md" onClick={handleSave} disabled={updateMut.isPending}>
          {updateMut.isPending ? <><Loader2 size={12} className="animate-spin mr-1" />Saving…</> : saved ? <><Check size={12} className="mr-1" />Saved</> : "Save Changes"}
        </Button>
        <Button variant="ghost" size="md">Cancel</Button>
      </div>
    </div>
  );
}
