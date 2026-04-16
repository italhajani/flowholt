import React, { useMemo } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export interface StudioCommandAction {
  id: string;
  group: string;
  label: string;
  description?: string;
  keywords?: string[];
  shortcut?: string;
  icon?: React.ElementType;
  onSelect: () => void;
}

interface StudioCommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: StudioCommandAction[];
}

const StudioCommandBar: React.FC<StudioCommandBarProps> = ({ open, onOpenChange, actions }) => {
  const groupedActions = useMemo(() => {
    const groups = new Map<string, StudioCommandAction[]>();
    actions.forEach((action) => {
      const existing = groups.get(action.group) ?? [];
      existing.push(action);
      groups.set(action.group, existing);
    });
    return Array.from(groups.entries());
  }, [actions]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search actions, nodes, and navigation..." />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        {groupedActions.map(([group, groupActions], index) => (
          <React.Fragment key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {groupActions.map((action) => {
                const Icon = action.icon;
                return (
                  <CommandItem
                    key={action.id}
                    value={[action.label, action.description, ...(action.keywords ?? [])].filter(Boolean).join(" ")}
                    onSelect={() => {
                      onOpenChange(false);
                      action.onSelect();
                    }}
                    className="gap-3 rounded-lg px-3 py-3"
                  >
                    {Icon ? <Icon size={16} className="text-slate-500" /> : <span className="h-4 w-4" />}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-slate-800">{action.label}</div>
                      {action.description && (
                        <div className="truncate text-[11px] text-slate-500">{action.description}</div>
                      )}
                    </div>
                    {action.shortcut && <CommandShortcut>{action.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default StudioCommandBar;