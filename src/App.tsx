
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FindPlayers from "./pages/FindPlayers";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Circles from "./pages/Circles";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileCompletionCheck from "./components/ProfileCompletionCheck";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { CapacitorService } from "./services/capacitorService";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Initialize Capacitor services when app loads
    if (CapacitorService.isNative()) {
      console.log('Initializing Capacitor services...');
      CapacitorService.setupPushNotifications();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/find-players" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <FindPlayers />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/matches" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Matches />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Messages />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/circles" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Circles />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <ProfileCompletionCheck>
                    <AppLayout>
                      <Admin />
                    </AppLayout>
                  </ProfileCompletionCheck>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <PWAInstallPrompt />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
