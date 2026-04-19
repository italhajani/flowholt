import { useState, useRef } from "react";
import {
  X, Plus, Tag, Palette, Trash2, Check, Pencil, Search,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface WorkspaceTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface TagManagerProps {
  open?: boolean;
  onClose?: () => void;
}

/* ── Color presets ── */
const colorPresets = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#78716c",
];

/* ── Demo tags ── */
const initialTags: WorkspaceTag[] = [
  { id: "t1", name: "production", color: "#ef4444", count: 12 },
  { id: "t2", name: "sales", color: "#3b82f6", count: 8 },
  { id: "t3", name: "marketing", color: "#8b5cf6", count: 5 },
  { id: "t4", name: "finance", color: "#22c55e", count: 3 },
  { id: "t5", name: "onboarding", color: "#f97316", count: 6 },
  { id: "t6", name: "monitoring", color: "#14b8a6", count: 9 },
  { id: "t7", name: "ai", color: "#6366f1", count: 4 },
  { id: "t8", name: "stripe", color: "#ec4899", count: 2 },
];

export function TagManager({ open = true, onClose }: TagManagerProps) {
  const [tags, setTags] = useState<WorkspaceTag[]>(initialTags);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(colorPresets[5]);
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const filtered = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (tag: WorkspaceTag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const commitEdit = () => {
    if (!editingId || !editName.trim()) return;
    setTags(prev => prev.map(t =>
      t.id === editingId ? { ...t, name: editName.trim(), color: editColor } : t
    ));
    setEditingId(null);
    setShowColorPicker(null);
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
  };

  const addTag = () => {
    if (!newTagName.trim()) return;
    const newTag: WorkspaceTag = {
      id: `t-${Date.now()}`,
      name: newTagName.trim().toLowerCase(),
      color: newTagColor,
      count: 0,
    };
    setTags(prev => [...prev, newTag]);
    setNewTagName("");
    setShowNewColorPicker(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] rounded-xl border bg-white shadow-lg overflow-hidden"
        style={{ borderColor: "var(--color-border-default)", animation: "tagModalIn 150ms ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-semibold text-zinc-800">Manage Tags</h3>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 font-medium">
              {tags.length}
            </span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-2.5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5">
            <Search size={13} className="text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter tags..."
              className="flex-1 bg-transparent text-[12px] text-zinc-700 placeholder:text-zinc-400 outline-none"
            />
          </div>
        </div>

        {/* Tag list */}
        <div className="max-h-[320px] overflow-y-auto divide-y" style={{ borderColor: "var(--color-border-default)" }}>
          {filtered.map(tag => (
            <div
              key={tag.id}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 group transition-colors",
                editingId === tag.id ? "bg-blue-50/50" : "hover:bg-zinc-50"
              )}
            >
              <GripVertical size={12} className="text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

              {editingId === tag.id ? (
                /* Edit mode */
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(showColorPicker === tag.id ? null : tag.id)}
                      className="h-5 w-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: editColor }}
                    />
                    {showColorPicker === tag.id && (
                      <div className="absolute top-full left-0 mt-1 z-10 rounded-lg bg-white border shadow-lg p-2 grid grid-cols-7 gap-1">
                        {colorPresets.map(c => (
                          <button
                            key={c}
                            onClick={() => { setEditColor(c); setShowColorPicker(null); }}
                            className={cn("h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                              editColor === c ? "border-zinc-800 scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 rounded-md border border-blue-300 bg-white px-2 py-0.5 text-[12px] text-zinc-700 outline-none focus:ring-1 focus:ring-blue-400"
                    autoFocus
                  />
                  <button onClick={commitEdit} className="rounded-md p-1 text-green-600 hover:bg-green-50 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Display mode */
                <>
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-[12px] font-medium text-zinc-700">{tag.name}</span>
                  <span className="text-[10px] text-zinc-400">{tag.count} workflows</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(tag)}
                      className="rounded p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-[12px] text-zinc-400">
              {search ? "No tags match your filter." : "No tags yet. Create one below."}
            </div>
          )}
        </div>

        {/* Create new tag */}
        <div className="flex items-center gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--color-border-default)" }}>
          <div className="relative">
            <button
              onClick={() => setShowNewColorPicker(!showNewColorPicker)}
              className="h-5 w-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: newTagColor }}
            />
            {showNewColorPicker && (
              <div className="absolute bottom-full left-0 mb-1 z-10 rounded-lg bg-white border shadow-lg p-2 grid grid-cols-7 gap-1">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    onClick={() => { setNewTagColor(c); setShowNewColorPicker(false); }}
                    className={cn("h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                      newTagColor === c ? "border-zinc-800 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
          <input
            ref={nameInputRef}
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTag(); }}
            placeholder="New tag name..."
            className="flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[12px] text-zinc-700 placeholder:text-zinc-400 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-colors"
          />
          <button
            onClick={addTag}
            disabled={!newTagName.trim()}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
              newTagName.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tagModalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ── Inline Tag Picker for workflows ── */
interface TagPickerProps {
  selectedTags?: string[];
  availableTags?: WorkspaceTag[];
  onChange?: (tags: string[]) => void;
  className?: string;
}

export function TagPicker({
  selectedTags = ["t1", "t3"],
  availableTags = initialTags,
  onChange,
  className,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = availableTags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (tagId: string) => {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onChange?.(next);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 transition-colors"
      >
        <Tag size={11} />
        <span>{selectedTags.length ? `${selectedTags.length} tags` : "Add tags"}</span>
      </button>

      {/* Selected tag pills */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedTags.map(id => {
            const tag = availableTags.find(t => t.id === id);
            if (!tag) return null;
            return (
              <span
                key={id}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(id); }}
                  className="hover:opacity-80"
                >
                  <X size={8} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-[200px] rounded-lg border bg-white shadow-lg overflow-hidden"
             style={{ borderColor: "var(--color-border-default)" }}>
          <div className="px-2 py-1.5 border-b" style={{ borderColor: "var(--color-border-default)" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tags..."
              className="w-full bg-transparent text-[11px] text-zinc-600 placeholder:text-zinc-400 outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-[160px] overflow-y-auto py-1">
            {filtered.map(tag => {
              const selected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggle(tag.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2.5 py-1.5 text-left text-[11px] transition-colors",
                    selected ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1">{tag.name}</span>
                  {selected && <Check size={11} className="text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
