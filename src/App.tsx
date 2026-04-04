import { Suspense, lazy, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardRouteLoader from "@/components/dashboard/DashboardRouteLoader";
import StudioRouteLoader from "@/components/studio/StudioRouteLoader";
import NotFound from "./pages/NotFound.tsx";

const WorkflowsPage = lazy(() => import("@/pages/dashboard/WorkflowsPage"));
const OverviewPage = lazy(() => import("@/pages/dashboard/OverviewPage"));
const TemplatesPage = lazy(() => import("@/pages/dashboard/TemplatesPage"));
const ExecutionsPage = lazy(() => import("@/pages/dashboard/ExecutionsPage"));
const IntegrationsPage = lazy(() => import("@/pages/dashboard/IntegrationsPage"));
const ApiPlaygroundPage = lazy(() => import("@/pages/dashboard/ApiPlaygroundPage"));
const CredentialsPage = lazy(() => import("@/pages/dashboard/CredentialsPageLive"));
const HelpCenterPage = lazy(() => import("@/pages/dashboard/HelpCenterPage"));
const SettingsPage = lazy(() => import("@/pages/dashboard/SettingsPage"));
const WorkflowStudio = lazy(() => import("@/components/studio/WorkflowStudio"));

const queryClient = new QueryClient();

const lazyDashboardPage = (pathname: string, element: ReactNode) => (
  <Suspense fallback={<DashboardRouteLoader pathname={pathname} />}>{element}</Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/workflows" replace />} />
            <Route path="workflows" element={lazyDashboardPage("/dashboard/workflows", <WorkflowsPage />)} />
            <Route path="overview" element={lazyDashboardPage("/dashboard/overview", <OverviewPage />)} />
            <Route path="templates" element={lazyDashboardPage("/dashboard/templates", <TemplatesPage />)} />
            <Route path="executions" element={lazyDashboardPage("/dashboard/executions", <ExecutionsPage />)} />
            <Route path="integrations" element={lazyDashboardPage("/dashboard/integrations", <IntegrationsPage />)} />
            <Route path="credentials" element={lazyDashboardPage("/dashboard/credentials", <CredentialsPage />)} />
            <Route path="connections" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="variables" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="settings" element={lazyDashboardPage("/dashboard/settings", <SettingsPage />)} />
            <Route path="help" element={lazyDashboardPage("/dashboard/help", <HelpCenterPage />)} />
            <Route path="api" element={lazyDashboardPage("/dashboard/api", <ApiPlaygroundPage />)} />
          </Route>

          {/* Studio Editor */}
          <Route
            path="/studio/:id"
            element={
              <Suspense fallback={<StudioRouteLoader />}>
                <WorkflowStudio />
              </Suspense>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard/workflows" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
