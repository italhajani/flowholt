import {
  Layers,
  List,
  GitBranch,
  KeyRound,
  History,
  StickyNote,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type LeftRailContext =
  | "nodes"
  | "outline"
  | "connections"
  | "assets"
  | "versions"
  | "notes"
  | "help";

const items: { id: LeftRailContext; icon: React.ElementType; label: string }[] = [
  { id: "nodes", icon: Layers, label: "Nodes" },
  { id: "outline", icon: List, label: "Outline" },
  { id: "connections", icon: GitBranch, label: "Connections" },
  { id: "assets", icon: KeyRound, label: "Assets" },
  { id: "versions", icon: History, label: "Versions" },
  { id: "notes", icon: StickyNote, label: "Notes" },
  { id: "help", icon: HelpCircle, label: "Help" },
];

interface Props {
  activeContext: LeftRailContext;
  onContextChange: (ctx: LeftRailContext) => void;
  paneOpen: boolean;
  onTogglePane: (ctx: LeftRailContext) => void;
}

export function StudioLeftRail({
  activeContext,
  onContextChange,
  paneOpen,
  onTogglePane,
}: Props) {
  return (
    <div className="flex w-14 flex-col items-center gap-1 border-r border-zinc-100 bg-white py-2">
      {items.map(({ id, icon: Icon, label }) => {
        const isActive = paneOpen && activeContext === id;
        return (
          <button
            key={id}
            title={label}
            onClick={() => onTogglePane(id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
