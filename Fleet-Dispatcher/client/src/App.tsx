import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import UrgentOrder from "@/pages/urgent-order";
import AdminApprovals from "@/pages/admin-approvals";

function ProtectedDashboard() {
  const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true";
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <Dashboard />;
}

function ProtectedUrgentOrder() {
  const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true";
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <UrgentOrder />;
}

function ProtectedAdminApprovals() {
  const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true";
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  return <AdminApprovals />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/urgent-order" component={ProtectedUrgentOrder} />
      <Route path="/admin-approvals" component={ProtectedAdminApprovals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
