import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShellLayout } from "@/layouts/AppShellLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SettingsLayout } from "@/layouts/SettingsLayout";
import { HomePage } from "@/pages/HomePage";
import { WorkflowsPage } from "@/pages/WorkflowsPage";
import { AIAgentsPage } from "@/pages/AIAgentsPage";
import { TemplatesPage } from "@/pages/TemplatesPage";
import { ExecutionsPage } from "@/pages/ExecutionsPage";
import { VaultPage } from "@/pages/VaultPage";
import { WebhooksPage } from "@/pages/WebhooksPage";
import { DataPage } from "@/pages/DataPage";
import { ProvidersPage } from "@/pages/ProvidersPage";
import { OperationsPage } from "@/pages/OperationsPage";
import { EnvironmentPage } from "@/pages/EnvironmentPage";
import { HelpPage } from "@/pages/HelpPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ProfileSettings } from "@/pages/settings/ProfileSettings";
import { PreferencesSettings } from "@/pages/settings/PreferencesSettings";
import { NotificationSettings } from "@/pages/settings/NotificationSettings";
import { ApiAccessSettings } from "@/pages/settings/ApiAccessSettings";
import { WorkspaceGeneralSettings } from "@/pages/settings/WorkspaceGeneralSettings";
import { MembersSettings } from "@/pages/settings/MembersSettings";
import { RuntimeSettings } from "@/pages/settings/RuntimeSettings";
import { IntegrationsSettings } from "@/pages/settings/IntegrationsSettings";
import { DomainsSettings } from "@/pages/settings/DomainsSettings";
import { SecuritySettings } from "@/pages/settings/SecuritySettings";
import { SourceControlSettings } from "@/pages/settings/SourceControlSettings";
import { CommunityNodesSettings } from "@/pages/settings/CommunityNodesSettings";
import { BillingSettings } from "@/pages/settings/BillingSettings";
import { WorkflowDetailPage } from "@/pages/detail/WorkflowDetailPage";
import { CredentialDetailPage } from "@/pages/detail/CredentialDetailPage";
import { ConnectionDetailPage } from "@/pages/detail/ConnectionDetailPage";
import { AgentDetailPage } from "@/pages/detail/AgentDetailPage";
import { ProviderDetailPage } from "@/pages/detail/ProviderDetailPage";
import { TemplateDetailPage } from "@/pages/detail/TemplateDetailPage";
import { ExecutionDetailPage } from "@/pages/detail/ExecutionDetailPage";
import { WebhookDetailPage } from "@/pages/detail/WebhookDetailPage";
import { HumanTasksPage } from "@/pages/HumanTasksPage";
import { ApiPlaygroundPage } from "@/pages/ApiPlaygroundPage";
import { ChatHubPage } from "@/pages/ChatHubPage";
import { StudioLayout } from "@/layouts/StudioLayout";
import { PublicChatPage } from "@/pages/public/PublicChatPage";
import { PublicFormPage } from "@/pages/public/PublicFormPage";
import { ModelDirectoryPage } from "@/pages/ModelDirectoryPage";
import { EvaluationsPage } from "@/pages/EvaluationsPage";
import { CommunityNodesMarketplace } from "@/pages/CommunityNodesMarketplace";
import { WorkflowVersionsPage } from "@/pages/WorkflowVersionsPage";
import { EnvironmentVariablesPage } from "@/pages/EnvironmentVariablesPage";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { WorkflowAnalyticsPage } from "@/pages/WorkflowAnalyticsPage";
import { SourceControlPanel } from "@/pages/SourceControlPanel";
import { ExecutionTimelinePage } from "@/pages/ExecutionTimelinePage";
import { LogStreamingPanel } from "@/pages/LogStreamingPanel";
import { InviteAcceptPage } from "@/pages/InviteAcceptPage";
import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function App() {
  return (
    <ThemeProvider>
    <ErrorBoundary scope="Application Root">
    <HashRouter>
      <ToastProvider>
        <ConfirmProvider>
          <CommandPalette />
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/invite/:token" element={<InviteAcceptPage />} />
            </Route>

            {/* Onboarding */}
            <Route path="/onboarding" element={<OnboardingWizard onComplete={() => window.location.hash = "#/home"} />} />

            {/* Studio — full-screen layout, no shell */}
            <Route path="/studio/:workflowId" element={<StudioLayout />} />

            {/* Public trigger layouts — no shell, standalone */}
            <Route path="/public/chat/:id" element={<PublicChatPage />} />
            <Route path="/public/form/:id" element={<PublicFormPage />} />

            {/* Main app shell — all signed-in routes */}
            <Route element={<AppShellLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
              <Route path="/workflows/:id/versions" element={<WorkflowVersionsPage />} />
              <Route path="/ai-agents" element={<AIAgentsPage />} />
              <Route path="/ai-agents/:id" element={<AgentDetailPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/executions" element={<ExecutionsPage />} />
              <Route path="/executions/:id" element={<ExecutionDetailPage />} />
              <Route path="/vault/credentials/:id" element={<CredentialDetailPage />} />
              <Route path="/vault/connections/:id" element={<ConnectionDetailPage />} />
              <Route path="/vault/environment-variables" element={<EnvironmentVariablesPage />} />
              <Route path="/vault/*" element={<VaultPage />} />
              <Route path="/webhooks" element={<WebhooksPage />} />
              <Route path="/webhooks/:id" element={<WebhookDetailPage />} />
              <Route path="/data/*" element={<DataPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/providers/:id" element={<ProviderDetailPage />} />
              <Route path="/models" element={<ModelDirectoryPage />} />
              <Route path="/operations/*" element={<OperationsPage />} />
              <Route path="/environment/*" element={<EnvironmentPage />} />
              <Route path="/help/api" element={<ApiPlaygroundPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/human-tasks" element={<HumanTasksPage />} />
              <Route path="/chat" element={<ChatHubPage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/community-nodes" element={<CommunityNodesMarketplace />} />
              <Route path="/workflows/:id/analytics" element={<WorkflowAnalyticsPage />} />
              <Route path="/source-control" element={<SourceControlPanel />} />
              <Route path="/executions/:id/timeline" element={<ExecutionTimelinePage />} />
              <Route path="/logs" element={<LogStreamingPanel />} />

              {/* Settings with nested layout */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/profile" replace />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="preferences" element={<PreferencesSettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="api-access" element={<ApiAccessSettings />} />
                <Route path="workspace/general" element={<WorkspaceGeneralSettings />} />
                <Route path="workspace/members" element={<MembersSettings />} />
                <Route path="workspace/runtime" element={<RuntimeSettings />} />
                <Route path="workspace/integrations" element={<IntegrationsSettings />} />
                <Route path="workspace/domains" element={<DomainsSettings />} />
                <Route path="workspace/security" element={<SecuritySettings />} />
                <Route path="workspace/source-control" element={<SourceControlSettings />} />
                <Route path="workspace/community-nodes" element={<CommunityNodesSettings />} />
                <Route path="workspace/billing" element={<BillingSettings />} />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </HashRouter>
    </ErrorBoundary>
    </ThemeProvider>
  );
}

