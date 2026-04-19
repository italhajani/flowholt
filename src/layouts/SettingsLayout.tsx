import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Palette, Bell, Key, Building2, Sliders, Users, Zap, Globe, CreditCard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  items: { to: string; label: string; icon: React.ElementType }[];
}

const userSections: NavSection[] = [
  {
    title: "Account",
    items: [
      { to: "/settings/profile", label: "Profile", icon: User },
      { to: "/settings/preferences", label: "Preferences", icon: Palette },
      { to: "/settings/notifications", label: "Notifications", icon: Bell },
      { to: "/settings/api-access", label: "API Access", icon: Key },
    ],
  },
];

const workspaceSections: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { to: "/settings/workspace/general", label: "General", icon: Building2 },
      { to: "/settings/workspace/members", label: "Members", icon: Users },
      { to: "/settings/workspace/runtime", label: "Runtime Defaults", icon: Sliders },
      { to: "/settings/workspace/integrations", label: "Integrations", icon: Zap },
      { to: "/settings/workspace/domains", label: "Domains", icon: Globe },
      { to: "/settings/workspace/security", label: "Security", icon: Shield },
      { to: "/settings/workspace/billing", label: "Billing", icon: CreditCard },
    ],
  },
];

const allSections = [...userSections, ...workspaceSections];

export function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-[960px] px-8 py-8">
      {/* Back header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors mb-5"
      >
        <ArrowLeft size={13} />
        Back
      </button>

      <h1 className="text-[20px] font-semibold text-zinc-900 mb-6">Settings</h1>

      <div className="flex gap-8">
        {/* Left navigation */}
        <nav className="w-48 flex-shrink-0">
          {allSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 px-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors duration-100",
                        isActive
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                      )
                    }
                  >
                    <item.icon size={14} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
