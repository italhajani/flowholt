import { useState, useRef } from "react";
import {
  ChevronRight, Home, MoreHorizontal, Copy, Check, Pencil,
  Folder, Globe, Users, Layers, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: "home" | "workspace" | "team" | "folder" | "workflow" | "page";
  editable?: boolean;
}

interface ContextBreadcrumbsProps {
  items: BreadcrumbItem[];
  maxVisible?: number;
  onNavigate?: (href: string) => void;
  onRename?: (id: string, newName: string) => void;
  className?: string;
}

const iconMap = {
  home: Home,
  workspace: Globe,
  team: Users,
  folder: Folder,
  workflow: Layers,
  page: FileText,
};

/* ── Demo data for standalone rendering ── */
const demoBreadcrumbs: BreadcrumbItem[] = [
  { id: "home", label: "Home", href: "/home", icon: "home" },
  { id: "ws", label: "Acme Corp", href: "/workspace/acme", icon: "workspace" },
  { id: "team", label: "Marketing Ops", href: "/teams/marketing", icon: "team" },
  { id: "folder", label: "Lead Gen", href: "/folders/lead-gen", icon: "folder" },
  { id: "wf", label: "Lead Scoring Pipeline", icon: "workflow", editable: true },
];

export function ContextBreadcrumbs({
  items = demoBreadcrumbs,
  maxVisible = 4,
  onNavigate,
  onRename,
  className,
}: ContextBreadcrumbsProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showCollapsed, setShowCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldCollapse = items.length > maxVisible;
  const visibleItems = shouldCollapse
    ? [items[0], ...items.slice(-(maxVisible - 1))]
    : items;
  const collapsedItems = shouldCollapse ? items.slice(1, -(maxVisible - 1)) : [];

  const fullPath = items.map(i => i.label).join(" / ");

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = (item: BreadcrumbItem) => {
    if (!item.editable) return;
    setEditing(item.id);
    setEditValue(item.label);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitEdit = () => {
    if (editing && editValue.trim()) {
      onRename?.(editing, editValue.trim());
    }
    setEditing(null);
  };

  return (
    <nav className={cn("flex items-center gap-0.5", className)}>
      {visibleItems.map((item, idx) => {
        const isLast = idx === visibleItems.length - 1;
        const Icon = item.icon ? iconMap[item.icon] : undefined;
        const showCollapsedDots = shouldCollapse && idx === 0;

        return (
          <div key={item.id} className="flex items-center gap-0.5">
            {/* Breadcrumb item */}
            {editing === item.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="rounded-md border border-blue-300 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[60px]"
              />
            ) : (
              <button
                onClick={() => {
                  if (isLast && item.editable) {
                    startEditing(item);
                  } else if (item.href) {
                    onNavigate?.(item.href);
                  }
                }}
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors group",
                  isLast
                    ? "text-zinc-800 font-medium"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                )}
              >
                {Icon && <Icon size={10} className={isLast ? "text-zinc-500" : "text-zinc-300 group-hover:text-zinc-500"} />}
                <span className={cn("text-[11px] max-w-[120px] truncate", isLast && "max-w-[200px]")}>
                  {item.label}
                </span>
                {isLast && item.editable && (
                  <Pencil size={8} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            )}

            {/* Collapsed items indicator */}
            {showCollapsedDots && (
              <>
                <ChevronRight size={10} className="text-zinc-300 flex-shrink-0" />
                <div className="relative">
                  <button
                    onClick={() => setShowCollapsed(!showCollapsed)}
                    className="flex items-center rounded-md px-1.5 py-0.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                    title={`${collapsedItems.length} items hidden`}
                  >
                    <MoreHorizontal size={12} />
                  </button>
                  {showCollapsed && (
                    <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-zinc-200 bg-white shadow-lg py-1 min-w-[160px]">
                      {collapsedItems.map(ci => {
                        const CIcon = ci.icon ? iconMap[ci.icon] : undefined;
                        return (
                          <button
                            key={ci.id}
                            onClick={() => {
                              setShowCollapsed(false);
                              if (ci.href) onNavigate?.(ci.href);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                          >
                            {CIcon && <CIcon size={10} className="text-zinc-400" />}
                            {ci.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Separator */}
            {!isLast && !(showCollapsedDots && idx === 0) && (
              <ChevronRight size={10} className="text-zinc-300 flex-shrink-0" />
            )}
            {showCollapsedDots && idx === 0 && (
              <ChevronRight size={10} className="text-zinc-300 flex-shrink-0" />
            )}
          </div>
        );
      })}

      {/* Copy path button */}
      <button
        onClick={handleCopy}
        className="ml-1 rounded-md p-1 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-all"
        title="Copy full path"
      >
        {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
      </button>
    </nav>
  );
}
