import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WorkflowsPage from "@/pages/dashboard/WorkflowsPage";
import OverviewPage from "@/pages/dashboard/OverviewPage";
import TemplatesPage from "@/pages/dashboard/TemplatesPage";
import ExecutionsPage from "@/pages/dashboard/ExecutionsPage";
import IntegrationsPage from "@/pages/dashboard/IntegrationsPage";
import ApiPlaygroundPage from "@/pages/dashboard/ApiPlaygroundPage";
import CredentialsPage from "@/pages/dashboard/CredentialsPage";
import HelpCenterPage from "@/pages/dashboard/HelpCenterPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import WorkflowStudio from "@/components/studio/WorkflowStudio";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

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
            <Route path="workflows" element={<WorkflowsPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="executions" element={<ExecutionsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="connections" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="variables" element={<Navigate to="/dashboard/credentials" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="api" element={<ApiPlaygroundPage />} />
          </Route>

          {/* Studio Editor */}
          <Route path="/studio/:id" element={<WorkflowStudio />} />

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
