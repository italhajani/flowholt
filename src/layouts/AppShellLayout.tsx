import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { TopBar } from "@/components/shell/TopBar";
import { GlobalBanners } from "@/components/ui/global-banners";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { Menu, X } from "lucide-react";

/**
 * Primary shell — n8n/Make-style 2-column grid.
 * On mobile (<768px) sidebar becomes an overlay toggled by a hamburger button.
 */
export function AppShellLayout() {
  useGlobalShortcuts();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Desktop: CSS grid layout */}
      <div
        className="h-full w-full max-md:hidden"
        style={{
          display: "grid",
          gridTemplateAreas: `"sidebar header" "sidebar content"`,
          gridTemplateColumns: "var(--sidebar-width) 1fr",
          gridTemplateRows: "var(--header-height) 1fr",
        }}
      >
        <aside style={{ gridArea: "sidebar" }} className="flex flex-col overflow-hidden">
          <AppSidebar />
        </aside>
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
        <main style={{ gridArea: "content", background: "var(--color-bg-page)" }} className="flex flex-col overflow-y-auto">
          <GlobalBanners />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile: stacked layout with overlay sidebar */}
      <div className="flex h-full w-full flex-col md:hidden">
        <header
          className="flex h-12 items-center gap-2 px-3 shrink-0"
          style={{
            borderBottom: "1px solid var(--color-border-default)",
            background: "var(--color-bg-page)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <TopBar />
        </header>

        {/* Overlay sidebar */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside
              className="fixed left-0 top-12 bottom-0 z-50 flex flex-col overflow-hidden animate-in slide-in-from-left-2 duration-200"
              style={{
                width: "var(--sidebar-width)",
                background: "var(--color-bg-surface)",
              }}
            >
              <AppSidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        <main style={{ background: "var(--color-bg-page)" }} className="flex flex-1 flex-col overflow-y-auto">
          <GlobalBanners />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
