import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  KeyRound,
  Minus,
  Plus,
  MessageSquarePlus,
  X,
  Check,
  Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   Google-like: sentence-case labels, 13px text, rounded-xl inputs, blue
   accent, subtle borders, clean spacing. No uppercases anywhere.
   ═══════════════════════════════════════════════════════════════════════════ */

const inputBase =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:opacity-50 disabled:cursor-not-allowed";

const inputSmall =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50";

const maybeStartExpression = (
  event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  value: string,
  onChange: (nextValue: string) => void,
) => {
  if (event.key !== "=") return;
  const target = event.currentTarget;
  const selectionCoversAll = target.selectionStart === 0 && target.selectionEnd === value.length;
  if (value.trim().length > 0 && !selectionCoversAll) return;
  event.preventDefault();
  onChange("{{ }}");
  requestAnimationFrame(() => {
    target.focus();
    target.setSelectionRange(3, 3);
  });
};

const insertExpressionAtSelection = (
  target: HTMLInputElement | HTMLTextAreaElement,
  currentValue: string,
  expression: string,
  onChange: (nextValue: string) => void,
) => {
  const start = target.selectionStart ?? currentValue.length;
  const end = target.selectionEnd ?? currentValue.length;
  const nextValue = `${currentValue.slice(0, start)}${expression}${currentValue.slice(end)}`;
  onChange(nextValue);
  requestAnimationFrame(() => {
    const cursor = start + expression.length;
    target.focus();
    target.setSelectionRange(cursor, cursor);
  });
};

/* ─────────────────────────────── FieldLabel ──────────────────────────────── */

export const FieldLabel: React.FC<{
  label: string;
  required?: boolean;
  help?: string;
}> = ({ label, required, help }) => (
  <div className="mb-1.5 flex items-center gap-1.5">
    <span className="text-[13px] font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </span>
    {help && (
      <span title={help} className="cursor-help">
        <HelpCircle
          size={13}
          className="text-slate-300 hover:text-slate-500 transition-colors"
        />
      </span>
    )}
  </div>
);

/* ─────────────────────────────── FieldText ───────────────────────────────── */

export const FieldText: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
  type?: string;
  allowExpressions?: boolean;
  onFocus?: () => void;
  onExpressionDrop?: (expression: string) => void;
}> = ({ value, onChange, placeholder, disabled, prefix, type = "text", allowExpressions = false, onFocus, onExpressionDrop }) => (
  <div className="relative">
    {prefix && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {prefix}
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onDragOver={(e) => {
        if (!onExpressionDrop) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!onExpressionDrop) return;
        const expression = e.dataTransfer.getData("application/x-flowholt-expression") || e.dataTransfer.getData("text/plain");
        if (!expression) return;
        e.preventDefault();
        onExpressionDrop(expression);
        insertExpressionAtSelection(e.currentTarget, value, expression, onChange);
      }}
      onKeyDown={(e) => {
        if (allowExpressions) maybeStartExpression(e, value, onChange);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputBase} ${prefix ? "pl-9" : ""}`}
    />
  </div>
);

/* ─────────────────────────────── FieldTextarea ───────────────────────────── */

export const FieldTextarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  allowExpressions?: boolean;
  onFocus?: () => void;
  onExpressionDrop?: (expression: string) => void;
}> = ({ value, onChange, placeholder, rows = 3, mono, allowExpressions = false, onFocus, onExpressionDrop }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onFocus={onFocus}
    onDragOver={(e) => {
      if (!onExpressionDrop) return;
      e.preventDefault();
    }}
    onDrop={(e) => {
      if (!onExpressionDrop) return;
      const expression = e.dataTransfer.getData("application/x-flowholt-expression") || e.dataTransfer.getData("text/plain");
      if (!expression) return;
      e.preventDefault();
      onExpressionDrop(expression);
      insertExpressionAtSelection(e.currentTarget, value, expression, onChange);
    }}
    onKeyDown={(e) => {
      if (allowExpressions) maybeStartExpression(e, value, onChange);
    }}
    placeholder={placeholder}
    rows={rows}
    className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] leading-5 text-slate-800 outline-none resize-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 ${
      mono ? "font-mono text-[12px]" : ""
    }`}
  />
);

/* ─────────────────────────────── FieldNumber ─────────────────────────────── */

export const FieldNumber: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}> = ({ value, onChange, min, max, step = 1, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number"
      value={value}
      onChange={(e) =>
        onChange(e.target.value === "" ? 0 : Number(e.target.value))
      }
      min={min}
      max={max}
      step={step}
      className={inputBase + " flex-1"}
    />
    {suffix && (
      <span className="shrink-0 text-[12px] text-slate-400">{suffix}</span>
    )}
  </div>
);

/* ─────────────────────────────── FieldSelect ─────────────────────────────── */

export const FieldSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  searchable?: boolean;
}> = ({ value, onChange, options, placeholder, searchable }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? placeholder ?? "Select...";

  if (!searchable) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} appearance-none pr-9 cursor-pointer`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputBase} flex items-center justify-between gap-2 text-left cursor-pointer ${
          value ? "text-slate-800" : "text-slate-400"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 w-full rounded-lg bg-slate-50 pl-8 pr-3 text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-slate-400">
                No results
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                    value === o.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{o.label}</div>
                    {o.description && (
                      <div className="truncate text-[11px] text-slate-400">
                        {o.description}
                      </div>
                    )}
                  </div>
                  {value === o.value && (
                    <Check size={14} className="shrink-0 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────── FieldToggle ─────────────────────────────── */

export const FieldToggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
}> = ({ checked, onChange, label, help }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5">
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[13px] text-slate-700">{label}</span>
      {help && (
        <span title={help} className="cursor-help shrink-0">
          <HelpCircle
            size={12}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          />
        </span>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  </div>
);

/* ─────────────────────────────── FieldSlider ─────────────────────────────── */

export const FieldSlider: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label?: string;
}> = ({ value, onChange, min, max, step, label }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      {label && <span className="text-[12px] text-slate-500">{label}</span>}
      <span className="text-[13px] font-mono font-medium text-blue-600">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none bg-slate-200 cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
    />
    <div className="flex justify-between text-[10px] text-slate-300">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

/* ─────────────────────────────── FieldTags ───────────────────────────────── */

export const FieldTags: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[12px] text-blue-700"
          >
            {tag}
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-blue-400 hover:text-blue-600"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            onChange([...value, input.trim()]);
            setInput("");
          }
        }}
        placeholder={placeholder ?? "Type and press Enter"}
        className={inputSmall}
      />
    </div>
  );
};

/* ─────────────────────────────── FieldKeyValue ───────────────────────────── */

export const FieldKeyValue: React.FC<{
  value: { key: string; value: string }[];
  onChange: (v: { key: string; value: string }[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}> = ({
  value,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}) => (
  <div className="space-y-2">
    {value.map((pair, i) => (
      <div key={i} className="flex items-center gap-2">
        <input
          value={pair.key}
          onChange={(e) => {
            const u = [...value];
            u[i] = { ...pair, key: e.target.value };
            onChange(u);
          }}
          placeholder={keyPlaceholder}
          className={inputSmall + " flex-1"}
        />
        <input
          value={pair.value}
          onChange={(e) => {
            const u = [...value];
            u[i] = { ...pair, value: e.target.value };
            onChange(u);
          }}
          placeholder={valuePlaceholder}
          className={inputSmall + " flex-1"}
        />
        <button
          onClick={() => onChange(value.filter((_, j) => j !== i))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Minus size={14} />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { key: "", value: "" }])}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 text-[13px] text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
    >
      <Plus size={14} /> Add row
    </button>
  </div>
);

/* ─────────────────────────────── FieldMessages ───────────────────────────── */

export const FieldMessages: React.FC<{
  value: { role: string; content: string }[];
  onChange: (v: { role: string; content: string }[]) => void;
}> = ({ value, onChange }) => (
  <div className="space-y-2.5">
    {value.map((msg, i) => (
      <div
        key={i}
        className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2"
      >
        <div className="flex items-center gap-2">
          <select
            value={msg.role}
            onChange={(e) => {
              const u = [...value];
              u[i] = { ...msg, role: e.target.value };
              onChange(u);
            }}
            className="h-8 shrink-0 appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[13px] text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="system">System</option>
            <option value="user">User</option>
            <option value="assistant">Assistant</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Minus size={14} />
          </button>
        </div>
        <textarea
          value={msg.content}
          onChange={(e) => {
            const u = [...value];
            u[i] = { ...msg, content: e.target.value };
            onChange(u);
          }}
          placeholder="Message content..."
          className="min-h-[56px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] leading-5 text-slate-800 outline-none resize-none focus:border-blue-400 transition-colors placeholder:text-slate-400"
        />
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...value, { role: "user", content: "" }])}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 text-[13px] text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
    >
      <MessageSquarePlus size={14} /> Add message
    </button>
  </div>
);

/* ─────────────────────────────── FieldCode ───────────────────────────────── */

export const FieldCode: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  language?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 8 }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    spellCheck={false}
    rows={rows}
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-[12px] leading-5 text-emerald-400 outline-none resize-y font-mono placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
  />
);

/* ─────────────────────────────── FieldJson ───────────────────────────────── */

export const FieldJson: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 5 }) => {
  const isValid = React.useMemo(() => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, [value]);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[12px] leading-5 text-slate-800 outline-none resize-none font-mono transition-all placeholder:text-slate-400 ${
          isValid
            ? "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            : "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
        }`}
      />
      {!isValid && (
        <div className="mt-1 text-[11px] text-red-500">Invalid JSON</div>
      )}
    </div>
  );
};

/* ─────────────────────────────── FieldCredential ─────────────────────────── */

export const FieldCredential: React.FC<{
  value: string;
  onChange: (v: string) => void;
  credentials: { id: string; name: string; provider?: string }[];
  onCreateNew?: () => void;
}> = ({ value, onChange, credentials, onCreateNew }) => (
  <div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} appearance-none pl-10 pr-9 cursor-pointer`}
      >
        <option value="">Select a credential</option>
        {credentials.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
            {c.provider ? ` (${c.provider})` : ""}
          </option>
        ))}
      </select>
      <KeyRound
        size={14}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
    {onCreateNew && (
      <button
        type="button"
        onClick={onCreateNew}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 px-3 py-1.5 text-[12px] text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
      >
        <Plus size={13} />
        Create new credential
      </button>
    )}
  </div>
);

/* ─────────────────────────────── FieldModelSelect ────────────────────────── */

export const FieldModelSelect: React.FC<{
  models: { value: string; label: string; desc: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ models, value, onChange }) => (
  <div className="space-y-1.5">
    {models.map((m) => (
      <button
        key={m.value}
        type="button"
        onClick={() => onChange(m.value)}
        className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
          value === m.value
            ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            value === m.value
              ? "border-blue-500 bg-blue-500"
              : "border-slate-300 bg-white"
          }`}
        >
          {value === m.value && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-slate-800">
            {m.label}
          </div>
          <div className="text-[11px] text-slate-400">{m.desc}</div>
        </div>
      </button>
    ))}
  </div>
);

/* ─────────────────────────────── Section ─────────────────────────────────── */

export const Section: React.FC<{
  title: string;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  badge?: string | number;
  children: React.ReactNode;
}> = ({ title, icon: SectionIcon, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/30 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left group hover:bg-slate-50 transition-colors"
      >
        <div
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <ChevronRight size={14} className="text-slate-400" />
        </div>
        {SectionIcon && (
          <SectionIcon size={14} className="text-slate-400 shrink-0" />
        )}
        <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors flex-1">
          {title}
        </span>
        {badge != null && (
          <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-4">{children}</div>
      )}
    </div>
  );
};

/* ─────────────────────────────── helpers ─────────────────────────────────── */

export const normalizeKeyValuePairs = (
  value: unknown,
): { key: string; value: string }[] => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object") {
        const pair = item as { key?: unknown; value?: unknown };
        return {
          key: String(pair.key ?? ""),
          value: String(pair.value ?? ""),
        };
      }
      return { key: "", value: String(item ?? "") };
    });
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(
      ([entryKey, entryValue]) => ({
        key: entryKey,
        value: String(entryValue ?? ""),
      }),
    );
  }
  return [];
};

export const normalizeMessages = (
  value: unknown,
): { role: string; content: string }[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (item && typeof item === "object") {
      const message = item as { role?: unknown; content?: unknown };
      return {
        role: String(message.role ?? "user"),
        content: String(message.content ?? ""),
      };
    }
    return { role: "user", content: String(item ?? "") };
  });
};

export const prettyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (v) => v.toUpperCase());
