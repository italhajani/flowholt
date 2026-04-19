import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { TopBar } from "@/components/shell/TopBar";
import { GlobalBanners } from "@/components/ui/global-banners";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";

/**
 * Primary shell — n8n/Make-style 2-column grid.
 *
 *  grid-template-areas:
 *    'sidebar header'
 *    'sidebar content'
 *
 *  Single sidebar (68px) spans full height.
 *  TopBar sits above the content column only.
 */
export function AppShellLayout() {
  useGlobalShortcuts();

  return (
    <div
      className="h-full w-full"
      style={{
        display: "grid",
        gridTemplateAreas: `"sidebar header" "sidebar content"`,
        gridTemplateColumns: "var(--sidebar-width) 1fr",
        gridTemplateRows: "var(--header-height) 1fr",
      }}
    >
      {/* Single unified sidebar — spans both rows */}
      <aside style={{ gridArea: "sidebar" }} className="flex flex-col overflow-hidden">
        <AppSidebar />
      </aside>

      {/* Top bar — content column only */}
      <header
        style={{
          gridArea: "header",
          borderBottom: "1px solid var(--color-border-default)",
          background: "var(--color-bg-page)",
        }}
        className="flex items-center px-4"
      >
        <TopBar />
      </header>

      {/* Main content */}
      <main style={{ gridArea: "content", background: "var(--color-bg-page)" }} className="flex flex-col overflow-y-auto">
        <GlobalBanners />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
