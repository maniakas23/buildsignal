import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ─── Layout ───
import { Layout } from "./components/ui-custom/Layout";

// ─── Pages (eager) ───
import Home from "./pages/Home";
import PricingPage from "./pages/PricingPage";
import SecurityPage from "./pages/SecurityPage";
import SignupPage from "./pages/SignupPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";

// ─── Lazy Pages ───
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapPage = lazy(() => import("./pages/MapPage"));
const CountyPage = lazy(() => import("./pages/CountyPage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const BriefsPage = lazy(() => import("./pages/BriefsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const LaunchReadinessPage = lazy(() => import("./pages/LaunchReadinessPage"));
const RCValidationPage = lazy(() => import("./pages/RCValidationPage"));
const GoNoGoPage = lazy(() => import("./pages/GoNoGoPage"));
const ValidationScorecardPage = lazy(() => import("./pages/ValidationScorecardPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ExportsPage = lazy(() => import("./pages/ExportsPage"));
const WebhooksPage = lazy(() => import("./pages/WebhooksPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));

// ─── Enterprise Pages ───
const EnterprisePage = lazy(() => import("./pages/EnterprisePage"));
const TeamManagementPage = lazy(() => import("./pages/TeamManagementPage"));
const SSOConfigPage = lazy(() => import("./pages/SSOConfigPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));

// ─── Auth Pages ───
const LoginPage = lazy(() => import("./pages/LoginPage"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "BuildSignal — Commercial Intelligence Platform";
  }, []);

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/help" element={<HelpPage />} />

          {/* Authenticated */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/county/:id" element={<CountyPage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/briefs" element={<BriefsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Sprint 4 */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/exports" element={<ExportsPage />} />
          <Route path="/webhooks" element={<WebhooksPage />} />
          <Route path="/alerts" element={<AlertsPage />} />

          {/* Launch Readiness */}
          <Route path="/launch-readiness" element={<LaunchReadinessPage />} />
          <Route path="/rc-validation" element={<RCValidationPage />} />
          <Route path="/go-no-go" element={<GoNoGoPage />} />
          <Route path="/validation-scorecard" element={<ValidationScorecardPage />} />

          {/* Enterprise */}
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/team" element={<TeamManagementPage />} />
          <Route path="/sso" element={<SSOConfigPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
