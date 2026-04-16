import { Suspense, lazy, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardRouteLoader from "@/components/dashboard/DashboardRouteLoader";
import StudioRouteLoader from "@/components/studio/StudioRouteLoader";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const AuthPage = lazy(() => import("@/pages/AuthPage"));
const PublicChatPage = lazy(() => import("@/pages/PublicChatPage"));

const WorkflowsPage = lazy(() => import("@/pages/dashboard/WorkflowsPage"));
const OverviewPage = lazy(() => import("@/pages/dashboard/OverviewPage"));
const TemplatesPage = lazy(() => import("@/pages/dashboard/TemplatesPage"));
const ExecutionsPage = lazy(() => import("@/pages/dashboard/ExecutionsPage"));
const IntegrationsPage = lazy(() => import("@/pages/dashboard/IntegrationsPage"));
const ApiPlaygroundPage = lazy(() => import("@/pages/dashboard/ApiPlaygroundPage"));
const CredentialsPage = lazy(() => import("@/pages/dashboard/CredentialsPageLive"));
const HelpCenterPage = lazy(() => import("@/pages/dashboard/HelpCenterPage"));
const SettingsPage = lazy(() => import("@/pages/dashboard/SettingsPage"));
const SystemStatusPage = lazy(() => import("@/pages/dashboard/SystemStatusPage"));
const ProvidersPage = lazy(() => import("@/pages/dashboard/ProvidersPage"));
const WebhooksPage = lazy(() => import("@/pages/dashboard/WebhooksPage"));
const AuditLogPage = lazy(() => import("@/pages/dashboard/AuditLogPage"));
const ExecutionDetailPage = lazy(() => import("@/pages/dashboard/ExecutionDetailPage"));
const EnvironmentPage = lazy(() => import("@/pages/dashboard/EnvironmentPage"));
const ChatPage = lazy(() => import("@/pages/dashboard/ChatPage"));
const AIAgentsPage = lazy(() => import("@/pages/dashboard/AIAgentsPage"));
const AIAgentDetailPage = lazy(() => import("@/pages/dashboard/AIAgentDetailPage"));
const WorkflowStudio = lazy(() => import("@/components/studio/WorkflowStudio"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const lazyDashboardPage = (pathname: string, element: ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<DashboardRouteLoader pathname={pathname} />}>{element}</Suspense>
  </ErrorBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth page */}
            <Route
              path="/"
              element={
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
                  <AuthPage />
                </Suspense>
              }
            />

            <Route
              path="/chat/:workspaceId/:workflowId"
              element={
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-foreground"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>}>
                  <PublicChatPage />
                </Suspense>
              }
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<ErrorBoundary fallbackTitle="Dashboard error"><DashboardLayout /></ErrorBoundary>}>
                <Route index element={<Navigate to="/dashboard/workflows" replace />} />
            <Route path="workflows" element={lazyDashboardPage("/dashboard/workflows", <WorkflowsPage />)} />
            <Route path="overview" element={lazyDashboardPage("/dashboard/overview", <OverviewPage />)} />
            <Route path="templates" element={lazyDashboardPage("/dashboard/templates", <TemplatesPage />)} />
            <Route path="executions" element={lazyDashboardPage("/dashboard/executions", <ExecutionsPage />)} />
            <Route path="integrations" element={lazyDashboardPage("/dashboard/integrations", <IntegrationsPage />)} />
            <Route path="credentials" element={lazyDashboardPage("/dashboard/credentials", <CredentialsPage />)} />
            <Route path="vault" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="connections" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="variables" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="settings" element={lazyDashboardPage("/dashboard/settings", <SettingsPage />)} />
            <Route path="system" element={lazyDashboardPage("/dashboard/system", <SystemStatusPage />)} />
            <Route path="providers" element={lazyDashboardPage("/dashboard/providers", <ProvidersPage />)} />
            <Route path="webhooks" element={lazyDashboardPage("/dashboard/webhooks", <WebhooksPage />)} />
            <Route path="audit" element={lazyDashboardPage("/dashboard/audit", <AuditLogPage />)} />
            <Route path="executions/:executionId" element={lazyDashboardPage("/dashboard/executions", <ExecutionDetailPage />)} />
            <Route path="environment" element={lazyDashboardPage("/dashboard/environment", <EnvironmentPage />)} />
            <Route path="help" element={lazyDashboardPage("/dashboard/help", <HelpCenterPage />)} />
            <Route path="api" element={lazyDashboardPage("/dashboard/api", <ApiPlaygroundPage />)} />
            <Route path="chat" element={lazyDashboardPage("/dashboard/chat", <ChatPage />)} />
            <Route path="ai-agents" element={lazyDashboardPage("/dashboard/ai-agents", <AIAgentsPage />)} />
            <Route path="ai-agents/:workflowId/:nodeId" element={lazyDashboardPage("/dashboard/ai-agents", <AIAgentDetailPage />)} />
          </Route>

          {/* Studio Editor */}
          <Route
            path="/studio/:id"
            element={
              <ErrorBoundary fallbackTitle="Studio editor error">
                <Suspense fallback={<StudioRouteLoader />}>
                  <WorkflowStudio />
                </Suspense>
              </ErrorBoundary>
            }
          />
            </Route>{/* end ProtectedRoute */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
