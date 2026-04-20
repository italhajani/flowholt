import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShellLayout } from "@/layouts/AppShellLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SettingsLayout } from "@/layouts/SettingsLayout";
import { StudioLayout } from "@/layouts/StudioLayout";
import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonPage } from "@/components/ui/skeleton";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const WorkflowsPage = lazy(() => import("@/pages/WorkflowsPage").then(m => ({ default: m.WorkflowsPage })));
const AIAgentsPage = lazy(() => import("@/pages/AIAgentsPage").then(m => ({ default: m.AIAgentsPage })));
const TemplatesPage = lazy(() => import("@/pages/TemplatesPage").then(m => ({ default: m.TemplatesPage })));
const ExecutionsPage = lazy(() => import("@/pages/ExecutionsPage").then(m => ({ default: m.ExecutionsPage })));
const VaultPage = lazy(() => import("@/pages/VaultPage").then(m => ({ default: m.VaultPage })));
const WebhooksPage = lazy(() => import("@/pages/WebhooksPage").then(m => ({ default: m.WebhooksPage })));
const DataPage = lazy(() => import("@/pages/DataPage").then(m => ({ default: m.DataPage })));
const ProvidersPage = lazy(() => import("@/pages/ProvidersPage").then(m => ({ default: m.ProvidersPage })));
const OperationsPage = lazy(() => import("@/pages/OperationsPage").then(m => ({ default: m.OperationsPage })));
const EnvironmentPage = lazy(() => import("@/pages/EnvironmentPage").then(m => ({ default: m.EnvironmentPage })));
const HelpPage = lazy(() => import("@/pages/HelpPage").then(m => ({ default: m.HelpPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("@/pages/SignupPage").then(m => ({ default: m.SignupPage })));
const HumanTasksPage = lazy(() => import("@/pages/HumanTasksPage").then(m => ({ default: m.HumanTasksPage })));
const ApiPlaygroundPage = lazy(() => import("@/pages/ApiPlaygroundPage").then(m => ({ default: m.ApiPlaygroundPage })));
const ChatHubPage = lazy(() => import("@/pages/ChatHubPage").then(m => ({ default: m.ChatHubPage })));
const ModelDirectoryPage = lazy(() => import("@/pages/ModelDirectoryPage").then(m => ({ default: m.ModelDirectoryPage })));
const EvaluationsPage = lazy(() => import("@/pages/EvaluationsPage").then(m => ({ default: m.EvaluationsPage })));
const CommunityNodesMarketplace = lazy(() => import("@/pages/CommunityNodesMarketplace").then(m => ({ default: m.CommunityNodesMarketplace })));
const WorkflowVersionsPage = lazy(() => import("@/pages/WorkflowVersionsPage").then(m => ({ default: m.WorkflowVersionsPage })));
const EnvironmentVariablesPage = lazy(() => import("@/pages/EnvironmentVariablesPage").then(m => ({ default: m.EnvironmentVariablesPage })));
const WorkflowAnalyticsPage = lazy(() => import("@/pages/WorkflowAnalyticsPage").then(m => ({ default: m.WorkflowAnalyticsPage })));
const SourceControlPanel = lazy(() => import("@/pages/SourceControlPanel").then(m => ({ default: m.SourceControlPanel })));
const ExecutionTimelinePage = lazy(() => import("@/pages/ExecutionTimelinePage").then(m => ({ default: m.ExecutionTimelinePage })));
const LogStreamingPanel = lazy(() => import("@/pages/LogStreamingPanel").then(m => ({ default: m.LogStreamingPanel })));
const InviteAcceptPage = lazy(() => import("@/pages/InviteAcceptPage").then(m => ({ default: m.InviteAcceptPage })));
const OnboardingWizard = lazy(() => import("@/components/onboarding/OnboardingWizard").then(m => ({ default: m.OnboardingWizard })));
const PublicChatPage = lazy(() => import("@/pages/public/PublicChatPage").then(m => ({ default: m.PublicChatPage })));
const PublicFormPage = lazy(() => import("@/pages/public/PublicFormPage").then(m => ({ default: m.PublicFormPage })));

// Detail pages
const WorkflowDetailPage = lazy(() => import("@/pages/detail/WorkflowDetailPage").then(m => ({ default: m.WorkflowDetailPage })));
const CredentialDetailPage = lazy(() => import("@/pages/detail/CredentialDetailPage").then(m => ({ default: m.CredentialDetailPage })));
const ConnectionDetailPage = lazy(() => import("@/pages/detail/ConnectionDetailPage").then(m => ({ default: m.ConnectionDetailPage })));
const AgentDetailPage = lazy(() => import("@/pages/detail/AgentDetailPage").then(m => ({ default: m.AgentDetailPage })));
const ProviderDetailPage = lazy(() => import("@/pages/detail/ProviderDetailPage").then(m => ({ default: m.ProviderDetailPage })));
const TemplateDetailPage = lazy(() => import("@/pages/detail/TemplateDetailPage").then(m => ({ default: m.TemplateDetailPage })));
const ExecutionDetailPage = lazy(() => import("@/pages/detail/ExecutionDetailPage").then(m => ({ default: m.ExecutionDetailPage })));
const WebhookDetailPage = lazy(() => import("@/pages/detail/WebhookDetailPage").then(m => ({ default: m.WebhookDetailPage })));

// Settings pages
const ProfileSettings = lazy(() => import("@/pages/settings/ProfileSettings").then(m => ({ default: m.ProfileSettings })));
const PreferencesSettings = lazy(() => import("@/pages/settings/PreferencesSettings").then(m => ({ default: m.PreferencesSettings })));
const NotificationSettings = lazy(() => import("@/pages/settings/NotificationSettings").then(m => ({ default: m.NotificationSettings })));
const ApiAccessSettings = lazy(() => import("@/pages/settings/ApiAccessSettings").then(m => ({ default: m.ApiAccessSettings })));
const WorkspaceGeneralSettings = lazy(() => import("@/pages/settings/WorkspaceGeneralSettings").then(m => ({ default: m.WorkspaceGeneralSettings })));
const MembersSettings = lazy(() => import("@/pages/settings/MembersSettings").then(m => ({ default: m.MembersSettings })));
const RuntimeSettings = lazy(() => import("@/pages/settings/RuntimeSettings").then(m => ({ default: m.RuntimeSettings })));
const IntegrationsSettings = lazy(() => import("@/pages/settings/IntegrationsSettings").then(m => ({ default: m.IntegrationsSettings })));
const DomainsSettings = lazy(() => import("@/pages/settings/DomainsSettings").then(m => ({ default: m.DomainsSettings })));
const SecuritySettings = lazy(() => import("@/pages/settings/SecuritySettings").then(m => ({ default: m.SecuritySettings })));
const SourceControlSettings = lazy(() => import("@/pages/settings/SourceControlSettings").then(m => ({ default: m.SourceControlSettings })));
const CommunityNodesSettings = lazy(() => import("@/pages/settings/CommunityNodesSettings").then(m => ({ default: m.CommunityNodesSettings })));
const BillingSettings = lazy(() => import("@/pages/settings/BillingSettings").then(m => ({ default: m.BillingSettings })));

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SkeletonPage />}>{children}</Suspense>
);

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
              <Route path="/auth/login" element={<PageSuspense><LoginPage /></PageSuspense>} />
              <Route path="/auth/signup" element={<PageSuspense><SignupPage /></PageSuspense>} />
              <Route path="/auth/invite/:token" element={<PageSuspense><InviteAcceptPage /></PageSuspense>} />
            </Route>

            {/* Onboarding */}
            <Route path="/onboarding" element={<PageSuspense><OnboardingWizard onComplete={() => window.location.hash = "#/home"} /></PageSuspense>} />

            {/* Studio — full-screen layout, no shell */}
            <Route path="/studio/:workflowId" element={<StudioLayout />} />

            {/* Public trigger layouts — no shell, standalone */}
            <Route path="/public/chat/:id" element={<PageSuspense><PublicChatPage /></PageSuspense>} />
            <Route path="/public/form/:id" element={<PageSuspense><PublicFormPage /></PageSuspense>} />

            {/* Main app shell — all signed-in routes */}
            <Route element={<AppShellLayout />}>
              <Route path="/home" element={<PageSuspense><HomePage /></PageSuspense>} />
              <Route path="/workflows" element={<PageSuspense><WorkflowsPage /></PageSuspense>} />
              <Route path="/workflows/:id" element={<PageSuspense><WorkflowDetailPage /></PageSuspense>} />
              <Route path="/workflows/:id/versions" element={<PageSuspense><WorkflowVersionsPage /></PageSuspense>} />
              <Route path="/ai-agents" element={<PageSuspense><AIAgentsPage /></PageSuspense>} />
              <Route path="/ai-agents/:id" element={<PageSuspense><AgentDetailPage /></PageSuspense>} />
              <Route path="/templates" element={<PageSuspense><TemplatesPage /></PageSuspense>} />
              <Route path="/templates/:id" element={<PageSuspense><TemplateDetailPage /></PageSuspense>} />
              <Route path="/executions" element={<PageSuspense><ExecutionsPage /></PageSuspense>} />
              <Route path="/executions/:id" element={<PageSuspense><ExecutionDetailPage /></PageSuspense>} />
              <Route path="/vault/credentials/:id" element={<PageSuspense><CredentialDetailPage /></PageSuspense>} />
              <Route path="/vault/connections/:id" element={<PageSuspense><ConnectionDetailPage /></PageSuspense>} />
              <Route path="/vault/environment-variables" element={<PageSuspense><EnvironmentVariablesPage /></PageSuspense>} />
              <Route path="/vault/*" element={<PageSuspense><VaultPage /></PageSuspense>} />
              <Route path="/webhooks" element={<PageSuspense><WebhooksPage /></PageSuspense>} />
              <Route path="/webhooks/:id" element={<PageSuspense><WebhookDetailPage /></PageSuspense>} />
              <Route path="/data/*" element={<PageSuspense><DataPage /></PageSuspense>} />
              <Route path="/providers" element={<PageSuspense><ProvidersPage /></PageSuspense>} />
              <Route path="/providers/:id" element={<PageSuspense><ProviderDetailPage /></PageSuspense>} />
              <Route path="/models" element={<PageSuspense><ModelDirectoryPage /></PageSuspense>} />
              <Route path="/operations/*" element={<PageSuspense><OperationsPage /></PageSuspense>} />
              <Route path="/environment/*" element={<PageSuspense><EnvironmentPage /></PageSuspense>} />
              <Route path="/help/api" element={<PageSuspense><ApiPlaygroundPage /></PageSuspense>} />
              <Route path="/help" element={<PageSuspense><HelpPage /></PageSuspense>} />
              <Route path="/human-tasks" element={<PageSuspense><HumanTasksPage /></PageSuspense>} />
              <Route path="/chat" element={<PageSuspense><ChatHubPage /></PageSuspense>} />
              <Route path="/evaluations" element={<PageSuspense><EvaluationsPage /></PageSuspense>} />
              <Route path="/community-nodes" element={<PageSuspense><CommunityNodesMarketplace /></PageSuspense>} />
              <Route path="/workflows/:id/analytics" element={<PageSuspense><WorkflowAnalyticsPage /></PageSuspense>} />
              <Route path="/source-control" element={<PageSuspense><SourceControlPanel /></PageSuspense>} />
              <Route path="/executions/:id/timeline" element={<PageSuspense><ExecutionTimelinePage /></PageSuspense>} />
              <Route path="/logs" element={<PageSuspense><LogStreamingPanel /></PageSuspense>} />

              {/* Settings with nested layout */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="/settings/profile" replace />} />
                <Route path="profile" element={<PageSuspense><ProfileSettings /></PageSuspense>} />
                <Route path="preferences" element={<PageSuspense><PreferencesSettings /></PageSuspense>} />
                <Route path="notifications" element={<PageSuspense><NotificationSettings /></PageSuspense>} />
                <Route path="api-access" element={<PageSuspense><ApiAccessSettings /></PageSuspense>} />
                <Route path="workspace/general" element={<PageSuspense><WorkspaceGeneralSettings /></PageSuspense>} />
                <Route path="workspace/members" element={<PageSuspense><MembersSettings /></PageSuspense>} />
                <Route path="workspace/runtime" element={<PageSuspense><RuntimeSettings /></PageSuspense>} />
                <Route path="workspace/integrations" element={<PageSuspense><IntegrationsSettings /></PageSuspense>} />
                <Route path="workspace/domains" element={<PageSuspense><DomainsSettings /></PageSuspense>} />
                <Route path="workspace/security" element={<PageSuspense><SecuritySettings /></PageSuspense>} />
                <Route path="workspace/source-control" element={<PageSuspense><SourceControlSettings /></PageSuspense>} />
                <Route path="workspace/community-nodes" element={<PageSuspense><CommunityNodesSettings /></PageSuspense>} />
                <Route path="workspace/billing" element={<PageSuspense><BillingSettings /></PageSuspense>} />
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

