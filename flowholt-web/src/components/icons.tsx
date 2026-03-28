import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function BaseIcon({ className = "h-4 w-4", children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function IconWorkflows(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="6" height="6" />
      <rect x="14" y="5" width="6" height="6" />
      <rect x="4" y="15" width="6" height="6" />
      <path d="M13 8h1" />
      <path d="M8 12v3" />
      <path d="M10 18h4" />
      <path d="M16 8v7" />
    </BaseIcon>
  );
}

export function IconStudio(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M8 4v16" />
      <path d="M3 9h5" />
      <path d="M11 9h7" />
      <path d="M11 13h7" />
      <path d="M11 17h5" />
    </BaseIcon>
  );
}

export function IconAgents(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 19c1.5-2.7 4-4 6-4s4.5 1.3 6 4" />
    </BaseIcon>
  );
}

export function IconRuns(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 7v5l3 2" />
      <path d="M21 3v6h-6" />
    </BaseIcon>
  );
}

export function IconIntegrations(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="m8 12 8-5" />
      <path d="m8 12 8 5" />
    </BaseIcon>
  );
}

export function IconData(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </BaseIcon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .3 2l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.3 1.8 1.8 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.8 1.8 0 0 0-1.1-1.6 1.8 1.8 0 0 0-2 .3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .3-2 1.8 1.8 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.8 1.8 0 0 0 1.6-1.1 1.8 1.8 0 0 0-.3-2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.8 1.8 0 0 0 2 .3H9.4A1.8 1.8 0 0 0 10.5 3V3a2 2 0 1 1 4 0v.2a1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.3 2v.1a1.8 1.8 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.8 1.8 0 0 0-1.4.6" />
    </BaseIcon>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4.1 2c-.9.8-1.6 1.2-1.6 2.5" />
      <path d="M12 17h.01" />
    </BaseIcon>
  );
}

export function IconPanelLeft(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M9 4v16" />
    </BaseIcon>
  );
}

export function IconPanelRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M15 4v16" />
    </BaseIcon>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </BaseIcon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function IconX(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </BaseIcon>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "h-4 w-4"}>
      <path d="M8 6v12l10-6z" />
    </svg>
  );
}

export function IconSave(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 4v5h8" />
      <path d="M8 20v-6h8v6" />
    </BaseIcon>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </BaseIcon>
  );
}

export function IconMessage(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-5 4v-4.5A2.5 2.5 0 0 1 4 13.5z" />
    </BaseIcon>
  );
}

export function IconTrigger(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 5 7v5c0 4 2.4 7 7 9 4.6-2 7-5 7-9V7z" />
      <path d="M12 8v6" />
      <path d="M9 11h6" />
    </BaseIcon>
  );
}

export function IconAgent(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19c1.7-2.7 3.9-4 6-4s4.3 1.3 6 4" />
    </BaseIcon>
  );
}

export function IconTool(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m14 7 3 3" />
      <path d="m12 9 6-6" />
      <path d="M5 21a2 2 0 0 1-1.4-3.4l7.4-7.4a4 4 0 0 0 5.6 5.6l-7.4 7.4A2 2 0 0 1 5 21Z" />
    </BaseIcon>
  );
}

export function IconCondition(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4 20 12 12 20 4 12z" />
      <path d="M12 9v3" />
      <path d="M12 15h.01" />
    </BaseIcon>
  );
}

export function IconMemory(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="5" width="14" height="14" />
      <path d="M9 9h6v6H9z" />
    </BaseIcon>
  );
}

export function IconRetriever(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4-4" />
    </BaseIcon>
  );
}

export function IconLoop(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 7h8a4 4 0 0 1 0 8H8" />
      <path d="m7 11-3 4 3 4" />
    </BaseIcon>
  );
}

export function IconOutput(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 12h8" />
      <path d="m13 7 5 5-5 5" />
      <path d="M6 5H4v14h2" />
    </BaseIcon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m5 12 4 4 10-10" />
    </BaseIcon>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </BaseIcon>
  );
}

export function IconClock(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 2" />
    </BaseIcon>
  );
}
export const appIconMap = {
  workflows: IconWorkflows,
  studio: IconStudio,
  agents: IconAgents,
  runs: IconRuns,
  integrations: IconIntegrations,
  data: IconData,
  settings: IconSettings,
  help: IconHelp,
};


