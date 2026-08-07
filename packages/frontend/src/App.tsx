import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TrpcProvider } from "./providers/trpc";
import { queryClient } from "./lib/query";
import { Login } from "./pages/Login";
import { SignupPage } from "./pages/SignupPage";
import { WelcomePage } from "./pages/WelcomePage";
import { Dashboard } from "./pages/Dashboard";
import { BillingPage } from "./pages/BillingPage";
import { PricingPage } from "./pages/PricingPage";
import { AlertsPage } from "./pages/AlertsPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { OperationsCenterPage } from "./pages/OperationsCenterPage";
import { OpportunityDashboard } from "./pages/OpportunityDashboard";
import { CountyDetail } from "./pages/CountyDetail";
import { WatchlistPage } from "./pages/WatchlistPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SSOPage } from "./pages/SSOPage";
import { HelpPage } from "./pages/HelpPage";
import { ContactPage } from "./pages/ContactPage";
import { FeatureRequestPage } from "./pages/FeatureRequestPage";
import { ProductImprovementDashboard } from "./pages/ProductImprovementDashboard";
import { ReportsHubPage } from "./pages/ReportsHubPage";
import { DemoRequestPage } from "./pages/DemoRequestPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFound } from "./pages/NotFound";
import { AuthLayout } from "./components/AuthLayout";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrpcProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/feature-requests" element={<FeatureRequestPage />} />
          <Route path="/product-improvement" element={<ProductImprovementDashboard />} />
          <Route path="/reports-hub" element={<ReportsHubPage />} />
          <Route path="/demo" element={<DemoRequestPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/opportunities" element={<OpportunityDashboard />} />
            <Route path="/counties/:id" element={<CountyDetail />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/operations" element={<OperationsCenterPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sso" element={<SSOPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </TrpcProvider>
    </QueryClientProvider>
  );
}

export default App;
