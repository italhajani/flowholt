import React, { useState } from "react";
import {
  Home,
  GitBranch,
  KeyRound,
  Database,
  BarChart3,
  MessageSquare,
  Link2,
  ScrollText,
  Rocket,
  FlaskConical,
  BriefcaseBusiness,
  FileBarChart,
  Code2,
  Settings,
} from "lucide-react";

interface IconSidebarProps {}

const mainItems = [
  { icon: Home, label: "Home" },
  { icon: GitBranch, label: "Workflows" },
  { icon: MessageSquare, label: "Prompts" },
  { icon: Database, label: "Data" },
  { icon: Link2, label: "Connections" },
  { icon: KeyRound, label: "Credentials" },
  { icon: ScrollText, label: "Logs" },
  { icon: Rocket, label: "Deployments" },
  { icon: FlaskConical, label: "Tests" },
  { icon: BriefcaseBusiness, label: "Jobs" },
];

const bottomItems = [
  { icon: FileBarChart, label: "Reports" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Code2, label: "API Playground" },
  { icon: Settings, label: "Settings" },
];

const IconSidebar: React.FC<IconSidebarProps> = () => {
  const [hovered, setHovered] = useState(false);
  const [activeItem, setActiveItem] = useState("Workflows");

  return (
    <div
      className={`bg-studio-sidebar flex flex-col shrink-0 transition-all duration-300 ease-out border-r border-studio-divider/20 ${
        hovered ? "w-48" : "w-11"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main nav */}
      <div className="flex-1 flex flex-col py-2 gap-0.5 overflow-hidden">

        {mainItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg text-xs transition-all duration-200 ${
              activeItem === item.label
                ? "bg-studio-surface text-studio-text-primary font-medium"
                : "text-studio-text-secondary hover:bg-studio-surface-hover hover:text-studio-text-primary"
            }`}
          >
            <item.icon size={16} className="shrink-0" />
            {hovered && <span className="truncate whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col py-2 gap-0.5 border-t border-studio-divider/15">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`flex items-center gap-2.5 px-3 py-2 mx-1 rounded-lg text-xs transition-all duration-200 ${
              activeItem === item.label
                ? "bg-studio-surface text-studio-text-primary font-medium"
                : "text-studio-text-secondary hover:bg-studio-surface-hover hover:text-studio-text-primary"
            }`}
          >
            <item.icon size={16} className="shrink-0" />
            {hovered && <span className="truncate whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconSidebar;
